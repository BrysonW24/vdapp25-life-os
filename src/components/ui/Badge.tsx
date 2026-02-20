import { clsx } from 'clsx'
import type { AlignmentState, AlertSeverity, GoalStatus } from '@/types'

const ALIGNMENT_STYLES: Record<AlignmentState, string> = {
  aligned: 'bg-emerald-500/15 text-emerald-400',
  improving: 'bg-blue-500/15 text-blue-400',
  drifting: 'bg-amber-500/15 text-amber-400',
  avoiding: 'bg-red-500/15 text-red-400',
  regressing: 'bg-red-500/15 text-red-400',
}

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  insight: 'bg-violet-500/15 text-violet-400',
  challenge: 'bg-red-500/15 text-red-400',
  warning: 'bg-amber-500/15 text-amber-400',
  opportunity: 'bg-blue-500/15 text-blue-400',
}

const STATUS_STYLES: Record<GoalStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  completed: 'bg-violet-500/15 text-violet-400',
  paused: 'bg-amber-500/15 text-amber-400',
  archived: 'bg-[#2d2d4e] text-[#606080]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'alignment' | 'severity' | 'status' | 'custom'
  value?: AlignmentState | AlertSeverity | GoalStatus
  color?: string
  className?: string
}

export function Badge({ children, variant = 'custom', value, color, className }: BadgeProps) {
  let style = ''
  if (variant === 'alignment' && value) style = ALIGNMENT_STYLES[value as AlignmentState]
  else if (variant === 'severity' && value) style = SEVERITY_STYLES[value as AlertSeverity]
  else if (variant === 'status' && value) style = STATUS_STYLES[value as GoalStatus]
  else if (color) style = `text-[${color}]`
  else style = 'bg-[#1e1e35] text-[#808090]'

  return (
    <span className={clsx(
      'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center',
      style,
      className,
    )}>
      {children}
    </span>
  )
}

interface PillarBadgeProps {
  name: string
  color: string
  className?: string
}

export function PillarBadge({ name, color, className }: PillarBadgeProps) {
  return (
    <span
      className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center', className)}
      style={{ background: `${color}20`, color }}
    >
      {name}
    </span>
  )
}
