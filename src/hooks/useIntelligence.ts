import { useMemo } from 'react'
import { usePillars, useIdentity, useAllStandards } from '@/hooks/useIdentity'
import { useActiveHabits, useAllHabitLogs } from '@/hooks/useHabits'
import { useReflections } from '@/hooks/useReflections'
import { useLatestSnapshots } from '@/hooks/usePerformance'
import { computeAlignments, getDefaultDateRange } from '@/lib/gapEngine'
import type { PillarAlignment } from '@/lib/gapEngine'

export function useAlignments(): PillarAlignment[] {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const standards = useAllStandards()
  const habits = useActiveHabits()
  const habitLogs = useAllHabitLogs()
  const reflections = useReflections()
  const previousSnapshots = useLatestSnapshots()

  return useMemo(() => {
    if (pillars.length === 0) return []

    const dateRange = getDefaultDateRange()

    return computeAlignments({
      pillars,
      standards,
      habits,
      habitLogs,
      reflections,
      previousSnapshots,
      dateRange,
    })
  }, [pillars, standards, habits, habitLogs, reflections, previousSnapshots])
}

export function useOverallScore(): number {
  const alignments = useAlignments()
  if (alignments.length === 0) return 0
  return Math.round(alignments.reduce((sum, a) => sum + a.score, 0) / alignments.length)
}
