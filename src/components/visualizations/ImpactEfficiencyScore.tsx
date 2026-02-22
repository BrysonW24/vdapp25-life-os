import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Impact Efficiency Score
 * Three horizontal progress bars: impact per hour, per $1, per system built.
 * Score + trend arrow per gauge.
 * Bottom: generational projection — if X% of philosophy is inherited.
 */

interface Gauge {
  label: string
  sublabel: string
  score: number     // 0–100
  trend: number     // delta from last month
  unit: string
  color: string
}

const GAUGES: Gauge[] = [
  {
    label: 'Impact per hour',
    sublabel: 'Leverage: volunteer + mentorship + creation',
    score: 74,
    trend: +6,
    unit: '74 / 100',
    color: '#22c55e',
  },
  {
    label: 'Impact per $1',
    sublabel: 'GiveWell-weighted effectiveness score',
    score: 68,
    trend: +3,
    unit: '68 / 100',
    color: '#3b82f6',
  },
  {
    label: 'System leverage',
    sublabel: 'Replicable systems built × reach',
    score: 55,
    trend: +12,
    unit: '55 / 100',
    color: '#8b5cf6',
  },
]

const GEN_INHERITANCE = 65  // % of philosophy expected to be passed on

export function ImpactEfficiencyScore() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rowH = 56
  const headerH = 30
  const footerH = 60
  const height = headerH + GAUGES.length * rowH + footerH

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
    ctx.clearRect(0, 0, width, height)

    const ml = 16, mr = 16

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('IMPACT EFFICIENCY SCORE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const barAreaW = width - ml - mr
    const labelW = width < 320 ? Math.min(90, width * 0.32) : 140
    const barW = Math.max(60, barAreaW - labelW - 8)
    const barX0 = ml + labelW + 8
    const barH = 10

    GAUGES.forEach((g, i) => {
      const y = headerH + i * rowH
      const barY = y + rowH / 2 - barH / 2

      // Row separator
      if (i > 0) {
        ctx.beginPath()
        ctx.moveTo(ml, y)
        ctx.lineTo(width - mr, y)
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Label
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = g.color
      ctx.textAlign = 'left'
      let lbl = g.label
      while (ctx.measureText(lbl).width > labelW - 4 && lbl.length > 3) lbl = lbl.slice(0, -1)
      if (lbl !== g.label) lbl += '…'
      ctx.fillText(lbl, ml, y + 14)

      // Sublabel
      if (labelW >= 100 && width >= 320) {
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textDim
        let sub = g.sublabel
        while (ctx.measureText(sub).width > labelW - 4 && sub.length > 3) sub = sub.slice(0, -1)
        if (sub !== g.sublabel) sub += '…'
        ctx.fillText(sub, ml, y + 26)
      }

      // Bar background
      ctx.fillStyle = `${g.color}15`
      ctx.beginPath()
      ctx.roundRect(barX0, barY, barW, barH, 3)
      ctx.fill()

      // Bar fill
      const fillW = (g.score / 100) * barW
      ctx.fillStyle = `${g.color}80`
      ctx.beginPath()
      ctx.roundRect(barX0, barY, fillW, barH, 3)
      ctx.fill()

      // Score label
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = g.color
      ctx.textAlign = 'left'
      ctx.fillText(g.unit, barX0 + fillW + 6, barY + barH - 1)

      // Trend arrow
      const trendColor = g.trend > 0 ? CHART_COLORS.aligned : CHART_COLORS.avoiding
      const trendLabel = g.trend > 0 ? `▲${g.trend}` : `▼${Math.abs(g.trend)}`
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = trendColor
      ctx.textAlign = 'right'
      ctx.fillText(trendLabel, width - mr, barY + barH - 1)
    })

    // Footer divider
    const footerY = headerH + GAUGES.length * rowH
    ctx.beginPath()
    ctx.moveTo(ml, footerY + 4)
    ctx.lineTo(width - mr, footerY + 4)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Generational projection
    const overallScore = Math.round(GAUGES.reduce((s, g) => s + g.score, 0) / GAUGES.length)

    ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('GENERATIONAL PROJECTION', ml, footerY + 18)

    ctx.font = `700 ${chartFontSize(18, width)}px 'Inter', sans-serif`
    ctx.fillStyle = CHART_COLORS.accent
    ctx.textAlign = 'left'
    ctx.fillText(`${GEN_INHERITANCE}%`, ml, footerY + 44)

    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('of philosophy inherited → next generation impact score:', ml + 50, footerY + 34)
    const projScore = Math.round(overallScore * (GEN_INHERITANCE / 100) * 1.3)
    ctx.font = `700 ${chartFontSize(14, width)}px 'Inter', sans-serif`
    ctx.fillStyle = CHART_COLORS.aligned
    ctx.fillText(`${projScore}/100`, ml + 50, footerY + 50)
  }, [width, height])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
