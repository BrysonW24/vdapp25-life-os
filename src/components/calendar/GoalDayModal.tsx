import { Modal } from '@/components/ui/Modal'
import { PillarBadge, Badge } from '@/components/ui/Badge'
import { CheckCircle2, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Goal, Milestone, Pillar } from '@/types'

interface GoalDayModalProps {
  open: boolean
  onClose: () => void
  dateStr: string
  goalsDue: Goal[]
  milestonesOnDay: Array<{ milestone: Milestone; goal: Goal }>
  pillars: Pillar[]
}

export function GoalDayModal({ open, onClose, dateStr, goalsDue, milestonesOnDay, pillars }: GoalDayModalProps) {
  const dateLabel = format(parseISO(dateStr), 'EEEE, d MMM')
  const hasContent = goalsDue.length > 0 || milestonesOnDay.length > 0

  return (
    <Modal open={open} onClose={onClose} title={dateLabel}>
      {!hasContent ? (
        <p className="text-xs text-[#404060] text-center py-4">Nothing scheduled</p>
      ) : (
        <div className="space-y-4">
          {goalsDue.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#808090] uppercase tracking-wider mb-2">Goals Due</p>
              <div className="space-y-2">
                {goalsDue.map(goal => {
                  const pillar = pillars.find(p => p.id === goal.pillarId)
                  return (
                    <div key={goal.id} className="flex items-center gap-3 rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] p-3">
                      <Target size={16} className="text-violet-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#e8e8f0] truncate">{goal.title}</p>
                          {pillar && <PillarBadge name={pillar.name} color={pillar.color} />}
                        </div>
                      </div>
                      <Badge variant="status" value={goal.status}>{goal.status}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {milestonesOnDay.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#808090] uppercase tracking-wider mb-2">Milestones Completed</p>
              <div className="space-y-2">
                {milestonesOnDay.map(({ milestone, goal }) => (
                  <div key={milestone.id} className="flex items-center gap-3 rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] p-3">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e8e8f0] truncate">{milestone.title}</p>
                      <p className="text-[10px] text-[#404060]">{goal.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
