import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface DomainContribution {
  domain: string
  contribution: number
  color: string
}

interface Props {
  direction?: number // degrees 0-360
  speed?: number // 0-100
  contributions?: DomainContribution[]
}

const DEFAULT_CONTRIBUTIONS: DomainContribution[] = [
  { domain: 'Health', contribution: 25, color: '#22c55e' },
  { domain: 'Work', contribution: 35, color: '#3b82f6' },
  { domain: 'Wealth', contribution: 15, color: '#eab308' },
  { domain: 'Learning', contribution: 15, color: '#8b5cf6' },
  { domain: 'Social', contribution: 10, color: '#FF6B35' },
]

export function MomentumVectorDial({
  direction = 72,
  speed = 64,
  contributions = DEFAULT_CONTRIBUTIONS,
}: Props) {
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
    ctx.fillText('MOMENTUM DIAL', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 115
    const outerR = Math.min(width * 0.32, 75)
    const innerR = outerR * 0.65

    // Outer arc — segmented by domain
    let startAngle = -Math.PI / 2
    const total = contributions.reduce((s, c) => s + c.contribution, 0)
    contributions.forEach(c => {
      const sweep = (c.contribution / total) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep)
      ctx.arc(cx, cy, outerR - 6, startAngle + sweep, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = `${c.color}30`
      ctx.fill()
      ctx.strokeStyle = `${c.color}50`
      ctx.lineWidth = 0.5
      ctx.stroke()
      startAngle += sweep
    })

    // Inner circle
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.surface
    ctx.fill()
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()

    // Speed arc
    const speedAngle = (speed / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx, cy, innerR - 4, -Math.PI / 2, -Math.PI / 2 + speedAngle)
    const speedColor = speed >= 60 ? '#22c55e' : speed >= 30 ? '#eab308' : '#ef4444'
    ctx.strokeStyle = speedColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.lineCap = 'butt'

    // Needle (direction)
    const needleAngle = (direction / 360) * Math.PI * 2 - Math.PI / 2
    const needleLen = innerR - 12
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen)
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 2
    ctx.stroke()

    // Needle tip
    ctx.beginPath()
    ctx.arc(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#7c3aed'
    ctx.fill()

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.fill()

    // Speed value
    ctx.font = `700 14px 'Inter', sans-serif`
    ctx.fillStyle = speedColor
    ctx.textAlign = 'center'
    ctx.fillText(`${speed}`, cx, cy + outerR + 24)
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText(`SPEED · ${direction}°`, cx, cy + outerR + 34)

  }, [width, direction, speed, contributions])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
