import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface MonthlyCalendarProps {
  currentMonth: Date
  monthLabel: string
  goNext: () => void
  goPrev: () => void
  goToToday: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  renderCell: (date: Date, dateStr: string, isCurrentMonth: boolean) => ReactNode
  onDayClick: (dateStr: string) => void
  selectedDate?: string | null
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthlyCalendar({
  currentMonth, monthLabel, goNext, goPrev, goToToday,
  onTouchStart, onTouchEnd, renderCell, onDayClick, selectedDate,
}: MonthlyCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          className="p-1.5 rounded-lg text-[#606080] hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={goToToday}
          className="text-sm font-semibold text-[#e8e8f0] hover:text-violet-400 transition-colors"
        >
          {monthLabel}
        </button>
        <button
          onClick={goNext}
          className="p-1.5 rounded-lg text-[#606080] hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[10px] text-[#606080] font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {allDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={clsx(
                'relative flex flex-col items-center justify-start py-1.5 min-h-[44px] transition-colors rounded-lg',
                !inMonth && 'opacity-30',
                isSelected && 'ring-1 ring-violet-500 bg-violet-500/10',
                today && !isSelected && 'bg-[#1e1e35]',
              )}
            >
              <span className={clsx(
                'text-[11px] font-medium',
                today ? 'text-violet-400' : inMonth ? 'text-[#e8e8f0]' : 'text-[#404060]',
              )}>
                {format(day, 'd')}
              </span>
              {renderCell(day, dateStr, inMonth)}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
