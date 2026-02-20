import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Identity, Pillar, Standard, CoachTone, PersonalityType } from '@/types'

export function useIdentity(): Identity | undefined {
  return useLiveQuery(() => db.identity.toCollection().first())
}

export function usePillars(identityId?: number): Pillar[] {
  return useLiveQuery(
    () => identityId
      ? db.pillars.where('identityId').equals(identityId).sortBy('order')
      : db.pillars.orderBy('order').toArray(),
    [identityId],
  ) ?? []
}

export function useStandards(pillarId?: number): Standard[] {
  return useLiveQuery(
    () => pillarId
      ? db.standards.where('pillarId').equals(pillarId).toArray()
      : db.standards.toArray(),
    [pillarId],
  ) ?? []
}

export function useAllStandards(): Standard[] {
  return useLiveQuery(() => db.standards.toArray()) ?? []
}

export async function saveIdentity(data: Omit<Identity, 'id' | 'updatedAt'>): Promise<number> {
  const existing = await db.identity.toCollection().first()
  if (existing) {
    await db.identity.update(existing.id, { ...data, updatedAt: new Date() })
    return existing.id
  }
  return db.identity.add({ ...data, updatedAt: new Date() } as Identity)
}

export async function updateIdentity(id: number, changes: Partial<Identity>): Promise<void> {
  await db.identity.update(id, { ...changes, updatedAt: new Date() })
}

export async function addPillar(pillar: Omit<Pillar, 'id'>): Promise<number> {
  return db.pillars.add(pillar as Pillar)
}

export async function updatePillar(id: number, changes: Partial<Pillar>): Promise<void> {
  await db.pillars.update(id, changes)
}

export async function deletePillar(id: number): Promise<void> {
  await db.transaction('rw', [db.pillars, db.standards], async () => {
    await db.standards.where('pillarId').equals(id).delete()
    await db.pillars.delete(id)
  })
}

export async function addStandard(standard: Omit<Standard, 'id'>): Promise<number> {
  return db.standards.add(standard as Standard)
}

export async function updateStandard(id: number, changes: Partial<Standard>): Promise<void> {
  await db.standards.update(id, changes)
}

export async function deleteStandard(id: number): Promise<void> {
  await db.standards.delete(id)
}

export async function saveIdentityFull(data: {
  visionStatement: string
  lifeView: string
  workView: string
  missionStatement: string
  coreValues: string[]
  personalityType: PersonalityType | null
  coachTone: CoachTone
}): Promise<number> {
  return saveIdentity(data)
}
