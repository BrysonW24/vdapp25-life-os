import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface DecayEvent {
  label: string
  daysAgo: number
  halfLife: number
  initialValue: number
  color: string
}

interface Props {
  events?: DecayEvent[]
}

const DEFAULT_EVENTS: DecayEvent[] = [
  { label: 'Gym session', daysAgo: 2, halfLife: 3, initialValue: 90, color: '#22c55e' },
  { label: 'Meditation', daysAgo: 1, halfLife: 1, initialValue: 75, color: '#8b5cf6' },
  { label: 'Deep work', daysAgo: 0, halfLife: 2, initialValue: 85, color: '#3b82f6' },
  { label: 'Social event', daysAgo: 5, halfLife: 7, initialValue: 80, color: '#FF6B35' },
  { label: 'Learning', daysAgo: 3, halfLife: 4, initialValue: 70, color: '#eab308' },
]

export function DecayTimeline({ events }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const data = useMemo(() => events ?? DEFAULT_EVENTS, [events])
  const height = 200

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
    ctx.fillText('DECAY TIMELINE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const maxDays = 14

    // Timeline axis
    ctx.beginPath()
    ctx.moveTo(ml, mt + chartH)
    ctx.lineTo(ml + chartW, mt + chartH)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()

    // Day markers
    for (let d = 0; d <= maxDays; d += 2) {
      const x = ml + (d / maxDays) * chartW
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(`${d}d`, x, mt + chartH + 10)

      ctx.beginPath()
      ctx.moveTo(x, mt + chartH)
      ctx.lineTo(x, mt + chartH + 3)
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // "Now" marker
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.font = `500 5px 'JetBrains Mono', monospace`
    ctx.textAlign = 'left'
    ctx.fillText('NOW', ml + 2, mt + chartH + 10)

    // Draw each event's decay curve from its start point
    data.forEach(event => {
      ctx.beginPath()
      const startX = ml + (event.daysAgo / maxDays) * chartW
      for (let d = 0; d <= maxDays - event.daysAgo; d += 0.5) {
        const x = startX + (d / maxDays) * chartW
        if (x > ml + chartW) break
        const value = event.initialValue * Math.exp(-0.693 * d / event.halfLife)
        const y = mt + chartH - (value / 100) * chartH
        if (d === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = event.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      // Current residual value (at day 0 from now)
      const currentValue = event.initialValue * Math.exp(-0.693 * event.daysAgo / event.halfLife)
      const dotX = ml // "now" is day 0
      const dotY = mt + chartH - (currentValue / 100) * chartH

      // But the event curve starts at daysAgo — mark the start
      const startY = mt + chartH - (event.initialValue / 100) * chartH
      ctx.beginPath()
      ctx.arc(startX, startY, 3, 0, Math.PI * 2)
      ctx.fillStyle = event.color
      ctx.fill()

      // Label at start
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = event.color
      ctx.textAlign = 'center'
      ctx.fillText(event.label, startX, startY - 6)
    })

    // Effective threshold
    const threshY = mt + chartH - (30 / 100) * chartH
    ctx.beginPath()
    ctx.moveTo(ml, threshY)
    ctx.lineTo(ml + chartW, threshY)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 0.5
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.3
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
