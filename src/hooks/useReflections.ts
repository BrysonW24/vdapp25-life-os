import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import type { Reflection, ReflectionType } from '@/types'

export function useReflections(type?: ReflectionType): Reflection[] {
  return useLiveQuery(async () => {
    if (type) {
      return db.reflections.where('type').equals(type).reverse().sortBy('date')
    }
    return db.reflections.orderBy('date').reverse().toArray()
  }, [type]) ?? []
}

export function useRecentReflections(limit: number = 7): Reflection[] {
  return useLiveQuery(async () => {
    const all = await db.reflections.orderBy('date').reverse().toArray()
    return all.slice(0, limit)
  }, [limit]) ?? []
}

export function useTodayReflection(type: 'daily-am' | 'daily-pm'): Reflection | undefined {
  const today = format(new Date(), 'yyyy-MM-dd')
  return useLiveQuery(
    () => db.reflections
      .where('[type+date]')
      .equals([type, today])
      .first(),
    [type, today],
  )
}

export async function saveReflection(reflection: Omit<Reflection, 'id' | 'createdAt'>): Promise<number> {
  // Check if one exists for this type+date, update if so
  const existing = await db.reflections
    .where('[type+date]')
    .equals([reflection.type, reflection.date])
    .first()

  if (existing) {
    await db.reflections.update(existing.id, { ...reflection })
    return existing.id
  }
  return db.reflections.add({ ...reflection, createdAt: new Date() } as Reflection)
}

export async function updateReflection(id: number, changes: Partial<Reflection>): Promise<void> {
  await db.reflections.update(id, changes)
}

export async function deleteReflection(id: number): Promise<void> {
  await db.reflections.delete(id)
}
