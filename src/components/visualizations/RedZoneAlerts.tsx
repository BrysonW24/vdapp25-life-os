import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Alert {
  domain: string
  metric: string
  value: number
  threshold: number
  severity: 'warning' | 'critical'
  daysInZone: number
}

interface Props {
  alerts?: Alert[]
}

const DEFAULT_ALERTS: Alert[] = [
  { domain: 'Work', metric: 'Hours/week', value: 62, threshold: 50, severity: 'critical', daysInZone: 14 },
  { domain: 'Sleep', metric: 'Avg hours', value: 5.8, threshold: 7, severity: 'critical', daysInZone: 21 },
  { domain: 'Exercise', metric: 'Sessions/wk', value: 1, threshold: 3, severity: 'warning', daysInZone: 10 },
  { domain: 'Social', metric: 'Interactions', value: 2, threshold: 5, severity: 'warning', daysInZone: 7 },
]

export function RedZoneAlerts({ alerts = DEFAULT_ALERTS }: Props) {
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
    ctx.fillText('RED ZONE ALERTS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28
    const cardW = width - ml - mr
    const cardH = 36
    const gap = 6

    alerts.forEach((alert, i) => {
      const y = mt + i * (cardH + gap)
      const color = alert.severity === 'critical' ? '#ef4444' : '#eab308'

      // Card bg
      ctx.fillStyle = `${color}08`
      ctx.strokeStyle = `${color}30`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(ml, y, cardW, cardH, 6)
      ctx.fill()
      ctx.stroke()

      // Severity dot
      ctx.beginPath()
      ctx.arc(ml + 12, y + cardH / 2, 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Domain + metric
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(alert.domain.toUpperCase(), ml + 22, y + 13)

      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.fillText(`${alert.metric}: ${alert.value} (threshold: ${alert.threshold})`, ml + 22, y + 24)

      // Days in zone badge
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(`${alert.daysInZone}d`, ml + cardW - 10, y + 13)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText('in zone', ml + cardW - 10, y + 22)
    })

    // Summary
    const critical = alerts.filter(a => a.severity === 'critical').length
    const warnings = alerts.filter(a => a.severity === 'warning').length
    const summaryY = mt + alerts.length * (cardH + gap) + 8
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = critical > 0 ? '#ef4444' : '#eab308'
    ctx.fillText(`${critical} CRITICAL · ${warnings} WARNING`, width / 2, summaryY)

  }, [width, alerts])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
