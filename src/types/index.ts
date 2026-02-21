// ─── System ──────────────────────────────────────────────────────────────────

export type MindsetMode = 'terminal' | 'alignment' | 'arena' | 'command-center'

export interface CompassMapping {
  axis: 'B' | 'E' | 'S' | 'W'
  label: string        // e.g. "Builder", "Energy", "Social", "Wealth"
  pillarIds: number[]  // which pillars map to this axis
}

// ─── Identity ─────────────────────────────────────────────────────────────────

export type AlignmentState = 'aligned' | 'drifting' | 'avoiding' | 'improving' | 'regressing'

export type PersonalityType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export type CoachTone = 'rational' | 'stoic' | 'athletic' | 'philosophical' | 'adaptive'

export type LifeSeason = 'foundation' | 'expansion' | 'domination' | 'exploration' | 'recovery' | 'reinvention'

export interface Identity {
  id: number
  visionStatement: string
  lifeView: string
  workView: string
  missionStatement: string
  coreValues: string[]   // max 7
  personalityType: PersonalityType | null
  coachTone: CoachTone
  updatedAt: Date
}

export interface Pillar {
  id: number
  identityId: number
  name: string
  description: string
  color: string
  order: number
}

export interface Standard {
  id: number
  pillarId: number
  label: string          // e.g. "4 workouts per week"
  metric: string         // e.g. "workouts_per_week"
  target: number
  unit: string           // e.g. "per week", "% savings rate", "books/year"
}

// ─── Execution ────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'

export interface Goal {
  id: number
  pillarId: number | null
  title: string
  description: string
  targetDate: Date | null
  status: GoalStatus
  createdAt: Date
}

export interface Milestone {
  id: number
  goalId: number
  title: string
  completed: boolean
  completedAt: Date | null
}

export interface Habit {
  id: number
  pillarId: number | null
  title: string
  description: string
  frequency: HabitFrequency
  targetDaysPerWeek: number
  color: string
  archivedAt: Date | null
  createdAt: Date
}

export interface HabitLog {
  id: number
  habitId: number
  date: string   // 'yyyy-MM-dd'
  completed: boolean
  note: string
}

// ─── Reflection ───────────────────────────────────────────────────────────────

export type ReflectionType = 'daily-am' | 'daily-pm' | 'weekly' | 'monthly' | 'quarterly'

export interface Reflection {
  id: number
  type: ReflectionType
  date: string   // 'yyyy-MM-dd'
  responses: Record<string, string>  // prompt key → answer
  energyLevel: number   // 1–10
  mood: number          // 1–10
  note: string
  createdAt: Date
}

// ─── Intelligence ─────────────────────────────────────────────────────────────

export interface PerformanceSnapshot {
  id: number
  pillarId: number
  date: string   // 'yyyy-MM'
  alignmentState: AlignmentState
  score: number     // 0–100
  observed: number  // observed value
  target: number
  note: string
}

// ─── Advisory ─────────────────────────────────────────────────────────────────

export type AlertSeverity = 'insight' | 'challenge' | 'warning' | 'opportunity'

export interface AdvisoryAlert {
  id: string
  severity: AlertSeverity
  pillarId: number | null
  title: string
  message: string
  action: string | null    // CTA text
  dismissedAt: Date | null
  createdAt: Date
}

// ─── Resources ────────────────────────────────────────────────────────────────

export interface Resource {
  id: number
  title: string
  author: string
  type: 'book' | 'article' | 'course' | 'video'
  summary: string
  keyPrinciples: string[]
  relevantPillarIds: number[]
  unlockedAt: Date | null
}
