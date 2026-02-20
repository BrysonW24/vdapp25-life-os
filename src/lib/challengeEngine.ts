import { format, subDays, differenceInDays } from 'date-fns'
import { calcStreak } from '@/lib/streaks'
import type { PillarAlignment } from '@/lib/gapEngine'
import type {
  Identity,
  Pillar,
  Goal,
  Milestone,
  Habit,
  HabitLog,
  Reflection,
  PerformanceSnapshot,
  AdvisoryAlert,
  AlertSeverity,
  LifeSeason,
} from '@/types'

// ─── Input ───────────────────────────────────────────────────────────────────

export interface ChallengeEngineInput {
  identity: Identity | undefined
  pillars: Pillar[]
  alignments: PillarAlignment[]
  goals: Goal[]
  milestones: Milestone[]
  habits: Habit[]
  habitLogs: HabitLog[]
  reflections: Reflection[]
  previousSnapshots: PerformanceSnapshot[]
  currentSeason: LifeSeason
}

// ─── Rule helpers ────────────────────────────────────────────────────────────

function makeAlert(
  id: string,
  severity: AlertSeverity,
  pillarId: number | null,
  title: string,
  message: string,
  action: string | null = null,
): Omit<AdvisoryAlert, 'createdAt'> {
  return { id, severity, pillarId, title, message, action, dismissedAt: null }
}

// ─── Rules ───────────────────────────────────────────────────────────────────

