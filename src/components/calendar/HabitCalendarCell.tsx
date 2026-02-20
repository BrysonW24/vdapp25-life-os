import { clsx } from 'clsx'

interface HabitCalendarCellProps {
  dateStr: string
  todayStr: string
  habitCount: number
  completedCount: number
}

export function HabitCalendarCell({ dateStr, todayStr, habitCount, completedCount }: HabitCalendarCellProps) {
  const isPast = dateStr < todayStr
  const isFuture = dateStr > todayStr

  if (habitCount === 0 || (isFuture && completedCount === 0)) return null

  const ratio = habitCount > 0 ? completedCount / habitCount : 0

  return (
    <div className={clsx(
      'w-1.5 h-1.5 rounded-full mt-0.5',
      ratio >= 1 && 'bg-emerald-500',
      ratio > 0 && ratio < 1 && 'bg-amber-500',
      ratio === 0 && isPast && 'bg-red-500/40',
      ratio === 0 && !isPast && 'bg-[#2d2d4e]',
    )} />
  )
}
