import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Stage {
  label: string
  strength: number // 0-100
  color: string
}

interface Props {
  stages?: Stage[]
  rpm?: number // rotational metaphor 0-100
}

const DEFAULT_STAGES: Stage[] = [
  { label: 'ACQUIRE', strength: 75, color: '#3b82f6' },
  { label: 'PRACTICE', strength: 60, color: '#8b5cf6' },
  { label: 'CONNECT', strength: 45, color: '#22c55e' },
  { label: 'TEACH', strength: 30, color: '#FF6B35' },
  { label: 'CREATE', strength: 55, color: '#eab308' },
]

export function KnowledgeFlywheel({ stages = DEFAULT_STAGES, rpm = 58 }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 220

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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('KNOWLEDGE FLYWHEEL', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 118
    const outerR = Math.min(width * 0.32, 75)
    const n = stages.length

    // Outer segments
    stages.forEach((stage, i) => {
      const startAngle = (i / n) * Math.PI * 2 - Math.PI / 2
      const endAngle = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
      const r = outerR * (0.5 + (stage.strength / 100) * 0.5)

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = `${stage.color}20`
      ctx.fill()

      // Segment arc border
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.strokeStyle = stage.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label
      const midAngle = (startAngle + endAngle) / 2
      const labelR = outerR + 14
      const lx = cx + Math.cos(midAngle) * labelR
      const ly = cy + Math.sin(midAngle) * labelR
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = stage.color
      ctx.textAlign = 'center'
      ctx.fillText(stage.label, lx, ly + 2)
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${stage.strength}%`, lx, ly + 10)

      // Arrow between segments
      const arrowAngle = endAngle
      const arrowR = outerR * 0.45
      const ax = cx + Math.cos(arrowAngle) * arrowR
      const ay = cy + Math.sin(arrowAngle) * arrowR
      ctx.beginPath()
      ctx.arc(ax, ay, 2, 0, Math.PI * 2)
      ctx.fillStyle = CHART_COLORS.border
      ctx.fill()
    })

    // Center — RPM
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.surface
    ctx.fill()
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()

    const rpmColor = rpm >= 60 ? '#22c55e' : rpm >= 35 ? '#eab308' : '#ef4444'
    ctx.font = `700 14px 'Inter', sans-serif`
    ctx.fillStyle = rpmColor
    ctx.textAlign = 'center'
    ctx.fillText(`${rpm}`, cx, cy + 4)
    ctx.font = `400 5px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('RPM', cx, cy + 12)

  }, [width, stages, rpm])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