function rulePillarDrift(
  alignments: PillarAlignment[],
  previousSnapshots: PerformanceSnapshot[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  const alerts: Omit<AdvisoryAlert, 'createdAt'>[] = []
  for (const a of alignments) {
    const prev = previousSnapshots.find(s => s.pillarId === a.pillarId)
    if (prev && prev.score - a.score > 20) {
      alerts.push(makeAlert(
        `drift-${a.pillarId}`,
        'challenge',
        a.pillarId,
        `${a.pillarName}: Major Drift Detected`,
        `Your ${a.pillarName} score dropped from ${prev.score} to ${a.score} since last month. This is a ${prev.score - a.score} point decline. What changed?`,
        'Review habits',
      ))
    }
  }
  return alerts
}

function ruleStreakBroken(
  habits: Habit[],
  habitLogs: HabitLog[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  const alerts: Omit<AdvisoryAlert, 'createdAt'>[] = []
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  for (const habit of habits) {
    if (habit.archivedAt !== null) continue

    // Check if yesterday was missed but there was a streak before that
    const yesterdayLog = habitLogs.find(l => l.habitId === habit.id && l.date === yesterday && l.completed)
    if (yesterdayLog) continue // Not broken

    // Calculate streak ending day before yesterday
    const previousLogs = habitLogs.filter(l => l.habitId === habit.id && l.date < yesterday)
    const streak = calcStreak(habit.id, [...previousLogs, { id: 0, habitId: habit.id, date: yesterday, completed: false, note: '' }])

    // Only alert if streak was meaningful (>7 days) and just broke
    if (streak === 0) {
      // Check what the streak was before yesterday
      const logsBeforeYesterday = habitLogs.filter(l => l.habitId === habit.id && l.date < yesterday && l.completed)
      if (logsBeforeYesterday.length < 7) continue

      // Reconstruct previous streak
      let prevStreak = 0
      let checkDate = subDays(new Date(), 2)
      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        const had = habitLogs.some(l => l.habitId === habit.id && l.date === dateStr && l.completed)
        if (!had) break
        prevStreak++
        checkDate = subDays(checkDate, 1)
      }

      if (prevStreak >= 7) {
        alerts.push(makeAlert(
          `streak-broken-${habit.id}`,
          'warning',
          habit.pillarId,
          `${habit.title}: ${prevStreak}-Day Streak Broken`,
          `You built a ${prevStreak}-day streak on "${habit.title}" and missed yesterday. One miss is a slip. Two is a pattern. Get back on track today.`,
          'Log today',
        ))
      }
    }
  }
  return alerts
}

function ruleStandardViolation(
  alignments: PillarAlignment[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  const alerts: Omit<AdvisoryAlert, 'createdAt'>[] = []
  for (const a of alignments) {
    for (const sa of a.standards) {
      if (sa.score < 50 && sa.target > 0) {
        alerts.push(makeAlert(
          `standard-viol-${sa.standard.id}`,
          'challenge',
          a.pillarId,
          `Standard Violation: ${sa.standard.label}`,
          `Your "${sa.standard.label}" standard is at ${sa.score}% — observed ${sa.label}. Below 50% is not drift, it's avoidance. This is the gap the system was built to surface.`,
        ))
      }
    }
  }
  return alerts
}

function ruleNoReflection(
  reflections: Reflection[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  if (reflections.length === 0) {
    return [makeAlert(
      'no-reflection-ever',
      'warning',
      null,
      'No Reflections Recorded',
      'Self-awareness is the foundation of this system. Start with a morning reflection to set daily intentions.',
      'Reflect now',
    )]
  }

  const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date))
  const latestDate = new Date(sorted[0].date)
  const daysSince = differenceInDays(new Date(), latestDate)

  if (daysSince >= 7) {
    return [makeAlert(
      'no-reflection-7d',
      'warning',
      null,
      `No Reflection in ${daysSince} Days`,
      `You last reflected ${daysSince} days ago. The advisory layer loses accuracy without regular input. The system works when you work it.`,
      'Reflect now',
    )]
  }
  return []
}

function ruleGoalStale(
  goals: Goal[],
  milestones: Milestone[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  const alerts: Omit<AdvisoryAlert, 'createdAt'>[] = []
  const now = new Date()

  for (const goal of goals) {
    if (goal.status !== 'active') continue
    const daysSinceCreated = differenceInDays(now, new Date(goal.createdAt))
    if (daysSinceCreated < 90) continue

    const goalMilestones = milestones.filter(m => m.goalId === goal.id)
    const completedMs = goalMilestones.filter(m => m.completed)

    // If there are milestones and none completed, or no milestones
    if (goalMilestones.length === 0 || completedMs.length === 0) {
      alerts.push(makeAlert(
        `goal-stale-${goal.id}`,
        'warning',
        goal.pillarId,
        `Stale Goal: ${goal.title}`,
        `"${goal.title}" has been active for ${daysSinceCreated} days with no milestone progress. A goal without action is just a wish. Break it down or archive it.`,
        'Review goal',
      ))
    }
  }
  return alerts
}

function ruleValueBehaviorMismatch(
  identity: Identity | undefined,
  alignments: PillarAlignment[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  if (!identity) return []
  const alerts: Omit<AdvisoryAlert, 'createdAt'>[] = []

  // Map values to likely pillar names
  const VALUE_PILLAR_MAP: Record<string, string[]> = {
    'Health': ['health', 'fitness', 'body', 'physical'],
    'Wealth': ['finance', 'money', 'wealth', 'financial'],
    'Growth': ['learning', 'growth', 'education', 'development'],
    'Mastery': ['learning', 'mastery', 'craft', 'skill'],
    'Family': ['family', 'relationships', 'partner', 'social'],
    'Discipline': ['health', 'fitness', 'habits'],
    'Creativity': ['creative', 'creativity', 'art', 'design'],
  }

  for (const value of identity.coreValues) {
    const keywords = VALUE_PILLAR_MAP[value]
    if (!keywords) continue

    for (const a of alignments) {
      const pillarNameLower = a.pillarName.toLowerCase()
      if (keywords.some(k => pillarNameLower.includes(k)) && a.score < 40) {
        alerts.push(makeAlert(
          `value-mismatch-${value}-${a.pillarId}`,
          'challenge',
          a.pillarId,
          `Value-Behavior Gap: "${value}"`,
          `You declared "${value}" as a core value, but your ${a.pillarName} pillar is at ${a.score}%. If it's truly a value, your behavior should reflect it. If it's aspirational, be honest about that.`,
        ))
      }
    }
  }
  return alerts
}

function ruleOverallRegression(
  alignments: PillarAlignment[],
  previousSnapshots: PerformanceSnapshot[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  if (alignments.length === 0 || previousSnapshots.length === 0) return []

  const currentAvg = alignments.reduce((s, a) => s + a.score, 0) / alignments.length
  const prevScores = previousSnapshots.map(s => s.score)
  const prevAvg = prevScores.reduce((s, v) => s + v, 0) / prevScores.length

  if (currentAvg < prevAvg - 10) {
    return [makeAlert(
      'overall-regression',
      'challenge',
      null,
      'Overall Alignment Declining',
      `Your overall score dropped from ${Math.round(prevAvg)} to ${Math.round(currentAvg)}. Multiple pillars are trending down. This isn't a bad day — it's a systemic pattern. Audit your commitments.`,
      'Review all pillars',
    )]
  }
  return []
}

function ruleWeekendDrift(
  reflections: Reflection[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  // Check if PM reflections on Sundays have lower mood
  const pmReflections = reflections.filter(r => r.type === 'daily-pm')
  if (pmReflections.length < 4) return []

  const sundayReflections = pmReflections.filter(r => {
    const day = new Date(r.date).getDay()
    return day === 0
  })
  const otherReflections = pmReflections.filter(r => {
    const day = new Date(r.date).getDay()
    return day !== 0
  })

  if (sundayReflections.length < 2 || otherReflections.length < 2) return []

  const sundayAvgMood = sundayReflections.reduce((s, r) => s + r.mood, 0) / sundayReflections.length
  const otherAvgMood = otherReflections.reduce((s, r) => s + r.mood, 0) / otherReflections.length

  if (otherAvgMood - sundayAvgMood > 2) {
    return [makeAlert(
      'weekend-drift',
      'insight',
      null,
      'Pattern: Sunday Mood Drop',
      `Your average Sunday evening mood (${sundayAvgMood.toFixed(1)}) is significantly lower than other days (${otherAvgMood.toFixed(1)}). This may indicate anticipatory anxiety about the week ahead. Investigate.`,
    )]
  }
  return []
}

function ruleAllAligned(
  alignments: PillarAlignment[],
): Omit<AdvisoryAlert, 'createdAt'>[] {
  if (alignments.length < 2) return []
  const allAbove80 = alignments.every(a => a.score >= 80)
  if (allAbove80) {
    return [makeAlert(
      'all-aligned',
      'opportunity',
      null,
      'All Pillars Aligned — Raise the Bar',
      'Every pillar is scoring above 80%. You\'re operating at a high level. Consider: raise your standards, add a new pillar, or shift seasons to Expansion or Domination.',
      'Review standards',
    )]
  }
  return []
}

function ruleSeasonMismatch(
  alignments: PillarAlignment[],
  currentSeason: LifeSeason,
): Omit<AdvisoryAlert, 'createdAt'>[] {
  if (alignments.length === 0) return []
  const avg = alignments.reduce((s, a) => s + a.score, 0) / alignments.length

  if (currentSeason === 'domination' && avg < 50) {
    return [makeAlert(
      'season-mismatch',
      'insight',
      null,
      'Season Mismatch: Domination Mode',
      `You're in Domination season but your overall score is ${Math.round(avg)}%. Domination assumes a strong foundation. Consider switching to Foundation or Recovery until your base is solid.`,
      'Change season',
    )]
  }
  if (currentSeason === 'expansion' && avg < 40) {
    return [makeAlert(
      'season-mismatch-expansion',
      'insight',
      null,
      'Season Mismatch: Expansion Mode',
      `You're in Expansion season but your overall score is ${Math.round(avg)}%. You can't expand from a crumbling base. Stabilize first.`,
      'Change season',
    )]
  }
  return []
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export function computeAlerts(input: ChallengeEngineInput): Omit<AdvisoryAlert, 'createdAt'>[] {
  const {
    identity, alignments, goals, milestones,
    habits, habitLogs, reflections, previousSnapshots, currentSeason,
  } = input

  return [
    ...rulePillarDrift(alignments, previousSnapshots),
    ...ruleStreakBroken(habits, habitLogs),
    ...ruleStandardViolation(alignments),
    ...ruleNoReflection(reflections),
    ...ruleGoalStale(goals, milestones),
    ...ruleValueBehaviorMismatch(identity, alignments),
    ...ruleOverallRegression(alignments, previousSnapshots),
    ...ruleWeekendDrift(reflections),
    ...ruleAllAligned(alignments),
    ...ruleSeasonMismatch(alignments, currentSeason),
  ]
}
