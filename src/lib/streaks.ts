import { format, subDays } from 'date-fns'
import type { HabitLog } from '@/types'

/** Count consecutive completed days backward from today for a given habit */
export function calcStreak(habitId: number, logs: HabitLog[]): number {
  const habitLogs = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
  const dateSet = new Set(habitLogs)

  let streak = 0
  let current = new Date()

  // Check today first
  const todayStr = format(current, 'yyyy-MM-dd')
  if (!dateSet.has(todayStr)) {
    // If today is not done, check if yesterday was (allow for today being in-progress)
    const yesterdayStr = format(subDays(current, 1), 'yyyy-MM-dd')
    if (!dateSet.has(yesterdayStr)) return 0
    current = subDays(current, 1)
  }

  // Count backward
  while (true) {
    const dateStr = format(current, 'yyyy-MM-dd')
    if (dateSet.has(dateStr)) {
      streak++
      current = subDays(current, 1)
    } else {
      break
    }
  }

  return streak
}

/** Get the longest streak ever for a habit */
export function calcLongestStreak(habitId: number, logs: HabitLog[]): number {
  const dates = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort()

  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      current++
      longest = Math.max(longest, current)
    } else if (diffDays > 1) {
      current = 1
    }
    // diffDays === 0: duplicate date, skip
  }

  return longest
}

/** Weekly completion rate for a habit over the last N weeks */
export function weeklyRate(habitId: number, targetDaysPerWeek: number, logs: HabitLog[], weeks: number = 4): number {
  const cutoff = format(subDays(new Date(), weeks * 7), 'yyyy-MM-dd')
  const completed = logs.filter(l => l.habitId === habitId && l.completed && l.date >= cutoff).length
  const expected = targetDaysPerWeek * weeks
  if (expected === 0) return 0
  return Math.min(1, completed / expected)
}
