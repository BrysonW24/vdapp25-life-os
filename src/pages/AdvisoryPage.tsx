import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { AlertSeverityBars } from '@/components/visualizations/AlertSeverityBars'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useActiveAlerts, useAdvisoryAlerts, dismissAlert, bulkSyncAlerts } from '@/hooks/useAdvisory'
import { useAlignments } from '@/hooks/useIntelligence'
import { useIdentity, usePillars } from '@/hooks/useIdentity'
import { useGoals, useAllMilestones } from '@/hooks/useGoals'
import { useActiveHabits, useAllHabitLogs } from '@/hooks/useHabits'
import { useReflections } from '@/hooks/useReflections'
import { useLatestSnapshots } from '@/hooks/usePerformance'
import { useAppStore } from '@/stores/appStore'
import { computeAlerts } from '@/lib/challengeEngine'
import { Sparkles, AlertTriangle, Lightbulb, Zap, X, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import type { AlertSeverity } from '@/types'

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: typeof Sparkles; color: string; label: string }> = {
  challenge:   { icon: Zap,           color: '#dc2626', label: 'Challenge' },
  warning:     { icon: AlertTriangle, color: '#d97706', label: 'Warning' },
  opportunity: { icon: Lightbulb,     color: '#2563eb', label: 'Opportunity' },
  insight:     { icon: Sparkles,      color: '#7c3aed', label: 'Insight' },
}

type FilterTab = 'all' | AlertSeverity

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'challenge', label: 'Challenges' },
  { value: 'warning', label: 'Warnings' },
  { value: 'opportunity', label: 'Opportunities' },
  { value: 'insight', label: 'Insights' },
]

export function AdvisoryPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const alignments = useAlignments()
  const goals = useGoals()
  const milestones = useAllMilestones()
  const habits = useActiveHabits()
  const habitLogs = useAllHabitLogs()
  const reflections = useReflections()
  const previousSnapshots = useLatestSnapshots()
  const { currentSeason } = useAppStore()

  const activeAlerts = useActiveAlerts()
  const allAlerts = useAdvisoryAlerts()
  const [filter, setFilter] = useState<FilterTab>('all')

  // Compute and sync alerts when data changes
  const computed = useMemo(() =>
    computeAlerts({
      identity,
      pillars,
      alignments,
      goals,
      milestones,
      habits,
      habitLogs,
      reflections,
      previousSnapshots,
      currentSeason,
    }),
    [identity, pillars, alignments, goals, milestones, habits, habitLogs, reflections, previousSnapshots, currentSeason],
  )

  useEffect(() => {
    if (computed.length > 0) {
      bulkSyncAlerts(computed)
    }
  }, [computed])

  // Filter displayed alerts
  const displayed = useMemo(() => {
    if (filter === 'all') return activeAlerts
    return activeAlerts.filter(a => a.severity === filter)
  }, [activeAlerts, filter])

  const dismissedCount = allAlerts.length - activeAlerts.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Advisory</h1>
        <p className="text-[#606080] text-sm mt-1">
          {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
          {dismissedCount > 0 && <span className="text-[#404060]"> · {dismissedCount} dismissed</span>}
        </p>
      </div>

      {/* Philosophy note */}
      <Card className="border-red-500/20 bg-red-500/5">
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-400 mb-1">This is a mirror, not a cheerleader</p>
            <p className="text-xs text-[#a0a0c0] leading-relaxed">
              The advisory layer compares your declared identity against your observed behavior.
              It will surface uncomfortable truths. Don't mute it. Lean in.
            </p>
          </div>
        </div>
      </Card>

      {/* Alert severity trend */}
      {allAlerts.length >= 2 ? (
        <Card>
          <AlertSeverityBars alerts={allAlerts} />
        </Card>
      ) : (
        <p className="text-[10px] text-[#404060] text-center">Add data to see alert trend visualisation</p>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {FILTER_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap',
              filter === t.value
                ? 'bg-violet-600 text-white'
                : 'text-[#606080] hover:text-[#e8e8f0] bg-[#16162a]',
            )}
          >
            {t.label}
            {t.value !== 'all' && (
              <span className="ml-1 text-[10px] opacity-60">
                {activeAlerts.filter(a => a.severity === t.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {displayed.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={filter === 'all' ? 'No active alerts' : `No ${filter} alerts`}
          description={
            activeAlerts.length === 0
              ? 'The challenge engine monitors your alignment. Add pillars, habits, and reflections to activate it.'
              : 'No alerts match this filter'
          }
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(alert => {
            const { icon: Icon, color, label } = SEVERITY_CONFIG[alert.severity]
            const pillar = pillars.find(p => p.id === alert.pillarId)

            return (
              <Card key={alert.id}>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl p-2 flex-shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                        {label}
                      </span>
                      {pillar && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e1e35] text-[#606080]">
                          {pillar.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#e8e8f0] mb-1">{alert.title}</p>
                    <p className="text-xs text-[#a0a0c0] leading-relaxed">{alert.message}</p>
                    {alert.action && (
                      <Button size="sm" variant="secondary" className="mt-2">
                        {alert.action}
                      </Button>
                    )}
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-[#404060] hover:text-[#e8e8f0] transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
