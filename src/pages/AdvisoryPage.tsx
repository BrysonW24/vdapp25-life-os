import { useState, useEffect, useMemo, useRef } from 'react'

function AdvisoryCanvas() {
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
      t += 0.009

      // Red warning glow — top left
      const grd = ctx!.createRadialGradient(w * 0.2, h * 0.25, 0, w * 0.2, h * 0.25, w * 0.5)
      grd.addColorStop(0, 'rgba(220,38,38,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      // Radar sweep — top right
      const cx = w * 0.78, cy = h * 0.28
      const radarR = 80
      const sweepAngle = (t * 1.2) % (Math.PI * 2)

      // Radar rings
      for (let i = 1; i <= 3; i++) {
        ctx!.beginPath()
        ctx!.arc(cx, cy, radarR * (i / 3), 0, Math.PI * 2)
        ctx!.strokeStyle = 'rgba(220,38,38,0.10)'
        ctx!.lineWidth = 1
        ctx!.stroke()
      }
      // Radar crosshairs
      ctx!.beginPath()
      ctx!.moveTo(cx - radarR, cy); ctx!.lineTo(cx + radarR, cy)
      ctx!.moveTo(cx, cy - radarR); ctx!.lineTo(cx, cy + radarR)
      ctx!.strokeStyle = 'rgba(220,38,38,0.08)'
      ctx!.lineWidth = 0.5
      ctx!.stroke()

      // Sweep fill
      ctx!.beginPath()
      ctx!.moveTo(cx, cy)
      ctx!.arc(cx, cy, radarR, sweepAngle - 0.5, sweepAngle)
      ctx!.closePath()
      ctx!.fillStyle = 'rgba(220,38,38,0.12)'
      ctx!.fill()

      // Sweep line
      ctx!.beginPath()
      ctx!.moveTo(cx, cy)
      ctx!.lineTo(cx + Math.cos(sweepAngle) * radarR, cy + Math.sin(sweepAngle) * radarR)
      ctx!.strokeStyle = 'rgba(248,113,113,0.35)'
      ctx!.lineWidth = 1.5
      ctx!.stroke()

      // Alert pulse rings — scattered
      const alerts = [
        { x: 0.15, y: 0.55, phase: 0 },
        { x: 0.6,  y: 0.7,  phase: 1.2 },
        { x: 0.85, y: 0.6,  phase: 2.4 },
      ]
      alerts.forEach(a => {
        const px = a.x * w, py = a.y * h
        const pulse = ((t * 0.8 + a.phase) % 1)
        const r = pulse * 35
        const alpha = (1 - pulse) * 0.15
        ctx!.beginPath()
        ctx!.arc(px, py, r, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(239,68,68,${alpha})`
        ctx!.lineWidth = 1
        ctx!.stroke()
        // Core dot
        ctx!.beginPath()
        ctx!.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(239,68,68,0.25)'
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
    <>
    <AdvisoryCanvas />
    <div className="relative space-y-6" style={{ zIndex: 1 }}>
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Advisory</h1>
        <p className="text-[#606080] text-sm mt-1">
          {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
          {dismissedCount > 0 && <span className="text-[#404060]"> · {dismissedCount} dismissed</span>}
        </p>
      </div>
      <PageHero variant="advisory" />

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
    </>
  )
}
