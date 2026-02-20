import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Goal, GoalStatus, Milestone } from '@/types'

export function useGoals(filters?: { pillarId?: number; status?: GoalStatus }): Goal[] {
  return useLiveQuery(async () => {
    let collection = db.goals.toCollection()
    if (filters?.status) {
      collection = db.goals.where('status').equals(filters.status)
    }
    const all = await collection.toArray()
    if (filters?.pillarId) {
      return all.filter(g => g.pillarId === filters.pillarId)
    }
    return all
  }, [filters?.pillarId, filters?.status]) ?? []
}

export function useActiveGoals(): Goal[] {
  return useLiveQuery(
    () => db.goals.where('status').equals('active').toArray(),
  ) ?? []
}

export function useMilestones(goalId: number): Milestone[] {
  return useLiveQuery(
    () => db.milestones.where('goalId').equals(goalId).toArray(),
    [goalId],
  ) ?? []
}

export function useAllMilestones(): Milestone[] {
  return useLiveQuery(() => db.milestones.toArray()) ?? []
}

export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<number> {
  return db.goals.add({ ...goal, createdAt: new Date() } as Goal)
}

export async function updateGoal(id: number, changes: Partial<Goal>): Promise<void> {
  await db.goals.update(id, changes)
}

export async function deleteGoal(id: number): Promise<void> {
  await db.transaction('rw', [db.goals, db.milestones], async () => {
    await db.milestones.where('goalId').equals(id).delete()
    await db.goals.delete(id)
  })
}

export async function addMilestone(milestone: Omit<Milestone, 'id'>): Promise<number> {
  return db.milestones.add(milestone as Milestone)
}

export async function toggleMilestone(id: number): Promise<void> {
  const ms = await db.milestones.get(id)
  if (ms) {
    await db.milestones.update(id, {
      completed: !ms.completed,
      completedAt: ms.completed ? null : new Date(),
    })
  }
}

export async function deleteMilestone(id: number): Promise<void> {
  await db.milestones.delete(id)
}
