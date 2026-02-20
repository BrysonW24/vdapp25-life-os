import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { AdvisoryAlert } from '@/types'

export function useAdvisoryAlerts(): AdvisoryAlert[] {
  return useLiveQuery(() => db.advisoryAlerts.toArray()) ?? []
}

export function useActiveAlerts(): AdvisoryAlert[] {
  return useLiveQuery(async () => {
    const all = await db.advisoryAlerts.toArray()
    return all.filter(a => a.dismissedAt === null)
  }) ?? []
}

export async function addAlert(alert: Omit<AdvisoryAlert, 'createdAt'>): Promise<string> {
  await db.advisoryAlerts.put({ ...alert, createdAt: new Date() } as AdvisoryAlert)
  return alert.id
}

export async function dismissAlert(id: string): Promise<void> {
  await db.advisoryAlerts.update(id, { dismissedAt: new Date() })
}

export async function bulkSyncAlerts(alerts: Omit<AdvisoryAlert, 'createdAt'>[]): Promise<void> {
  await db.transaction('rw', db.advisoryAlerts, async () => {
    for (const alert of alerts) {
      const existing = await db.advisoryAlerts.get(alert.id)
      if (!existing) {
        await db.advisoryAlerts.put({ ...alert, createdAt: new Date() } as AdvisoryAlert)
      }
      // Don't overwrite dismissed alerts
    }
  })
}

export async function clearDismissedAlerts(): Promise<void> {
  const dismissed = await db.advisoryAlerts.toArray()
  const ids = dismissed.filter(a => a.dismissedAt !== null).map(a => a.id)
  await db.advisoryAlerts.bulkDelete(ids)
}
