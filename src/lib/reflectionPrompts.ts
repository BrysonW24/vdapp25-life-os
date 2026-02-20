import type { ReflectionType } from '@/types'

export interface ReflectionPrompt {
  key: string
  question: string
}

const AM_PROMPTS: ReflectionPrompt[] = [
  { key: 'am_priority', question: 'What is the most important thing I will accomplish today?' },
  { key: 'am_winning', question: 'What does winning today look like?' },
  { key: 'am_avoiding', question: 'What is one area I am currently avoiding — and why?' },
  { key: 'am_standards', question: 'How am I showing up against my stated standards?' },
]

const PM_PROMPTS: ReflectionPrompt[] = [
  { key: 'pm_accomplished', question: 'What did I accomplish today that mattered?' },
  { key: 'pm_underperform', question: 'Where did I underperform — and what caused it?' },
  { key: 'pm_learned', question: 'What did I learn today?' },
  { key: 'pm_proud', question: 'Am I proud of how I showed up?' },
]

const WEEKLY_PROMPTS: ReflectionPrompt[] = [
  { key: 'wk_patterns', question: 'What patterns did I notice this week?' },
  { key: 'wk_alignment', question: 'Where did I operate in alignment? Where did I drift?' },
  { key: 'wk_change', question: 'What is the most important thing to change next week?' },
  { key: 'wk_avoiding', question: 'What am I avoiding that I need to face?' },
  { key: 'wk_gratitude', question: 'What am I grateful for this week?' },
]

const MONTHLY_PROMPTS: ReflectionPrompt[] = [
  { key: 'mo_win', question: 'What was my biggest win this month?' },
  { key: 'mo_pattern', question: 'What pattern do I keep repeating that does not serve me?' },
  { key: 'mo_replay', question: 'What would I do differently if I replayed this month?' },
  { key: 'mo_face', question: 'What is one thing I am avoiding that I need to face?' },
  { key: 'mo_growth', question: 'In what area did I grow the most? The least?' },
]

const QUARTERLY_PROMPTS: ReflectionPrompt[] = [
  { key: 'q_performance', question: 'For each pillar: How did I perform against my declared standard?' },
  { key: 'q_lesson', question: 'What was my most important lesson this quarter?' },
  { key: 'q_mountain', question: 'What is my one mountain for next quarter?' },
  { key: 'q_identity', question: 'Am I the person I said I would be? Rate my overall alignment.' },
  { key: 'q_honest', question: 'What uncomfortable truth am I not acknowledging?' },
]

const PROMPT_MAP: Record<ReflectionType, ReflectionPrompt[]> = {
  'daily-am': AM_PROMPTS,
  'daily-pm': PM_PROMPTS,
  'weekly': WEEKLY_PROMPTS,
  'monthly': MONTHLY_PROMPTS,
  'quarterly': QUARTERLY_PROMPTS,
}

export function getPrompts(type: ReflectionType): ReflectionPrompt[] {
  return PROMPT_MAP[type]
}

export const REFLECTION_TYPE_LABELS: Record<ReflectionType, string> = {
  'daily-am': 'Morning',
  'daily-pm': 'Evening',
  'weekly': 'Weekly',
  'monthly': 'Monthly',
  'quarterly': 'Quarterly',
}
