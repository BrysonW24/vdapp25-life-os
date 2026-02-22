import { useState, useMemo, useEffect, useRef } from 'react'

function HabitsCanvas() {
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

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = w * dpr; canvas!.height = h * dpr
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`
      ctx!.scale(dpr, dpr)
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h)
      t += 0.006

      // Emerald glow — bottom left (chains anchor)
      const grd = ctx!.createRadialGradient(w * 0.15, h * 0.75, 0, w * 0.15, h * 0.75, w * 0.45)
      grd.addColorStop(0, 'rgba(5,150,105,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      // Rhythmic bar columns — like a habit heatmap grid
      const cols = 12, rows = 7
      const cellW = w * 0.7 / cols
      const cellH = 10
      const gridX = w * 0.15, gridY = h * 0.55

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const wave = Math.sin(t * 1.2 + c * 0.4 + r * 0.3)
          const filled = wave > -0.2
          const alpha = filled ? 0.12 + wave * 0.06 : 0.03
          const x = gridX + c * (cellW + 2)
          const y = gridY + r * (cellH + 2)
          ctx!.fillStyle = `rgba(5,150,105,${alpha})`
          ctx!.fillRect(x, y, cellW - 2, cellH - 2)
        }
      }

      // Chain link strand — left side
      const chainX = w * 0.06
      const chainTop = h * 0.1
      const linkH = 24
      const numLinks = Math.floor((h * 0.8) / linkH)

      for (let i = 0; i < numLinks; i++) {
        const y = chainTop + i * linkH
        const pulse = Math.sin(t * 1.5 + i * 0.4) * 0.5 + 0.5
        const alpha = 0.06 + pulse * 0.08
        ctx!.beginPath()
        ctx!.ellipse(chainX, y + linkH / 2, 6, 10, 0, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(52,211,153,${alpha})`
        ctx!.lineWidth = 1.2
        ctx!.stroke()
      }

      // Streak counter arcs — top right
      const arcCx = w * 0.82, arcCy = h * 0.22
      for (let i = 0; i < 4; i++) {
        const r = 20 + i * 18
        const endAngle = ((-Math.PI / 2) + (t * 0.3 + i * 0.5) % (Math.PI * 2))
        ctx!.beginPath()
        ctx!.arc(arcCx, arcCy, r, -Math.PI / 2, endAngle)
        ctx!.strokeStyle = `rgba(52,211,153,${0.15 - i * 0.03})`
        ctx!.lineWidth = 1.5
        ctx!.stroke()
      }

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
import { HabitHeatmap } from '@/components/visualizations/HabitHeatmap'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { PillarBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar'
import { HabitCalendarCell } from '@/components/calendar/HabitCalendarCell'
import { DayDetailModal } from '@/components/calendar/DayDetailModal'
import { useMonthNavigation } from '@/components/calendar/useMonthNavigation'
import { useActiveHabits, useHabitLogs, useTodayLogs, toggleHabitLog, addHabit, deleteHabit, archiveHabit } from '@/hooks/useHabits'
import { usePillars, useIdentity } from '@/hooks/useIdentity'
import { useAllHabitLogs } from '@/hooks/useHabits'
import { calcStreak } from '@/lib/streaks'
import { format, startOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, subDays } from 'date-fns'
import { Repeat2, Plus, CheckCircle2, Circle, Flame, Trash2, Archive } from 'lucide-react'
import { clsx } from 'clsx'

const HABIT_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777']

export function HabitsPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const habits = useActiveHabits()
  const todayLogs = useTodayLogs()
  const allLogs = useAllHabitLogs()

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [dayDetailDate, setDayDetailDate] = useState<string | null>(null)

  // Month navigation
  const monthNav = useMonthNavigation()

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPillarId, setNewPillarId] = useState<number | null>(null)
  const [newTarget, setNewTarget] = useState('7')
  const [newColor, setNewColor] = useState(HABIT_COLORS[0])

  // Week strip
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  // Logs for week view
  const weekFrom = format(weekDays[0], 'yyyy-MM-dd')
  const weekTo = format(weekDays[6], 'yyyy-MM-dd')
  const weekLogs = useHabitLogs({ from: weekFrom, to: weekTo })

  // Logs for month view
  const monthFrom = format(startOfMonth(monthNav.currentMonth), 'yyyy-MM-dd')
  const monthTo = format(endOfMonth(monthNav.currentMonth), 'yyyy-MM-dd')
  const monthLogs = useHabitLogs({ from: monthFrom, to: monthTo })

  // Completion map for month calendar
  const completionMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of monthLogs) {
      if (log.completed) {
        map.set(log.date, (map.get(log.date) ?? 0) + 1)
      }
    }
    return map
  }, [monthLogs])

  // Selected day logs
  const activeLogs = viewMode === 'month' ? monthLogs : weekLogs
  const selectedDayLogs = useMemo(() =>
    (selectedDate === todayStr ? todayLogs : activeLogs).filter(l => l.date === selectedDate),
    [selectedDate, todayStr, todayLogs, activeLogs],
  )

  // Day detail logs
  const dayDetailLogs = useMemo(() =>
    dayDetailDate ? monthLogs.filter(l => l.date === dayDetailDate) : [],
    [dayDetailDate, monthLogs],
  )

  async function handleAddHabit() {
    if (!newTitle.trim()) return
    await addHabit({
      title: newTitle.trim(),
      description: newDesc.trim(),
      pillarId: newPillarId,
      frequency: 'daily',
      targetDaysPerWeek: Number(newTarget) || 7,
      color: newColor,
    })
    setNewTitle(''); setNewDesc(''); setNewPillarId(null); setNewTarget('7'); setNewColor(HABIT_COLORS[0])
    setAddModalOpen(false)
  }

  const completedToday = todayLogs.filter(l => l.completed).length

  return (
    <>
    <HabitsCanvas />
    <div className="relative space-y-6" style={{ zIndex: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e8e8f0]">Habits</h1>
          <p className="text-[#606080] text-sm mt-1">
            {format(today, 'EEEE, d MMM')} — {completedToday}/{habits.length} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[#16162a] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('week')}
              className={clsx('text-[10px] px-2 py-1 rounded-md transition-colors font-medium',
                viewMode === 'week' ? 'bg-violet-600 text-white' : 'text-[#606080]')}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={clsx('text-[10px] px-2 py-1 rounded-md transition-colors font-medium',
                viewMode === 'month' ? 'bg-violet-600 text-white' : 'text-[#606080]')}
            >
              Month
            </button>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} /> Add
          </Button>
        </div>
      </div>
      <PageHero variant="habits" />

      {/* Habit heatmap */}
      {allLogs.length > 0 && habits.length > 0 ? (
        <Card>
          <p className="text-[10px] text-[#606080] mb-1.5">Activity — Last 12 Weeks</p>
          <HabitHeatmap logs={allLogs} habitCount={habits.length} />
        </Card>
      ) : habits.length > 0 ? (
        <p className="text-[10px] text-[#404060] text-center">Log habits to see your activity heatmap</p>
      ) : null}

      {/* Week strip */}
      {viewMode === 'week' && (
        <Card>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const dayLogs = weekLogs.filter(l => l.date === dayStr && l.completed)
              const allDone = habits.length > 0 && dayLogs.length >= habits.length
              const someDone = dayLogs.length > 0
              const isDayToday = isSameDay(day, today)
              const isSelected = dayStr === selectedDate
              const isPast = day < subDays(today, 0) && !isDayToday

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(dayStr)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-[#606080]">{format(day, 'EEE')}</span>
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all text-xs font-medium',
                    isSelected && 'ring-2 ring-violet-500',
                    allDone && 'bg-emerald-500/20 text-emerald-400',
                    someDone && !allDone && 'bg-amber-500/10 text-amber-400',
                    !someDone && isPast && 'bg-red-500/5 text-[#404060]',
                    !someDone && !isPast && 'border border-[#2d2d4e] text-[#404060]',
                    isDayToday && !isSelected && 'border-violet-500/50',
                  )}>
                    {format(day, 'd')}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Month calendar */}
      {viewMode === 'month' && (
        <MonthlyCalendar
          {...monthNav}
          renderCell={(_date, dateStr) => (
            <HabitCalendarCell
              dateStr={dateStr}
              todayStr={todayStr}
              habitCount={habits.length}
              completedCount={completionMap.get(dateStr) ?? 0}
            />
          )}
          onDayClick={(dateStr) => {
            setSelectedDate(dateStr)
            setDayDetailDate(dateStr)
          }}
          selectedDate={selectedDate}
        />
      )}

      {/* Habits list */}
      {habits.length === 0 ? (
        <EmptyState
          icon={Repeat2}
          title="No habits tracked yet"
          description="Build your daily standards around your identity pillars"
          actionLabel="Add your first habit"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          {habits.map(habit => {
            const isCompleted = selectedDayLogs.some(l => l.habitId === habit.id && l.completed)
            const streak = calcStreak(habit.id, allLogs)
            const pillar = pillars.find(p => p.id === habit.pillarId)

            return (
              <Card key={habit.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleHabitLog(habit.id, selectedDate)}>
                    {isCompleted
                      ? <CheckCircle2 size={22} style={{ color: habit.color }} />
                      : <Circle size={22} className="text-[#2d2d4e]" />
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
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Flame size={12} />
                      <span className="text-xs font-bold">{streak}</span>
                    </div>
                  )}
                  <button onClick={() => archiveHabit(habit.id)} className="text-[#404060] hover:text-amber-400 transition-colors">
                    <Archive size={12} />
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="text-[#404060] hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Habit">
        <div className="space-y-4">
          <Input label="Habit Name" placeholder="e.g. Morning workout" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <Input label="Description" placeholder="Optional details" value={newDesc} onChange={e => setNewDesc(e.target.value)} />

          <div>
            <label className="block text-xs text-[#808090] mb-1.5">Target Days/Week</label>
            <input
              type="range" min={1} max={7} value={newTarget} onChange={e => setNewTarget(e.target.value)}
              className="w-full accent-violet-500"
            />
            <p className="text-xs text-[#606080] text-center mt-1">{newTarget} days per week</p>
          </div>

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

          <div>
            <label className="block text-xs text-[#808090] mb-2">Color</label>
            <div className="flex gap-2">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px', opacity: newColor === c ? 1 : 0.5 }}
                />
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleAddHabit} disabled={!newTitle.trim()}>Create Habit</Button>
        </div>
      </Modal>

      {/* Day Detail Modal (month view) */}
      <DayDetailModal
        open={dayDetailDate !== null}
        onClose={() => setDayDetailDate(null)}
        dateStr={dayDetailDate ?? todayStr}
        habits={habits}
        logs={dayDetailLogs}
        pillars={pillars}
        onToggle={toggleHabitLog}
      />
    </div>
    </>
  )
}
