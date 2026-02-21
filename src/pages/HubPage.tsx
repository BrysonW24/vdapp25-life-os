import { useState, useEffect } from 'react'
import { CompoundingIndex } from '@/components/visualizations/CompoundingIndex'
import { StructuralIntegrity } from '@/components/visualizations/StructuralIntegrity'
import { AlignmentCompass } from '@/components/visualizations/AlignmentCompass'
import { TimeAllocationSankey } from '@/components/visualizations/TimeAllocationSankey'
import { CompassSetup } from '@/components/CompassSetup'
import { useIdentity, usePillars } from '@/hooks/useIdentity'
import { useActiveHabits, useTodayLogs } from '@/hooks/useHabits'
import { useTodayReflection } from '@/hooks/useReflections'
import { useActiveAlerts } from '@/hooks/useAdvisory'
import { useActiveGoals } from '@/hooks/useGoals'
import { useAllHabitLogs } from '@/hooks/useHabits'
import { useAppStore } from '@/stores/appStore'
import { calcStreak } from '@/lib/streaks'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { CHART_COLORS } from '@/components/visualizations/theme'

export function HubPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const habits = useActiveHabits()
  const todayLogs = useTodayLogs()
  const allLogs = useAllHabitLogs()
  const amDone = useTodayReflection('daily-am')
  const pmDone = useTodayReflection('daily-pm')
  const activeAlerts = useActiveAlerts()
  const activeGoals = useActiveGoals()
  const { compassMappings } = useAppStore()

  const [compassSetupOpen, setCompassSetupOpen] = useState(false)

  useEffect(() => {
    if (pillars.length > 0 && compassMappings.length === 0) {
      setCompassSetupOpen(true)
    }
  }, [pillars.length, compassMappings.length])

  const completedToday = todayLogs.filter(l => l.completed).length

  // Top 3 streaks
  const streaks = habits
    .map(h => ({ habit: h, streak: calcStreak(h.id, allLogs) }))
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)

  // Top streak for stat bar
  const topStreak = streaks.length > 0 ? streaks[0].streak : 0

  // Highest-severity alert
  const severityOrder: Record<string, number> = { challenge: 0, warning: 1, opportunity: 2, insight: 3 }
  const topAlert = [...activeAlerts]
    .sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))
    [0]

  // Today's agenda items
  const agendaItems: { label: string; done: boolean; to: string; color?: string }[] = []
  if (!amDone) agendaItems.push({ label: 'Morning Reflection', done: false, to: '/reflect' })
  else agendaItems.push({ label: 'Morning Reflection', done: true, to: '/reflect' })

  habits.forEach(h => {
    const log = todayLogs.find(l => l.habitId === h.id)
    agendaItems.push({ label: h.title, done: !!log?.completed, to: '/habits', color: h.color })
  })

  if (!pmDone) agendaItems.push({ label: 'Evening Reflection', done: false, to: '/reflect' })
  else agendaItems.push({ label: 'Evening Reflection', done: true, to: '/reflect' })

  // No identity — cold start
  if (!identity) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: CHART_COLORS.textPrimary }}>Command Deck</h1>
          <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textMuted }}>
            SOVEREIGN PERFORMANCE INTELLIGENCE
          </p>
        </div>

        <div className="border border-[#252525] bg-[#141414] p-6 rounded-sm" style={{ borderLeft: `2px solid ${CHART_COLORS.brand}` }}>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.brand }}>
            Initialize
          </p>
          <p className="text-sm leading-relaxed" style={{ color: CHART_COLORS.textSecondary }}>
            Declare your identity. Who you are. What you stand for. The standards you hold.
          </p>
          <Link to="/identity">
            <button className="mt-4 text-[11px] font-medium transition-colors duration-200" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.brand }}>
              Begin declaration &rarr;
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'challenge': return CHART_COLORS.brand
      case 'warning': return CHART_COLORS.drifting
      case 'opportunity': return CHART_COLORS.improving
      default: return '#8b5cf6'
    }
  }

  return (
    <div className="space-y-3">
      {/* Zone 1: Hero Score Ring */}
      <CompoundingIndex />

      {/* Zone 2: Stat Bar */}
      <div className="border-y border-[#252525] bg-[#141414] py-3 px-4 -mx-4">
        <div className="flex items-center justify-around">
          <StatMetric
            label="HABITS"
            value={`${completedToday}/${habits.length}`}
            done={completedToday === habits.length && habits.length > 0}
            to="/habits"
          />
          <div className="w-px h-8" style={{ background: CHART_COLORS.border }} />
          <StatMetric
            label="AM"
            value={amDone ? '\u2713' : '\u2014'}
            done={!!amDone}
            to="/reflect"
          />
          <div className="w-px h-8" style={{ background: CHART_COLORS.border }} />
          <StatMetric
            label="PM"
            value={pmDone ? '\u2713' : '\u2014'}
            done={!!pmDone}
            to="/reflect"
          />
          <div className="w-px h-8" style={{ background: CHART_COLORS.border }} />
          <StatMetric
            label="STREAK"
            value={topStreak > 0 ? `${topStreak}d` : '\u2014'}
            done={false}
            to="/habits"
          />
        </div>
      </div>

      {/* Zone 3: Pillar Health Bars */}
      <StructuralIntegrity />

      {/* Zone 4: Compass + Time Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AlignmentCompass onEditMappings={() => setCompassSetupOpen(true)} />
        <TimeAllocationSankey />
      </div>

      {/* Zone 5: Today's Agenda — horizontal scroll */}
      {agendaItems.length > 0 && (
        <div className="scroll-x-hide flex gap-2 -mx-4 px-4 py-1">
          {agendaItems.map((item, i) => (
            <Link key={i} to={item.to} className="flex-shrink-0" style={{ width: 140 }}>
              <div
                className="bg-[#141414] p-3 h-full transition-colors duration-200"
                style={{ borderLeft: `2px solid ${item.done ? CHART_COLORS.aligned : CHART_COLORS.brand}` }}
              >
                <p className="text-[11px] leading-tight truncate" style={{ color: CHART_COLORS.textSecondary }}>
                  {item.label}
                </p>
                <p className="text-[8px] mt-1.5 uppercase tracking-wider" style={{
                  fontFamily: 'var(--font-mono)',
                  color: item.done ? CHART_COLORS.aligned : CHART_COLORS.textMuted,
                }}>
                  {item.done ? '\u2713 DONE' : 'PENDING'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Zone 6: System Alert */}
      {topAlert && (
        <Link to="/advisory">
          <div
            className="bg-[#141414] p-3 rounded-sm transition-colors duration-200"
            style={{ borderLeft: `2px solid ${severityColor(topAlert.severity)}` }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" style={{ color: severityColor(topAlert.severity) }} />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textMuted }}>Alert</p>
                <p className="text-[13px] leading-relaxed" style={{ color: CHART_COLORS.textSecondary }}>{topAlert.message}</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Zone 7: Active Streaks */}
      {streaks.length > 0 && (
        <div className="py-1">
          {streaks.map(({ habit, streak }, i) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: i < streaks.length - 1 ? `1px solid ${CHART_COLORS.border}` : 'none' }}
            >
              <div className="w-[3px] h-[3px] flex-shrink-0" style={{ background: habit.color }} />
              <p className="text-[13px] flex-1 truncate" style={{ color: CHART_COLORS.textSecondary }}>{habit.title}</p>
              <span
                className="text-xs font-bold flex-shrink-0"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: streak > 7 ? CHART_COLORS.brand : CHART_COLORS.textPrimary,
                }}
              >
                {streak}d
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Zone 8: Navigation Grid — 2x3 panels */}
      <div className="grid grid-cols-3 gap-[2px] rounded-sm overflow-hidden">
        <NavPanel to="/identity" label="Identity" count={pillars.length} />
        <NavPanel to="/goals" label="Goals" count={activeGoals.length} />
        <NavPanel to="/habits" label="Habits" count={habits.length} />
        <NavPanel to="/reflect" label="Reflect" />
        <NavPanel to="/advisory" label="Advisory" count={activeAlerts.length} />
        <NavPanel to="/intelligence" label="Intel" />
      </div>

      {/* Compass Setup Modal */}
      <CompassSetup open={compassSetupOpen} onClose={() => setCompassSetupOpen(false)} />
    </div>
  )
}

function StatMetric({ label, value, done, to }: { label: string; value: string; done: boolean; to: string }) {
  return (
    <Link to={to} className="flex-1 text-center">
      <p className="text-[8px] tracking-widest mb-1" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textMuted }}>{label}</p>
      <p className={clsx(
        'text-base font-semibold',
      )} style={{
        fontFamily: 'var(--font-sans)',
        color: done ? CHART_COLORS.aligned : CHART_COLORS.textPrimary,
      }}>{value}</p>
    </Link>
  )
}

function NavPanel({ to, label, count }: { to: string; label: string; count?: number }) {
  return (
    <Link
      to={to}
      className="bg-[#141414] p-3 flex items-center justify-between transition-all duration-200 group"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={e => (e.currentTarget.style.borderLeftColor = CHART_COLORS.brand)}
      onMouseLeave={e => (e.currentTarget.style.borderLeftColor = 'transparent')}
    >
      <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textSecondary }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textMuted }}>{count}</span>
      )}
    </Link>
  )
}
