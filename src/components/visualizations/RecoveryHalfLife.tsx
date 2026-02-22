import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface StressEvent {
  label: string
  peakStress: number
  recoveryDays: number
}

interface Props {
  avgRecoveryDays?: number
  events?: StressEvent[]
}

const DEFAULT_EVENTS: StressEvent[] = [
  { label: 'Project deadline', peakStress: 85, recoveryDays: 4.2 },
  { label: 'Family conflict', peakStress: 72, recoveryDays: 2.8 },
  { label: 'Financial shock', peakStress: 90, recoveryDays: 6.1 },
]

export function RecoveryHalfLife({ avgRecoveryDays = 4.4, events = DEFAULT_EVENTS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('RECOVERY HALF-LIFE', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Main gauge arc
    const gaugeColor = avgRecoveryDays <= 3 ? '#22c55e' : avgRecoveryDays <= 5 ? '#eab308' : '#ef4444'
    const gaugeCx = width / 2
    const gaugeCy = 75
    const gaugeR = Math.min(width * 0.25, 50)
    const startAngle = Math.PI * 0.8
    const endAngle = Math.PI * 2.2
    const valueAngle = startAngle + (Math.min(avgRecoveryDays, 10) / 10) * (endAngle - startAngle)

    // Track
    ctx.beginPath()
    ctx.arc(gaugeCx, gaugeCy, gaugeR, startAngle, endAngle)
    ctx.strokeStyle = CHART_COLORS.surfaceLight
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // Fill
    ctx.beginPath()
    ctx.arc(gaugeCx, gaugeCy, gaugeR, startAngle, valueAngle)
    ctx.strokeStyle = gaugeColor
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // Value
    ctx.font = `700 ${chartFontSize(18, width)}px 'Inter', sans-serif`
    ctx.fillStyle = gaugeColor
    ctx.textAlign = 'center'
    ctx.fillText(`${avgRecoveryDays.toFixed(1)}`, gaugeCx, gaugeCy + 5)

    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('days avg recovery', gaugeCx, gaugeCy + 16)

    // Mini event recovery curves
    const eventStartY = 115
    const eventH = 24
    const eventW = width - 24

    events.forEach((ev, i) => {
      const y = eventStartY + i * (eventH + 6)
      const evColor = ev.recoveryDays <= 3 ? '#22c55e' : ev.recoveryDays <= 5 ? '#eab308' : '#ef4444'

      // Label
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'left'
      ctx.fillText(ev.label, 12, y + 6)

      // Mini decay curve
      const curveStart = 120
      const curveW = eventW - curveStart
      ctx.beginPath()
      for (let t = 0; t <= 1; t += 0.02) {
        const x = curveStart + t * curveW
        const stress = ev.peakStress * Math.exp(-t * 4)
        const cy2 = y + eventH - (stress / 100) * eventH
        if (t === 0) ctx.moveTo(x, cy2)
        else ctx.lineTo(x, cy2)
      }
      ctx.strokeStyle = evColor
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Recovery days
      ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = evColor
      ctx.textAlign = 'right'
      ctx.fillText(`${ev.recoveryDays}d`, width - 12, y + 14)
    })

  }, [width, avgRecoveryDays, events])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
