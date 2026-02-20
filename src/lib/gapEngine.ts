import { subDays, format, differenceInCalendarWeeks } from 'date-fns'
import type { Pillar, Standard, Habit, HabitLog, Reflection, AlignmentState, PerformanceSnapshot } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StandardAlignment {
  standard: Standard
  observed: number
  target: number
  score: number          // 0–100
  label: string          // human-readable observed vs target
}

export interface PillarAlignment {
  pillarId: number
  pillarName: string
  pillarColor: string
  score: number          // 0–100 average of standard scores
  alignmentState: AlignmentState
  trend: 'up' | 'down' | 'flat'
  standards: StandardAlignment[]
  habitCount: number
  completedHabitCount: number
}

export interface DateRange {
  from: string   // yyyy-MM-dd
  to: string     // yyyy-MM-dd
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function classifyState(score: number, trend: 'up' | 'down' | 'flat'): AlignmentState {
  if (score >= 80) return 'aligned'
  if (score >= 60 && trend === 'up') return 'improving'
  if (score >= 40) return 'drifting'
  if (score < 40 && trend === 'down') return 'regressing'
  return 'avoiding'
}

function computeTrend(
  currentScore: number,
  previousSnapshots: PerformanceSnapshot[],
  pillarId: number,
): 'up' | 'down' | 'flat' {
  const prev = previousSnapshots.find(s => s.pillarId === pillarId)
  if (!prev) return 'flat'
  const diff = currentScore - prev.score
  if (diff > 5) return 'up'
  if (diff < -5) return 'down'
  return 'flat'
}

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * For a given standard, score it based on related habit logs.
 * A standard's score = (completed habit days in period / expected days) * 100
 *
 * We match habits to standards by pillarId — every habit under a pillar
 * contributes to every standard under that pillar (averaged).
 */
function scoreStandard(
  standard: Standard,
  pillarHabits: Habit[],
  habitLogs: HabitLog[],
  range: DateRange,
): StandardAlignment {
  if (pillarHabits.length === 0) {
    return {
      standard,
      observed: 0,
      target: standard.target,
      score: 0,
      label: `0 / ${standard.target} ${standard.unit}`,
    }
  }

  // Calculate weeks in period for scaling
  const from = new Date(range.from)
  const to = new Date(range.to)
  const weeks = Math.max(1, differenceInCalendarWeeks(to, from, { weekStartsOn: 1 }) + 1)

  // Total completed logs for pillar habits in range
  let totalCompleted = 0
  let totalExpected = 0

  for (const habit of pillarHabits) {
    const logsForHabit = habitLogs.filter(
      l => l.habitId === habit.id && l.completed && l.date >= range.from && l.date <= range.to,
    )
    totalCompleted += logsForHabit.length
    totalExpected += habit.targetDaysPerWeek * weeks
  }

  // Scale observed to the standard's target unit
  // e.g. if standard.target = 4 (workouts/week), observed = completed per week
  const observedPerWeek = totalCompleted / weeks / Math.max(1, pillarHabits.length)
  const expectedRate = totalExpected > 0 ? totalCompleted / totalExpected : 0
  const score = clamp(Math.round(expectedRate * 100), 0, 100)

  const obsDisplay = observedPerWeek.toFixed(1)

  return {
    standard,
    observed: Math.round(observedPerWeek * 10) / 10,
    target: standard.target,
    score,
    label: `${obsDisplay} / ${standard.target} ${standard.unit}`,
  }
}

export interface ComputeAlignmentsInput {
  pillars: Pillar[]
  standards: Standard[]
  habits: Habit[]
  habitLogs: HabitLog[]
  reflections: Reflection[]
  previousSnapshots: PerformanceSnapshot[]
  dateRange: DateRange
}

export function computeAlignments(input: ComputeAlignmentsInput): PillarAlignment[] {
  const { pillars, standards, habits, habitLogs, previousSnapshots, dateRange } = input

  return pillars.map(pillar => {
    const pillarStandards = standards.filter(s => s.pillarId === pillar.id)
    const pillarHabits = habits.filter(h => h.pillarId === pillar.id && h.archivedAt === null)

    // Score each standard
    const standardAlignments = pillarStandards.map(s =>
      scoreStandard(s, pillarHabits, habitLogs, dateRange),
    )

    // Pillar score = average of standard scores, or habit completion rate if no standards
    let score: number
    if (standardAlignments.length > 0) {
      score = Math.round(standardAlignments.reduce((sum, sa) => sum + sa.score, 0) / standardAlignments.length)
    } else if (pillarHabits.length > 0) {
      // Fallback: score based on raw habit completion
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)
      const weeks = Math.max(1, differenceInCalendarWeeks(to, from, { weekStartsOn: 1 }) + 1)
      let completed = 0
      let expected = 0
      for (const h of pillarHabits) {
        completed += habitLogs.filter(l => l.habitId === h.id && l.completed && l.date >= dateRange.from && l.date <= dateRange.to).length
        expected += h.targetDaysPerWeek * weeks
      }
      score = expected > 0 ? clamp(Math.round((completed / expected) * 100), 0, 100) : 0
    } else {
      score = 0
    }

    const trend = computeTrend(score, previousSnapshots, pillar.id)
    const alignmentState = classifyState(score, trend)

    // Count habits completed today for this pillar
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayCompleted = pillarHabits.filter(h =>
      habitLogs.some(l => l.habitId === h.id && l.date === today && l.completed),
    ).length

    return {
      pillarId: pillar.id,
      pillarName: pillar.name,
      pillarColor: pillar.color,
      score,
      alignmentState,
      trend,
      standards: standardAlignments,
      habitCount: pillarHabits.length,
      completedHabitCount: todayCompleted,
    }
  })
}

/**
 * Get the default date range: last 4 weeks
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date()
  const to = format(today, 'yyyy-MM-dd')
  const from = format(subDays(today, 27), 'yyyy-MM-dd')
  return { from, to }
}

/**
 * Get previous month's date range for trend comparison
 */
export function getPreviousDateRange(): DateRange {
  const today = new Date()
  const to = format(subDays(today, 28), 'yyyy-MM-dd')
  const from = format(subDays(today, 55), 'yyyy-MM-dd')
  return { from, to }
}
