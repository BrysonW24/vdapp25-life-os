import { Modal } from '@/components/ui/Modal'
import { PillarBadge } from '@/components/ui/Badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { clsx } from 'clsx'
import type { Habit, HabitLog, Pillar } from '@/types'

interface DayDetailModalProps {
  open: boolean
  onClose: () => void
  dateStr: string
  habits: Habit[]
  logs: HabitLog[]
  pillars: Pillar[]
  onToggle: (habitId: number, dateStr: string) => void
}

export function DayDetailModal({ open, onClose, dateStr, habits, logs, pillars, onToggle }: DayDetailModalProps) {
  const dateLabel = format(parseISO(dateStr), 'EEEE, d MMM')
  const completedCount = logs.filter(l => l.completed).length

  return (
    <Modal open={open} onClose={onClose} title={dateLabel}>
      <div className="space-y-2">
        {habits.map(habit => {
          const isCompleted = logs.some(l => l.habitId === habit.id && l.completed)
          const pillar = pillars.find(p => p.id === habit.pillarId)

          return (
            <div key={habit.id} className="flex items-center gap-3 rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] p-3">
              <button onClick={() => onToggle(habit.id, dateStr)}>
                {isCompleted
                  ? <CheckCircle2 size={20} style={{ color: habit.color }} />
                  : <Circle size={20} className="text-[#2d2d4e]" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={clsx('text-sm font-medium truncate', isCompleted ? 'text-[#606080]' : 'text-[#e8e8f0]')}>
                    {habit.title}
                  </p>
                  {pillar && <PillarBadge name={pillar.name} color={pillar.color} />}
                </div>
                <p className="text-[10px] text-[#404060]">{habit.targetDaysPerWeek}x/week</p>
              </div>
            </div>
          )
        })}

        {habits.length > 0 && (
          <p className="text-xs text-[#606080] text-center pt-2">
            {completedCount}/{habits.length} completed
          </p>
        )}
      </div>
    </Modal>
  )
}
