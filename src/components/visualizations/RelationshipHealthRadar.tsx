import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Relationship {
  name: string
  color: string
  scores: { frequency: number; depth: number; support: number; growth: number; tone: number }
}

interface Props {
  relationships?: Relationship[]
}

const DEFAULT_RELATIONSHIPS: Relationship[] = [
  { name: 'Partner', color: '#ef4444', scores: { frequency: 85, depth: 78, support: 90, growth: 65, tone: 82 } },
  { name: 'Best Friend', color: '#3b82f6', scores: { frequency: 55, depth: 88, support: 72, growth: 80, tone: 90 } },
  { name: 'Mentor', color: '#22c55e', scores: { frequency: 40, depth: 70, support: 60, growth: 92, tone: 75 } },
  { name: 'Sibling', color: '#8b5cf6', scores: { frequency: 60, depth: 65, support: 80, growth: 45, tone: 70 } },
]

const AXES = ['Frequency', 'Depth', 'Support', 'Growth', 'Tone']

export function RelationshipHealthRadar({ relationships = DEFAULT_RELATIONSHIPS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 240

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 200) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('RELATIONSHIP HEALTH', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 130
    const maxR = Math.min(width * 0.32, 80)
    const n = AXES.length

    // Grid rings
    for (let ring = 0.25; ring <= 1; ring += 0.25) {
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * maxR * ring
        const y = cy + Math.sin(angle) * maxR * ring
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Axis lines + labels
    AXES.forEach((axis, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * maxR
      const y = cy + Math.sin(angle) * maxR

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.stroke()

      const lx = cx + Math.cos(angle) * (maxR + 14)
      const ly = cy + Math.sin(angle) * (maxR + 14)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(axis, lx, ly + 3)
    })

    // Draw each relationship polygon
    relationships.forEach(rel => {
      const vals = [rel.scores.frequency, rel.scores.depth, rel.scores.support, rel.scores.growth, rel.scores.tone]

      ctx.beginPath()
      vals.forEach((v, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const r = (v / 100) * maxR
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = `${rel.color}15`
      ctx.fill()
      ctx.strokeStyle = rel.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Dots
      vals.forEach((v, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const r = (v / 100) * maxR
        ctx.beginPath()
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 2, 0, Math.PI * 2)
        ctx.fillStyle = rel.color
        ctx.fill()
      })
    })

  }, [width, relationships])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-3 mt-2 pt-2 flex-wrap" style={{ borderTop: '1px solid #2d2d4e' }}>
        {relationships.map(r => (
          <div key={r.name} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
