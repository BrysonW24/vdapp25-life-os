import Dexie, { type EntityTable } from 'dexie'
import type {
  Identity, Pillar, Standard,
  Goal, Milestone, Habit, HabitLog,
  Reflection, PerformanceSnapshot, AdvisoryAlert, Resource,
} from '@/types'

export class LifeOSDB extends Dexie {
  identity!: EntityTable<Identity, 'id'>
  pillars!: EntityTable<Pillar, 'id'>
  standards!: EntityTable<Standard, 'id'>
  goals!: EntityTable<Goal, 'id'>
  milestones!: EntityTable<Milestone, 'id'>
  habits!: EntityTable<Habit, 'id'>
  habitLogs!: EntityTable<HabitLog, 'id'>
  reflections!: EntityTable<Reflection, 'id'>
  performanceSnapshots!: EntityTable<PerformanceSnapshot, 'id'>
  advisoryAlerts!: EntityTable<AdvisoryAlert, 'id'>
  resources!: EntityTable<Resource, 'id'>

  constructor() {
    super('LifeOSDB')
    this.version(2).stores({
      identity: '++id',
      pillars: '++id, identityId, order',
      standards: '++id, pillarId',
      goals: '++id, pillarId, status',
      milestones: '++id, goalId',
      habits: '++id, pillarId',
      habitLogs: '++id, habitId, date, [habitId+date]',
      reflections: '++id, type, date, [type+date]',
      performanceSnapshots: '++id, pillarId, date',
      advisoryAlerts: 'id, pillarId, severity',
      resources: '++id',
    })
  }
}

export const db = new LifeOSDB()
