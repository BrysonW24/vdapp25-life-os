import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Resource } from '@/types'

export function useResources(): Resource[] {
  return useLiveQuery(() => db.resources.toArray()) ?? []
}

export function useUnlockedResources(): Resource[] {
  return useLiveQuery(async () => {
    const all = await db.resources.toArray()
    return all.filter(r => r.unlockedAt !== null)
  }) ?? []
}

export async function addResource(resource: Omit<Resource, 'id'>): Promise<number> {
  return db.resources.add(resource as Resource)
}

export async function unlockResource(id: number): Promise<void> {
  await db.resources.update(id, { unlockedAt: new Date() })
}

export async function seedResources(resources: Omit<Resource, 'id'>[]): Promise<void> {
  const count = await db.resources.count()
  if (count === 0) {
    await db.resources.bulkAdd(resources as Resource[])
  }
}
