import { useState, useEffect, useRef } from 'react'
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
import { AlertTriangle, Flame, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

/* ── Full-viewport animated canvas — Expense HUD quality ──
   Counter-scrolling particle columns, decorative rings,
   animated bars, orbiting dots, radial glow               */

const SPLASH_COLORS = [
  '#8b5cf6', '#7c3aed', '#a78bfa', '#FF6B35',
  '#22c55e', '#3b82f6', '#06b6d4', '#ec4899',
]

function randomSplashColor() {
  return SPLASH_COLORS[Math.floor(Math.random() * SPLASH_COLORS.length)]
}

interface SplashParticle {
  x: number; y: number; r: number
  speed: number; opacity: number; color: string
}

function SplashCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: SplashParticle[] = []

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    function initParticles() {
      const w = window.innerWidth
      const h = window.innerHeight
      particles = []

      // Left column — drifting UP
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * w * 0.38 + w * 0.02,
          y: Math.random() * h * 1.5,
          r: Math.random() * 3.5 + 1,
          speed: -(Math.random() * 0.5 + 0.15),
          opacity: Math.random() * 0.35 + 0.08,
          color: randomSplashColor(),
        })
      }

      // Right column — drifting DOWN
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * w * 0.38 + w * 0.6,
          y: Math.random() * h * 1.5 - h * 0.5,
          r: Math.random() * 3.5 + 1,
          speed: Math.random() * 0.5 + 0.15,
          opacity: Math.random() * 0.35 + 0.08,
          color: randomSplashColor(),
        })
      }
    }

    function drawRing(x: number, y: number, r: number, color: string, alpha: number) {
      ctx!.beginPath()
      ctx!.arc(x, y, r, 0, Math.PI * 2)
      ctx!.strokeStyle = color
      ctx!.globalAlpha = alpha * 0.3
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.globalAlpha = 1
    }

    function drawBar(x: number, y: number, bw: number, bh: number, color: string, alpha: number) {
      ctx!.globalAlpha = alpha * 0.22
      ctx!.fillStyle = color
      ctx!.beginPath()
      ctx!.roundRect(x, y, bw, bh, 3)
      ctx!.fill()
      ctx!.globalAlpha = 1
    }

    let time = 0

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)
      time += 0.005

      // ── Radial glow at center ──
      const radGrad = ctx!.createRadialGradient(w / 2, h * 0.38, 0, w / 2, h * 0.38, w * 0.5)
      radGrad.addColorStop(0, 'rgba(124, 58, 237, 0.07)')
      radGrad.addColorStop(0.4, 'rgba(124, 58, 237, 0.03)')
      radGrad.addColorStop(1, 'rgba(124, 58, 237, 0)')
      ctx!.fillStyle = radGrad
      ctx!.fillRect(0, 0, w, h)

      // ── Particles ──
      for (const p of particles) {
        p.y += p.speed
        if (p.speed < 0 && p.y < -20) p.y = h + 20
        if (p.speed > 0 && p.y > h + 20) p.y = -20

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = p.opacity
        ctx!.fill()
        ctx!.globalAlpha = 1
      }

      // ── Decorative rings — left column (slow upward drift) ──
      const leftDrift = (time * 70) % h
      for (let i = 0; i < 5; i++) {
        const yy = ((i * h / 4) - leftDrift + h * 2) % (h * 1.5) - h * 0.25
        const xx = w * 0.1 + Math.sin(time + i) * 25
        const rr = 18 + Math.sin(time * 2 + i) * 7
        drawRing(xx, yy, rr, SPLASH_COLORS[i % SPLASH_COLORS.length], 0.5 + Math.sin(time + i) * 0.2)
      }

      // ── Animated bars — left column ──
      for (let i = 0; i < 4; i++) {
        const yy = ((i * h / 3.5) - leftDrift * 0.65 + h * 2) % (h * 1.5) - h * 0.25
        const xx = w * 0.22
        const bw = 28 + Math.sin(time * 1.5 + i * 2) * 14
        drawBar(xx, yy, bw, 5, SPLASH_COLORS[(i + 3) % SPLASH_COLORS.length], 0.55)
      }

      // ── Decorative rings — right column (slow downward drift) ──
      const rightDrift = (time * 55) % h
      for (let i = 0; i < 5; i++) {
        const yy = ((i * h / 4) + rightDrift) % (h * 1.5) - h * 0.25
        const xx = w * 0.88 + Math.cos(time + i) * 20
        const rr = 14 + Math.cos(time * 1.8 + i) * 5
        drawRing(xx, yy, rr, SPLASH_COLORS[(i + 2) % SPLASH_COLORS.length], 0.4 + Math.cos(time + i) * 0.15)
      }

      // ── Animated bars — right column ──
      for (let i = 0; i < 4; i++) {
        const yy = ((i * h / 3.5) + rightDrift * 0.75) % (h * 1.5) - h * 0.25
        const xx = w * 0.7
        const bw = 22 + Math.cos(time * 1.3 + i * 2) * 10
        drawBar(xx, yy, bw, 5, SPLASH_COLORS[(i + 5) % SPLASH_COLORS.length], 0.5)
      }

      // ── Orbiting dots around center (elliptical) ──
      for (let i = 0; i < 10; i++) {
        const angle = time * (0.25 + i * 0.04) + (i * Math.PI * 2) / 10
        const orbitR = 140 + i * 18 + Math.sin(time * 2 + i) * 12
        const ox = w / 2 + Math.cos(angle) * orbitR
        const oy = h * 0.4 + Math.sin(angle) * orbitR * 0.55
        ctx!.beginPath()
        ctx!.arc(ox, oy, 2, 0, Math.PI * 2)
        ctx!.fillStyle = SPLASH_COLORS[i % SPLASH_COLORS.length]
        ctx!.globalAlpha = 0.2
        ctx!.fill()
        ctx!.globalAlpha = 1
      }

      // ── Faint concentric rings at center ──
      for (let i = 1; i <= 3; i++) {
        const ringR = 60 * i + Math.sin(time * 0.5 + i) * 5
        ctx!.beginPath()
        ctx!.arc(w / 2, h * 0.4, ringR, 0, Math.PI * 2)
        ctx!.strokeStyle = 'rgba(124, 58, 237, 0.06)'
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      }

      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

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

  const topStreak = streaks.length > 0 ? streaks[0].streak : 0

  // Highest-severity alert
  const severityOrder: Record<string, number> = { challenge: 0, warning: 1, opportunity: 2, insight: 3 }
  const topAlert = [...activeAlerts]
    .sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))
    [0]

  // Today's agenda
  const agendaItems: { label: string; done: boolean; to: string; color?: string }[] = []
  if (!amDone) agendaItems.push({ label: 'Morning Reflection', done: false, to: '/reflect' })
  else agendaItems.push({ label: 'Morning Reflection', done: true, to: '/reflect' })

  habits.forEach(h => {
    const log = todayLogs.find(l => l.habitId === h.id)
    agendaItems.push({ label: h.title, done: !!log?.completed, to: '/habits', color: h.color })
  })

  if (!pmDone) agendaItems.push({ label: 'Evening Reflection', done: false, to: '/reflect' })
  else agendaItems.push({ label: 'Evening Reflection', done: true, to: '/reflect' })

  /* ═══════════════════════════════════════════════════
     COLD START — No identity declared
     Stunning splash screen with animated particles
     ═══════════════════════════════════════════════════ */
  if (!identity) {
    return (
      <>
        {/* Full-viewport animated canvas */}
        <SplashCanvas />

        {/* Content centered over canvas */}
        <div className="relative z-10 flex flex-col items-center justify-center -mx-4 -mt-6 px-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="text-center max-w-sm mx-auto space-y-8">
            {/* Decorative ring */}
            <div className="mx-auto w-28 h-28 rounded-full border border-violet-500/20 flex items-center justify-center"
              style={{ boxShadow: '0 0 60px rgba(124,58,237,0.15), inset 0 0 30px rgba(124,58,237,0.06)' }}
            >
              <div className="w-14 h-14 rounded-full border border-violet-500/30 flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(124,58,237,0.1)' }}
              >
                <div className="w-4 h-4 rounded-full bg-violet-500" style={{ boxShadow: '0 0 16px rgba(124,58,237,0.7), 0 0 40px rgba(124,58,237,0.3)' }} />
              </div>
            </div>

            {/* Headline — Playfair italic for "identity" */}
            <div>
              <h1 className="text-3xl font-light tracking-tight text-[#e8e8f0] leading-tight">
                Declare your{' '}
                <span className="font-bold" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#8b5cf6' }}>
                  identity
                </span>
              </h1>
              <p className="text-xs mt-4 leading-relaxed text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
                Who you are. What you stand for.<br />
                The standards you hold.
              </p>
            </div>

            {/* CTA Button */}
            <Link to="/identity">
              <button className="mt-2 px-10 py-3.5 rounded-xl bg-violet-600 text-white text-sm font-medium tracking-wide transition-all duration-300 hover:bg-violet-500"
                style={{ fontFamily: 'var(--font-sans)', boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 4px 12px rgba(0,0,0,0.3)' }}
              >
                Begin Declaration
              </button>
            </Link>

            {/* Subtle system label */}
            <p className="text-[8px] tracking-[0.25em] uppercase text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
              Life Operating System
            </p>
          </div>
        </div>
      </>
    )
  }

  /* ═══════════════════════════════════════════════════
     MAIN HUB — 8-zone layout
     ═══════════════════════════════════════════════════ */
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'challenge': return '#ef4444'
      case 'warning': return '#eab308'
      case 'opportunity': return '#3b82f6'
      default: return '#8b5cf6'
    }
  }

  return (
    <>
    {/* Ambient animated background — always visible */}
    <SplashCanvas />

    <div className="relative z-10 space-y-3">
      {/* Zone 1: Hero Score Ring */}
      <CompoundingIndex />

      {/* Zone 2: Stat Bar */}
      <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] py-3 px-4">
        <div className="flex items-center justify-around">
          <StatMetric
            label="HABITS"
            value={`${completedToday}/${habits.length}`}
            done={completedToday === habits.length && habits.length > 0}
            to="/habits"
          />
          <div className="w-px h-8 bg-[#2d2d4e]" />
          <StatMetric
            label="AM"
            value={amDone ? '\u2713' : '\u2014'}
            done={!!amDone}
            to="/reflect"
          />
          <div className="w-px h-8 bg-[#2d2d4e]" />
          <StatMetric
            label="PM"
            value={pmDone ? '\u2713' : '\u2014'}
            done={!!pmDone}
            to="/reflect"
          />
          <div className="w-px h-8 bg-[#2d2d4e]" />
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
        <div>
          <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase mb-2 px-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Today
          </p>
          <div className="scroll-x-hide scroll-snap-x flex gap-2 -mx-4 px-4 py-1">
            {agendaItems.map((item, i) => (
              <Link key={i} to={item.to} className="flex-shrink-0" style={{ width: 140 }}>
                <div
                  className="rounded-xl bg-[#16162a] border border-[#2d2d4e] p-3 h-full transition-all duration-200 hover:border-violet-500/30"
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: item.done ? '#22c55e' : '#7c3aed',
                  }}
                >
                  <p className="text-[11px] leading-tight truncate text-[#808090]">
                    {item.label}
                  </p>
                  <p className="text-[8px] mt-1.5 uppercase tracking-wider" style={{
                    fontFamily: 'var(--font-mono)',
                    color: item.done ? '#22c55e' : '#606080',
                  }}>
                    {item.done ? '\u2713 DONE' : 'PENDING'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Zone 6: System Alert */}
      {topAlert && (
        <Link to="/advisory">
          <div
            className="rounded-xl bg-[#16162a] border border-[#2d2d4e] p-3.5 transition-all duration-200 hover:border-violet-500/30"
            style={{ borderLeftWidth: 2, borderLeftColor: severityColor(topAlert.severity) }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" style={{ color: severityColor(topAlert.severity) }} />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] uppercase tracking-widest mb-1 text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
                  Alert
                </p>
                <p className="text-[13px] leading-relaxed text-[#808090]">{topAlert.message}</p>
              </div>
              <ChevronRight size={14} className="mt-1 flex-shrink-0 text-[#404060]" />
            </div>
          </div>
        </Link>
      )}

      {/* Zone 7: Active Streaks */}
      {streaks.length > 0 && (
        <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
          <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
            Streaks
          </p>
          <div className="space-y-0">
            {streaks.map(({ habit, streak }, i) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 py-2"
                style={{ borderBottom: i < streaks.length - 1 ? '1px solid #2d2d4e' : 'none' }}
              >
                <Flame size={12} strokeWidth={1.5} style={{ color: streak > 7 ? '#FF6B35' : '#606080' }} className="flex-shrink-0" />
                <p className="text-[13px] flex-1 truncate text-[#808090]">{habit.title}</p>
                <span
                  className="text-xs font-bold flex-shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: streak > 7 ? '#FF6B35' : '#e8e8f0',
                  }}
                >
                  {streak}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone 8: Navigation Grid */}
      <div className="grid grid-cols-3 gap-2">
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
    </>
  )
}

function StatMetric({ label, value, done, to }: { label: string; value: string; done: boolean; to: string }) {
  return (
    <Link to={to} className="flex-1 text-center group">
      <p className="text-[8px] tracking-widest mb-1 text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{label}</p>
      <p className={clsx(
        'text-base font-semibold transition-colors duration-200',
      )} style={{
        fontFamily: 'var(--font-sans)',
        color: done ? '#22c55e' : '#e8e8f0',
      }}>{value}</p>
    </Link>
  )
}

function NavPanel({ to, label, count }: { to: string; label: string; count?: number }) {
  return (
    <Link
      to={to}
      className="rounded-xl bg-[#16162a] border border-[#2d2d4e] p-3 flex items-center justify-between transition-all duration-200 hover:border-violet-500/30 group"
    >
      <span className="text-[10px] text-[#808090] group-hover:text-[#e8e8f0] transition-colors duration-200" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{count}</span>
      )}
    </Link>
  )
}
