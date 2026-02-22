import { db } from '@/lib/db'
import { calcStreak } from '@/lib/streaks'

export async function buildCoachContext(
  season: string,
  mindsetMode: string,
  userName: string,
): Promise<string> {
  const [identity, pillars, standards, goals, habits, allLogs, reflections, alerts] =
    await Promise.all([
      db.identity.toCollection().first(),
      db.pillars.orderBy('order').toArray(),
      db.standards.toArray(),
      db.goals.where('status').equals('active').toArray(),
      db.habits.filter(h => !h.archivedAt).toArray(),
      db.habitLogs.toArray(),
      db.reflections.orderBy('createdAt').reverse().limit(7).toArray(),
      db.advisoryAlerts.filter(a => !a.dismissedAt).toArray(),
    ])

  const lines: string[] = []

  lines.push(`You are a high-performance life coach built into Life OS, a personal operating system.`)
  lines.push(`Be direct, insightful, and context-aware. Reference specific data from the user's life below.`)
  lines.push(`Avoid generic advice — every response should be grounded in their actual numbers and stated commitments.`)
  lines.push(`Current season: ${season}. Mindset mode: ${mindsetMode}. User name: ${userName || 'unnamed'}.`)
  lines.push('')

  if (identity) {
    lines.push('## Identity')
    if (identity.visionStatement) lines.push(`Vision: ${identity.visionStatement}`)
    if (identity.missionStatement) lines.push(`Mission: ${identity.missionStatement}`)
    if (identity.coreValues.length) lines.push(`Core values: ${identity.coreValues.join(', ')}`)
    if (identity.personalityType) lines.push(`Personality: ${identity.personalityType}`)
    if (identity.coachTone) lines.push(`Coaching tone preference: ${identity.coachTone}`)
    lines.push('')
  }

  if (pillars.length) {
    lines.push('## Life Pillars & Standards')
    for (const pillar of pillars) {
      const pillarStandards = standards.filter(s => s.pillarId === pillar.id)
      lines.push(`### ${pillar.name}`)
      if (pillar.description) lines.push(`  ${pillar.description}`)
      for (const std of pillarStandards) {
        lines.push(`  - Standard: ${std.label} (target: ${std.target} ${std.unit})`)
      }
    }
    lines.push('')
  }

  if (goals.length) {
    lines.push('## Active Goals')
    for (const goal of goals) {
      const pillar = pillars.find(p => p.id === goal.pillarId)
      const due = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'no deadline'
      lines.push(`- ${goal.title} (${pillar?.name ?? 'unlinked'}, due: ${due})`)
      if (goal.description) lines.push(`  ${goal.description}`)
    }
    lines.push('')
  }

  if (habits.length) {
    lines.push('## Habits & Streaks')
    const today = new Date().toISOString().slice(0, 10)
    const todayLogs = allLogs.filter(l => l.date === today)
    for (const habit of habits) {
      const streak = calcStreak(habit.id, allLogs)
      const doneToday = todayLogs.some(l => l.habitId === habit.id && l.completed)
      const pillar = pillars.find(p => p.id === habit.pillarId)
      lines.push(`- ${habit.title}: ${habit.targetDaysPerWeek}x/week, streak: ${streak} days, today: ${doneToday ? 'done' : 'not done'} (${pillar?.name ?? 'unlinked'})`)
    }
    lines.push('')
  }

  if (reflections.length) {
    lines.push('## Recent Reflections (last 7)')
    for (const r of reflections) {
      lines.push(`${r.date} [${r.type}] energy: ${r.energyLevel}/10, mood: ${r.mood}/10`)
      const responses = Object.values(r.responses).filter(v => v?.trim())
      if (responses.length) lines.push(`  Notable: ${responses[0].slice(0, 120)}`)
    }
    lines.push('')
  }

  if (alerts.length) {
    lines.push('## Active Advisory Alerts')
    for (const alert of alerts) {
      lines.push(`- [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('Respond conversationally. Be specific. Reference their data. Keep responses concise unless asked for depth.')

  return lines.join('\n')
}
