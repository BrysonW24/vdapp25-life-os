import { useMemo } from 'react'
import { subDays, format, startOfDay } from 'date-fns'
import { useAlignments } from './useIntelligence'
import { useAllHabitLogs, useActiveHabits } from './useHabits'
import { useReflections } from './useReflections'
import { useActiveGoals } from './useGoals'
import { useAllMilestones } from './useGoals'

interface CompoundingResult {
  score: number
  weeklyScores: number[]
  trend: 'up' | 'down' | 'flat'
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function useCompoundingIndex(): CompoundingResult {
  const alignments = useAlignments()
  const allLogs = useAllHabitLogs()
  const activeHabits = useActiveHabits()
  const reflections = useReflections()
  const activeGoals = useActiveGoals()
  const allMilestones = useAllMilestones()

  return useMemo(() => {
    const today = startOfDay(new Date())

    // --- Pillar alignment component (40%) ---
    const alignmentScore = alignments.length > 0
      ? alignments.reduce((sum, a) => sum + a.score, 0) / alignments.length
      : 0

    // --- Habit consistency component (30%) ---
    const last28Start = format(subDays(today, 27), 'yyyy-MM-dd')
    const todayStr = format(today, 'yyyy-MM-dd')
    const recentLogs = allLogs.filter(l => l.completed && l.date >= last28Start && l.date <= todayStr)
    const expectedPerDay = activeHabits.reduce((sum, h) => sum + h.targetDaysPerWeek / 7, 0)
    const expectedTotal = expectedPerDay * 28
    const habitScore = expectedTotal > 0
      ? clamp(Math.round((recentLogs.length / expectedTotal) * 100), 0, 100)
      : 0

    // --- Reflection frequency component (15%) ---
    const recentReflections = reflections?.filter(r => r.date >= last28Start && r.date <= todayStr) ?? []
    // Target: at least 2 reflections per week (8 in 28 days)
    const reflectionScore = clamp(Math.round((recentReflections.length / 8) * 100), 0, 100)

    // --- Goal milestone completion component (15%) ---
    const activeMilestones = allMilestones?.filter(m =>
      activeGoals?.some(g => g.id === m.goalId)
    ) ?? []
    const completedMilestones = activeMilestones.filter(m => m.completed).length
    const milestoneScore = activeMilestones.length > 0
      ? clamp(Math.round((completedMilestones / activeMilestones.length) * 100), 0, 100)
      : 0

    // --- Weighted composite ---
    const score = Math.round(
      alignmentScore * 0.4 +
      habitScore * 0.3 +
      reflectionScore * 0.15 +
      milestoneScore * 0.15
    )

    // --- 12-week sparkline ---
    const weeklyScores: number[] = []
    for (let w = 11; w >= 0; w--) {
      const weekEnd = subDays(today, w * 7)
      const weekStart = subDays(weekEnd, 6)
      const ws = format(weekStart, 'yyyy-MM-dd')
      const we = format(weekEnd, 'yyyy-MM-dd')

      const weekLogs = allLogs.filter(l => l.completed && l.date >= ws && l.date <= we)
      const weekExpected = expectedPerDay * 7
      const weekHabitScore = weekExpected > 0
        ? clamp(Math.round((weekLogs.length / weekExpected) * 100), 0, 100)
        : 0

      const weekReflections = reflections?.filter(r => r.date >= ws && r.date <= we) ?? []
      const weekReflScore = clamp(Math.round((weekReflections.length / 2) * 100), 0, 100)

      // Simplified weekly score (habit + reflection only, alignment is period-wide)
      const weekScore = Math.round(
        alignmentScore * 0.4 +
        weekHabitScore * 0.3 +
        weekReflScore * 0.15 +
        milestoneScore * 0.15
      )
      weeklyScores.push(weekScore)
    }

    // --- Trend ---
    const recentAvg = weeklyScores.slice(-3).reduce((s, v) => s + v, 0) / 3
    const olderAvg = weeklyScores.slice(0, 3).reduce((s, v) => s + v, 0) / 3
    const diff = recentAvg - olderAvg
    const trend: 'up' | 'down' | 'flat' = diff > 5 ? 'up' : diff < -5 ? 'down' : 'flat'

    return { score, weeklyScores, trend }
  }, [alignments, allLogs, activeHabits, reflections, activeGoals, allMilestones])
}
