import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Output Orbit — every project/pursuit rendered as orbiting bodies
 * around a central star (you). Active = close bright orbit,
 * completed = stable outer orbit, abandoned = drifting and fading.
 * Animates continuously with canvas for smooth orbital motion.
 */

type ProjectStatus = 'active' | 'completed' | 'abandoned' | 'planned'

interface Project {
  name: string
  status: ProjectStatus
  intensity?: number // 0–1, how much energy invested
}

interface Props {
  projects?: Project[]
}

const DEFAULT_PROJECTS: Project[] = [
  // Active — inner orbit, bright
  { name: 'Life OS', status: 'active', intensity: 0.9 },
  { name: 'Expense HUD', status: 'active', intensity: 0.85 },
  { name: 'Data Offering', status: 'active', intensity: 0.8 },
  { name: 'VD Business', status: 'active', intensity: 0.6 },
  // Completed — outer orbit, stable
  { name: 'Client Sites', status: 'completed', intensity: 0.5 },
  { name: 'Boilerplates', status: 'completed', intensity: 0.4 },
  { name: 'VD Branding', status: 'completed', intensity: 0.3 },
  // Abandoned — drifting, fading
  { name: 'Side Exp 1', status: 'abandoned', intensity: 0.2 },
  { name: 'Side Exp 2', status: 'abandoned', intensity: 0.15 },
  { name: 'Prototype X', status: 'abandoned', intensity: 0.1 },
  // Planned — faint dotted
  { name: 'AI Advisor', status: 'planned', intensity: 0.3 },
  { name: 'Mobile App', status: 'planned', intensity: 0.2 },
]

const STATUS_CONFIG: Record<ProjectStatus, { orbitBase: number; color: string; speed: number; opacity: number }> = {
  active:    { orbitBase: 0.28, color: '#FF6B35', speed: 1.2,  opacity: 0.95 },
  completed: { orbitBase: 0.55, color: '#22c55e', speed: 0.4,  opacity: 0.5 },
  abandoned: { orbitBase: 0.75, color: '#ef4444', speed: 0.15, opacity: 0.2 },
  planned:   { orbitBase: 0.9,  color: '#3b82f6', speed: 0.08, opacity: 0.25 },
}

interface OrbitalBody {
  name: string
  status: ProjectStatus
  angle: number
  orbitR: number
  radius: number
  speed: number
  color: string
  opacity: number
}

export function OutputOrbit({ projects = DEFAULT_PROJECTS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 400)
  const height = size

  const bodies = useMemo<OrbitalBody[]>(() => {
    const grouped: Record<ProjectStatus, Project[]> = { active: [], completed: [], abandoned: [], planned: [] }
    projects.forEach(p => grouped[p.status].push(p))

    const result: OrbitalBody[] = []

    Object.entries(grouped).forEach(([status, items]) => {
      const config = STATUS_CONFIG[status as ProjectStatus]
      items.forEach((p, i) => {
        const angleSpread = (2 * Math.PI) / Math.max(items.length, 1)
        const jitter = (Math.random() - 0.5) * 0.08 // slight randomness
        result.push({
          name: p.name,
          status: status as ProjectStatus,
          angle: i * angleSpread + Math.random() * 0.5,
          orbitR: config.orbitBase + jitter + i * 0.04,
          radius: 3 + (p.intensity ?? 0.5) * 6,
          speed: config.speed * (0.8 + Math.random() * 0.4),
          color: config.color,
          opacity: config.opacity,
        })
      })
    })

    return result
  }, [projects])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = height * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const maxR = size / 2 - 20
    let animFrame: number
    let time = 0

    function draw() {
      time += 0.008
      ctx.clearRect(0, 0, size, height)

      // Background radial glow
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      radGrad.addColorStop(0, 'rgba(124, 58, 237, 0.06)')
      radGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.02)')
      radGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = radGrad
      ctx.fillRect(0, 0, size, height)

      // Orbit rings (faint)
      const rings = [0.28, 0.55, 0.75, 0.9]
      rings.forEach(pct => {
        const r = pct * maxR
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(45, 45, 78, 0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Planned orbit rings — dashed
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.arc(cx, cy, 0.9 * maxR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(45, 45, 78, 0.2)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.setLineDash([])

      // Central star (you)
      const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14)
      starGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      starGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.7)')
      starGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')
      ctx.fillStyle = starGrad
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fill()

      // Inner core
      ctx.fillStyle = '#e8e8f0'
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw orbital bodies
      bodies.forEach(body => {
        const angle = body.angle + time * body.speed
        const r = body.orbitR * maxR
        const bx = cx + Math.cos(angle) * r
        const by = cy + Math.sin(angle) * r

        // Trail (for active projects)
        if (body.status === 'active') {
          ctx.beginPath()
          for (let t = 0; t < 0.8; t += 0.02) {
            const ta = angle - t
            const tx = cx + Math.cos(ta) * r
            const ty = cy + Math.sin(ta) * r
            if (t === 0) ctx.moveTo(tx, ty)
            else ctx.lineTo(tx, ty)
          }
          ctx.strokeStyle = `rgba(255, 107, 53, ${0.15})`
          ctx.lineWidth = body.radius * 0.6
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        // Glow
        if (body.opacity > 0.4) {
          ctx.shadowColor = body.color
          ctx.shadowBlur = 8
        }

        // Body
        ctx.beginPath()
        ctx.arc(bx, by, body.radius, 0, Math.PI * 2)
        ctx.fillStyle = body.color
        ctx.globalAlpha = body.opacity
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0

        // Label
        ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = body.color
        ctx.globalAlpha = Math.min(body.opacity + 0.15, 0.8)
        ctx.textAlign = 'center'
        ctx.fillText(body.name, bx, by + body.radius + 10)
        ctx.globalAlpha = 1
      })

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('OUTPUT ORBIT', size / 2, 12)
      ctx.letterSpacing = '0px'

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, bodies])

  // Count by status
  const counts = useMemo(() => {
    const c = { active: 0, completed: 0, abandoned: 0, planned: 0 }
    projects.forEach(p => c[p.status]++)
    return c
  }, [projects])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <LegendDot color={STATUS_CONFIG.active.color} label={`Active (${counts.active})`} />
        <LegendDot color={STATUS_CONFIG.completed.color} label={`Stable (${counts.completed})`} />
        <LegendDot color={STATUS_CONFIG.abandoned.color} label={`Drifting (${counts.abandoned})`} />
        <LegendDot color={STATUS_CONFIG.planned.color} label={`Planned (${counts.planned})`} />
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
    </div>
  )
}
