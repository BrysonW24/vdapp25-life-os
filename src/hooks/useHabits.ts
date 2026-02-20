import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import type { Habit, HabitLog } from '@/types'

export function useHabits(): Habit[] {
  return useLiveQuery(() => db.habits.toArray()) ?? []
}

export function useActiveHabits(): Habit[] {
  return useLiveQuery(async () => {
    const all = await db.habits.toArray()
    return all.filter(h => h.archivedAt === null)
  }) ?? []
}

export function useHabitLogs(dateRange: { from: string; to: string }): HabitLog[] {
  return useLiveQuery(
    () => db.habitLogs.where('date').between(dateRange.from, dateRange.to, true, true).toArray(),
    [dateRange.from, dateRange.to],
  ) ?? []
}

export function useTodayLogs(): HabitLog[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  return useLiveQuery(
    () => db.habitLogs.where('date').equals(today).toArray(),
    [today],
  ) ?? []
}

export function useAllHabitLogs(): HabitLog[] {
  return useLiveQuery(() => db.habitLogs.toArray()) ?? []
}

export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'archivedAt'>): Promise<number> {
  return db.habits.add({ ...habit, archivedAt: null, createdAt: new Date() } as Habit)
}

export async function updateHabit(id: number, changes: Partial<Habit>): Promise<void> {
  await db.habits.update(id, changes)
}

export async function archiveHabit(id: number): Promise<void> {
  await db.habits.update(id, { archivedAt: new Date() })
}

export async function deleteHabit(id: number): Promise<void> {
  await db.transaction('rw', [db.habits, db.habitLogs], async () => {
    await db.habitLogs.where('habitId').equals(id).delete()
    await db.habits.delete(id)
  })
}

export async function toggleHabitLog(habitId: number, date: string): Promise<void> {
  const existing = await db.habitLogs
    .where('[habitId+date]')
    .equals([habitId, date])
    .first()

  if (existing) {
    if (existing.completed) {
      await db.habitLogs.delete(existing.id)
    } else {
      await db.habitLogs.update(existing.id, { completed: true })
    }
  } else {
    await db.habitLogs.add({ habitId, date, completed: true, note: '' } as HabitLog)
  }
}
