import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { PerformanceSnapshot } from '@/types'

export function usePerformanceSnapshots(pillarId?: number): PerformanceSnapshot[] {
  return useLiveQuery(
    () => pillarId
      ? db.performanceSnapshots.where('pillarId').equals(pillarId).toArray()
      : db.performanceSnapshots.toArray(),
    [pillarId],
  ) ?? []
}

export function useLatestSnapshots(): PerformanceSnapshot[] {
  return useLiveQuery(async () => {
    const all = await db.performanceSnapshots.orderBy('date').reverse().toArray()
    // Get the most recent snapshot per pillar
    const seen = new Set<number>()
    return all.filter(s => {
      if (seen.has(s.pillarId)) return false
      seen.add(s.pillarId)
      return true
    })
  }) ?? []
}

export async function saveSnapshot(snapshot: Omit<PerformanceSnapshot, 'id'>): Promise<number> {
  // Upsert: check if a snapshot for this pillar+date exists
  const existing = await db.performanceSnapshots
    .where('pillarId').equals(snapshot.pillarId)
    .and(s => s.date === snapshot.date)
    .first()

  if (existing) {
    await db.performanceSnapshots.update(existing.id, snapshot)
    return existing.id
  }
  return db.performanceSnapshots.add(snapshot as PerformanceSnapshot)
}
