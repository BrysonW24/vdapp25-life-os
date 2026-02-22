import { useState, useMemo, useEffect, useRef } from 'react'

function GoalsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0
    let w = 0, h = 0
    const dpr = window.devicePixelRatio || 1

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.3 + Math.random() * 0.6,
      size: 1 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.2,
    }))

    const trajectories = [
      { sx: 0.05, sy: 0.95, ex: 0.55, ey: 0.05, color: '#8b5cf6' },
      { sx: 0.1,  sy: 0.9,  ex: 0.7,  ey: 0.1,  color: '#3b82f6' },
      { sx: 0.15, sy: 0.85, ex: 0.85, ey: 0.15, color: '#22c55e' },
    ]

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = w * dpr; canvas!.height = h * dpr
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`
      ctx!.scale(dpr, dpr)
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h)
      t += 0.007

      const grd = ctx!.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, w * 0.4)
      grd.addColorStop(0, 'rgba(34,197,94,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      trajectories.forEach((tr, i) => {
        const sx = tr.sx * w, sy = tr.sy * h
        const ex = tr.ex * w, ey = tr.ey * h
        const cpx = (sx + ex) / 2 - 40, cpy = (sy + ey) / 2 - 60
        ctx!.beginPath()
        ctx!.moveTo(sx, sy)
        ctx!.quadraticCurveTo(cpx, cpy, ex, ey)
        ctx!.strokeStyle = `${tr.color}14`
        ctx!.lineWidth = 1
        ctx!.stroke()

        const progress = ((t * 0.35 + i * 0.33) % 1 + 1) % 1
        const bx = (1 - progress) * (1 - progress) * sx + 2 * (1 - progress) * progress * cpx + progress * progress * ex
        const by = (1 - progress) * (1 - progress) * sy + 2 * (1 - progress) * progress * cpy + progress * progress * ey
        ctx!.beginPath()
        ctx!.arc(bx, by, 3, 0, Math.PI * 2)
        ctx!.fillStyle = `${tr.color}60`
        ctx!.fill()

        for (let m = 0.25; m < 1; m += 0.25) {
          const bxm = (1 - m) * (1 - m) * sx + 2 * (1 - m) * m * cpx + m * m * ex
          const bym = (1 - m) * (1 - m) * sy + 2 * (1 - m) * m * cpy + m * m * ey
          const pulse = 1 + Math.sin(t * 1.5 + i + m * 10) * 0.3
          ctx!.beginPath()
          ctx!.arc(bxm, bym, 2.5 * pulse, 0, Math.PI * 2)
          ctx!.strokeStyle = `${tr.color}30`
          ctx!.lineWidth = 1
          ctx!.stroke()
        }
      })

      particles.forEach(p => {
        p.y -= p.speed
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(139,92,246,${p.alpha})`
        ctx!.fill()
      })

      animId = requestAnimationFrame(animate)
    }

    resize(); animate()
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
import { Card } from '@/components/ui/Card'
import { PageHero } from '@/components/illustrations/PageHero'
import { GoalTimeline } from '@/components/visualizations/GoalTimeline'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { PillarBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar'
import { GoalCalendarCell } from '@/components/calendar/GoalCalendarCell'
import { GoalDayModal } from '@/components/calendar/GoalDayModal'
import { useMonthNavigation } from '@/components/calendar/useMonthNavigation'
import { useGoals, useAllMilestones, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone } from '@/hooks/useGoals'
import { usePillars, useIdentity } from '@/hooks/useIdentity'
import { format } from 'date-fns'
import { Target, Plus, ChevronDown, ChevronUp, CheckCircle2, Circle, Trash2, Calendar, CalendarDays } from 'lucide-react'
import { clsx } from 'clsx'
import type { GoalStatus } from '@/types'

const STATUS_TABS: Array<{ value: GoalStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Done' },
]

export function GoalsPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const goals = useGoals()
  const allMilestones = useAllMilestones()

  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all')
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [goalDayDate, setGoalDayDate] = useState<string | null>(null)

  // Month navigation
  const monthNav = useMonthNavigation()

  // Add form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPillarId, setNewPillarId] = useState<number | null>(null)
  const [newTargetDate, setNewTargetDate] = useState('')
  const [newMilestoneText, setNewMilestoneText] = useState('')
  const [newMilestones, setNewMilestones] = useState<string[]>([])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return goals
    return goals.filter(g => g.status === statusFilter)
  }, [goals, statusFilter])

  // Goal due date map for calendar
  const goalDueMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const goal of goals) {
      if (goal.targetDate) {
        const dateStr = format(new Date(goal.targetDate), 'yyyy-MM-dd')
        map.set(dateStr, (map.get(dateStr) ?? 0) + 1)
      }
    }
    return map
  }, [goals])

  // Milestone completion map for calendar
  const milestoneMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const ms of allMilestones) {
      if (ms.completed && ms.completedAt) {
        const dateStr = format(new Date(ms.completedAt), 'yyyy-MM-dd')
        map.set(dateStr, (map.get(dateStr) ?? 0) + 1)
      }
    }
    return map
  }, [allMilestones])

  // Data for day modal
  const goalsDueOnDay = useMemo(() => {
    if (!goalDayDate) return []
    return goals.filter(g => {
      if (!g.targetDate) return false
      return format(new Date(g.targetDate), 'yyyy-MM-dd') === goalDayDate
    })
  }, [goalDayDate, goals])

  const milestonesOnDay = useMemo(() => {
    if (!goalDayDate) return []
    return allMilestones
      .filter(ms => {
        if (!ms.completed || !ms.completedAt) return false
        return format(new Date(ms.completedAt), 'yyyy-MM-dd') === goalDayDate
      })
      .map(ms => ({
        milestone: ms,
        goal: goals.find(g => g.id === ms.goalId)!,
      }))
      .filter(item => item.goal)
  }, [goalDayDate, allMilestones, goals])

  async function handleAddGoal() {
    if (!newTitle.trim()) return
    const id = await addGoal({
      title: newTitle.trim(),
      description: newDesc.trim(),
      pillarId: newPillarId,
      targetDate: newTargetDate ? new Date(newTargetDate) : null,
      status: 'active',
    })
    for (const ms of newMilestones) {
      await addMilestone({ goalId: id, title: ms, completed: false, completedAt: null })
    }
    setNewTitle(''); setNewDesc(''); setNewPillarId(null); setNewTargetDate(''); setNewMilestones([])
    setAddModalOpen(false)
  }

  function addNewMilestone() {
    if (!newMilestoneText.trim()) return
    setNewMilestones(prev => [...prev, newMilestoneText.trim()])
    setNewMilestoneText('')
  }

  return (
    <>
    <GoalsCanvas />
    <div className="relative space-y-6" style={{ zIndex: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e8e8f0]">Goals</h1>
          <p className="text-[#606080] text-sm mt-1">{goals.filter(g => g.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showCalendar ? 'primary' : 'secondary'}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarDays size={14} /> Timeline
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} /> Add Goal
          </Button>
        </div>
      </div>
      <PageHero variant="goals" />

      {/* Goal timeline */}
      {goals.filter(g => g.status === 'active' || g.status === 'paused').length > 0 ? (
        <Card>
          <p className="text-[10px] text-[#606080] mb-1.5">Timeline</p>
          <GoalTimeline goals={goals} milestones={allMilestones} pillars={pillars} />
        </Card>
      ) : goals.length === 0 ? (
        <p className="text-[10px] text-[#404060] text-center">Add goals to see your timeline</p>
      ) : null}

      {/* Month calendar */}
      {showCalendar && (
        <>
          <MonthlyCalendar
            {...monthNav}
            renderCell={(_date, dateStr) => (
              <GoalCalendarCell
                goalsDue={goalDueMap.get(dateStr) ?? 0}
                milestonesCompleted={milestoneMap.get(dateStr) ?? 0}
              />
            )}
            onDayClick={(dateStr) => {
              const hasData = (goalDueMap.get(dateStr) ?? 0) > 0 || (milestoneMap.get(dateStr) ?? 0) > 0
              if (hasData) setGoalDayDate(dateStr)
            }}
            selectedDate={goalDayDate}
          />
          <div className="flex items-center gap-4 justify-center -mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-violet-500" />
              <span className="text-[10px] text-[#606080]">Goal due</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-[#606080]">Milestone done</span>
            </div>
          </div>
        </>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setStatusFilter(t.value)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-full transition-colors',
              statusFilter === t.value
                ? 'bg-violet-600 text-white'
                : 'text-[#606080] hover:text-[#e8e8f0] bg-[#16162a]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Declare your identity first, then link goals to your pillars"
          actionLabel="Add your first goal"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(goal => {
            const milestones = allMilestones.filter(m => m.goalId === goal.id)
            const completedMs = milestones.filter(m => m.completed).length
            const pillar = pillars.find(p => p.id === goal.pillarId)
            const expanded = expandedGoalId === goal.id

            return (
              <Card key={goal.id}>
                <button
                  onClick={() => setExpandedGoalId(expanded ? null : goal.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#e8e8f0] truncate">{goal.title}</p>
                        {pillar && <PillarBadge name={pillar.name} color={pillar.color} />}
                      </div>
                      {milestones.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-[#1e1e35] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-violet-500 transition-all"
                              style={{ width: `${milestones.length > 0 ? (completedMs / milestones.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#606080]">{completedMs}/{milestones.length}</span>
                        </div>
                      )}
                    </div>
                    {expanded ? <ChevronUp size={14} className="text-[#606080]" /> : <ChevronDown size={14} className="text-[#606080]" />}
                  </div>
                </button>

                {expanded && (
                  <div className="mt-3 pt-3 border-t border-[#2d2d4e]">
                    {goal.description && (
                      <p className="text-xs text-[#808090] mb-3">{goal.description}</p>
                    )}
                    {goal.targetDate && (
                      <div className="flex items-center gap-1.5 text-xs text-[#606080] mb-3">
                        <Calendar size={12} /> Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Milestones */}
                    {milestones.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {milestones.map(ms => (
                          <div key={ms.id} className="flex items-center gap-2">
                            <button onClick={() => toggleMilestone(ms.id)}>
                              {ms.completed
                                ? <CheckCircle2 size={14} className="text-emerald-400" />
                                : <Circle size={14} className="text-[#404060]" />
                              }
                            </button>
                            <span className={clsx('text-xs flex-1', ms.completed ? 'text-[#606080] line-through' : 'text-[#e8e8f0]')}>
                              {ms.title}
                            </span>
                            <button onClick={() => deleteMilestone(ms.id)} className="text-[#404060] hover:text-red-400">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Goal actions */}
                    <div className="flex gap-2">
                      {goal.status === 'active' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => updateGoal(goal.id, { status: 'paused' })}>Pause</Button>
                          <Button size="sm" variant="secondary" onClick={() => updateGoal(goal.id, { status: 'completed' })}>Complete</Button>
                        </>
                      )}
                      {goal.status === 'paused' && (
                        <Button size="sm" variant="secondary" onClick={() => updateGoal(goal.id, { status: 'active' })}>Resume</Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => deleteGoal(goal.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Goal">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Master AI engineering" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <Textarea label="Description" rows={2} placeholder="What does achieving this look like?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />

          <div>
            <label className="block text-xs text-[#808090] mb-1.5">Linked Pillar</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setNewPillarId(null)}
                className={clsx('text-xs px-3 py-1.5 rounded-full border transition-colors',
                  newPillarId === null ? 'bg-violet-600 text-white border-violet-600' : 'border-[#2d2d4e] text-[#808090]')}
              >
                None
              </button>
              {pillars.map(p => (
                <button
                  key={p.id}
                  onClick={() => setNewPillarId(p.id)}
                  className={clsx('text-xs px-3 py-1.5 rounded-full border transition-colors',
                    newPillarId === p.id ? 'text-white border-transparent' : 'border-[#2d2d4e] text-[#808090]')}
                  style={newPillarId === p.id ? { background: p.color } : undefined}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <Input label="Target Date" type="date" value={newTargetDate} onChange={e => setNewTargetDate(e.target.value)} />

          {/* Milestones */}
          <div>
            <label className="block text-xs text-[#808090] mb-1.5">Milestones</label>
            {newMilestones.map((ms, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <Circle size={12} className="text-[#404060]" />
                <span className="text-xs text-[#e8e8f0] flex-1">{ms}</span>
                <button onClick={() => setNewMilestones(prev => prev.filter((_, j) => j !== i))} className="text-[#404060] hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                placeholder="Add milestone..."
                value={newMilestoneText}
                onChange={e => setNewMilestoneText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNewMilestone()}
                className="flex-1 rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2 text-xs text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <Button size="sm" variant="secondary" onClick={addNewMilestone}><Plus size={12} /></Button>
            </div>
          </div>

          <Button className="w-full" onClick={handleAddGoal} disabled={!newTitle.trim()}>Create Goal</Button>
        </div>
      </Modal>

      {/* Goal Day Modal */}
      <GoalDayModal
        open={goalDayDate !== null}
        onClose={() => setGoalDayDate(null)}
        dateStr={goalDayDate ?? format(new Date(), 'yyyy-MM-dd')}
        goalsDue={goalsDueOnDay}
        milestonesOnDay={milestonesOnDay}
        pillars={pillars}
      />
    </div>
    </>
  )
}
