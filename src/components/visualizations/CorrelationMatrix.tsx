import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Correlation Matrix — five pillar nodes arranged as a pentagon.
 * Connecting lines between every node pair show the strength and
 * direction of correlation. Thick green = synergy, thin red = conflict,
 * amber = weak/neutral.
 *
 * "At a glance, you see where the system is healthy and where
 * it's fighting itself."
 */

type CorrelationStrength = 'strong-positive' | 'positive' | 'neutral' | 'negative' | 'strong-negative'

interface PillarCorrelation {
  from: string
  to: string
  strength: CorrelationStrength
  note?: string
}

interface Props {
  correlations?: PillarCorrelation[]
}

const PILLARS = [
  { key: 'health', label: 'Health',  icon: '♥', color: '#22c55e' },
  { key: 'wealth', label: 'Wealth',  icon: '◆', color: '#eab308' },
  { key: 'family', label: 'Family',  icon: '★', color: '#8b5cf6' },
  { key: 'work',   label: 'Work',    icon: '⚡', color: '#3b82f6' },
  { key: 'legacy', label: 'Legacy',  icon: '∞', color: '#FF6B35' },
]

const DEFAULT_CORRELATIONS: PillarCorrelation[] = [
  { from: 'health', to: 'work',   strength: 'strong-positive', note: 'Exercise → better output' },
  { from: 'health', to: 'family', strength: 'positive',        note: 'Energy enables presence' },
  { from: 'health', to: 'wealth', strength: 'positive',        note: 'Clarity → better decisions' },
  { from: 'health', to: 'legacy', strength: 'neutral',         note: 'Indirect long-term' },
  { from: 'work',   to: 'family', strength: 'negative',        note: 'Displacement risk' },
  { from: 'work',   to: 'wealth', strength: 'strong-positive', note: 'Direct income driver' },
  { from: 'work',   to: 'legacy', strength: 'positive',        note: 'Building assets' },
  { from: 'wealth', to: 'family', strength: 'neutral',         note: 'Enables experiences' },
  { from: 'wealth', to: 'legacy', strength: 'positive',        note: 'Resources to build' },
  { from: 'family', to: 'legacy', strength: 'positive',        note: 'Purpose driver' },
]

const STRENGTH_CONFIG: Record<CorrelationStrength, { color: string; width: number; dash: number[] }> = {
  'strong-positive': { color: '#22c55e', width: 3,   dash: [] },
  'positive':        { color: '#22c55e', width: 1.5, dash: [] },
  'neutral':         { color: '#eab308', width: 1,   dash: [4, 3] },
  'negative':        { color: '#ef4444', width: 1.5, dash: [] },
  'strong-negative': { color: '#ef4444', width: 3,   dash: [] },
}

export function CorrelationMatrix({ correlations = DEFAULT_CORRELATIONS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 380)
  const height = size

  // Pentagon node positions
  const nodes = useMemo(() => {
    const cx = size / 2
    const cy = size / 2 + 8
    const r = size / 2 - 50

    return PILLARS.map((p, i) => {
      const angle = (i * 2 * Math.PI) / PILLARS.length - Math.PI / 2
      return {
        ...p,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      }
    })
  }, [size])

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
    const cy = size / 2 + 8
    let animFrame: number
    let time = 0

    function draw() {
      time += 0.01
      ctx.clearRect(0, 0, size, height)

      // Background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2)
      bgGrad.addColorStop(0, 'rgba(139, 92, 246, 0.04)')
      bgGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, size, height)

      // Pentagon outline (faint)
      ctx.beginPath()
      nodes.forEach((node, i) => {
        if (i === 0) ctx.moveTo(node.x, node.y)
        else ctx.lineTo(node.x, node.y)
      })
      ctx.closePath()
      ctx.strokeStyle = 'rgba(45, 45, 78, 0.2)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Draw correlation lines
      correlations.forEach(corr => {
        const fromNode = nodes.find(n => n.key === corr.from)
        const toNode = nodes.find(n => n.key === corr.to)
        if (!fromNode || !toNode) return

        const config = STRENGTH_CONFIG[corr.strength]

        ctx.beginPath()
        ctx.setLineDash(config.dash)
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = config.color
        ctx.lineWidth = config.width
        ctx.globalAlpha = 0.4 + config.width * 0.1

        // Subtle pulse for strong correlations
        if (corr.strength.startsWith('strong')) {
          ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 2)
        }

        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1

        // Midpoint label for strong correlations
        if (corr.strength.startsWith('strong') && corr.note) {
          const mx = (fromNode.x + toNode.x) / 2
          const my = (fromNode.y + toNode.y) / 2
          ctx.font = `400 5px 'JetBrains Mono', monospace`
          ctx.fillStyle = config.color
          ctx.globalAlpha = 0.4
          ctx.textAlign = 'center'
          ctx.fillText(corr.note, mx, my - 4)
          ctx.globalAlpha = 1
        }
      })

      // Draw nodes
      nodes.forEach(node => {
        // Outer glow
        const nodeGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 22)
        nodeGrad.addColorStop(0, `${node.color}25`)
        nodeGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = nodeGrad
        ctx.beginPath()
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.fillStyle = `${node.color}40`
        ctx.beginPath()
        ctx.arc(node.x, node.y, 14, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = node.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1

        // Icon
        ctx.font = `500 12px 'Inter', sans-serif`
        ctx.fillStyle = node.color
        ctx.textAlign = 'center'
        ctx.fillText(node.icon, node.x, node.y + 5)

        // Label below
        ctx.font = `600 8px 'JetBrains Mono', monospace`
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.7
        ctx.fillText(node.label, node.x, node.y + 28)
        ctx.globalAlpha = 1
      })

      // Title
      ctx.font = `500 8px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('CORRELATION MATRIX', size / 2, 14)
      ctx.letterSpacing = '0px'

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, nodes, correlations])

  // Summary stats
  const positive = correlations.filter(c => c.strength.includes('positive')).length
  const negative = correlations.filter(c => c.strength.includes('negative')).length
  const neutral = correlations.filter(c => c.strength === 'neutral').length

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <StatChip label="Synergy" value={positive} color="#22c55e" />
          <StatChip label="Conflict" value={negative} color="#ef4444" />
          <StatChip label="Neutral" value={neutral} color="#eab308" />
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {correlations.length} connections
        </span>
      </div>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
      <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span className="text-[9px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color }}>{value}</span>
    </div>
  )
}
