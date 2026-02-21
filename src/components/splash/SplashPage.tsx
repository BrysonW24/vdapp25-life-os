import { useEffect, useRef } from 'react'
import { ArrowRight, Compass, Layers, Zap, Shield, Brain } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const PARTICLE_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#FF6B35', '#22c55e', '#3b82f6']

function SplashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    interface Particle {
      x: number; y: number; r: number
      vx: number; vy: number
      opacity: number; color: string
    }

    interface Ring {
      x: number; y: number; r: number
      phase: number; speed: number; color: string
    }

    let particles: Particle[] = []
    let rings: Ring[] = []

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    function init() {
      const w = window.innerWidth
      const h = window.innerHeight
      particles = []
      rings = []

      // Floating particles — distributed across viewport
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2 - 0.1,
          opacity: Math.random() * 0.3 + 0.05,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        })
      }

      // Decorative rings — scattered
      for (let i = 0; i < 8; i++) {
        rings.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 20 + Math.random() * 60,
          phase: Math.random() * Math.PI * 2,
          speed: 0.003 + Math.random() * 0.005,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        })
      }
    }

    let time = 0

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)
      time += 1

      // Central radial glow
      const cx = w / 2
      const cy = h * 0.4
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5)
      grad.addColorStop(0, 'rgba(124, 58, 237, 0.08)')
      grad.addColorStop(0.5, 'rgba(124, 58, 237, 0.03)')
      grad.addColorStop(1, 'transparent')
      ctx!.fillStyle = grad
      ctx!.fillRect(0, 0, w, h)

      // Concentric rings at center — subtle
      for (let i = 1; i <= 4; i++) {
        const rr = 50 * i + Math.sin(time * 0.008 + i) * 8
        ctx!.beginPath()
        ctx!.arc(cx, cy, rr, 0, Math.PI * 2)
        ctx!.strokeStyle = 'rgba(124, 58, 237, 0.04)'
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = p.opacity + Math.sin(time * 0.02 + p.x) * 0.05
        ctx!.fill()
        ctx!.globalAlpha = 1
      }

      // Decorative rings
      for (const r of rings) {
        r.phase += r.speed
        const pulse = Math.sin(r.phase) * 0.15
        ctx!.beginPath()
        ctx!.arc(r.x, r.y, r.r + Math.sin(r.phase) * 4, 0, Math.PI * 2)
        ctx!.strokeStyle = r.color
        ctx!.globalAlpha = 0.06 + pulse
        ctx!.lineWidth = 0.5
        ctx!.stroke()
        ctx!.globalAlpha = 1
      }

      // Orbiting dots around center
      for (let i = 0; i < 8; i++) {
        const angle = time * 0.003 * (1 + i * 0.15) + (i * Math.PI * 2) / 8
        const orbitR = 120 + i * 25
        const ox = cx + Math.cos(angle) * orbitR
        const oy = cy + Math.sin(angle) * orbitR * 0.5
        ctx!.beginPath()
        ctx!.arc(ox, oy, 1.5, 0, Math.PI * 2)
        ctx!.fillStyle = PARTICLE_COLORS[i % PARTICLE_COLORS.length]
        ctx!.globalAlpha = 0.15
        ctx!.fill()
        ctx!.globalAlpha = 1
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

interface SplashPageProps {
  onGetStarted: () => void
  onSkip: () => void
}

export function SplashPage({ onGetStarted, onSkip }: SplashPageProps) {
  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: '#0a0a0f' }}>
      <SplashBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <header className="flex items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
            >
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
            </div>
            <span className="font-bold text-lg text-[#e8e8f0]">Life OS</span>
          </div>
          <button
            onClick={onSkip}
            className="text-sm text-[#606080] hover:text-[#e8e8f0] transition-colors"
          >
            Skip to App
          </button>
        </header>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
              style={{
                background: 'rgba(124,58,237,0.08)',
                borderColor: 'rgba(124,58,237,0.2)',
                color: '#8b5cf6',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Brain size={12} />
              Personal Performance Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-[#e8e8f0]">
              Align your{' '}
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#8b5cf6' }}>
                identity
              </span>
              <br />
              with your actions.
            </h1>

            <p className="text-[#808090] text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Declare who you are. Track what you do. Get challenged when you drift. A performance operating system for high-agency individuals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8"
                onClick={onGetStarted}
                style={{ boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 4px 12px rgba(0,0,0,0.3)' }}
              >
                Begin Declaration
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto px-8 text-[#808090] hover:text-[#e8e8f0]"
                onClick={onSkip}
              >
                Explore First
              </Button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#606080]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Compass size={11} className="text-violet-400" />
                Identity Architecture
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Layers size={11} className="text-blue-400" />
                Gap Detection Engine
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Shield size={11} className="text-emerald-400" />
                Alignment Intelligence
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Zap size={11} style={{ color: '#FF6B35' }} />
                Challenge Engine
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center pb-6">
          <p className="text-[11px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
            Built by Vivacity Digital
          </p>
        </div>
      </div>
    </div>
  )
}
