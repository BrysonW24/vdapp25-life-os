import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Lives Impacted Counter
 * KPI grid: Meals funded, Education years, Health interventions, Trees planted.
 * Each KPI as a large number with unit, colour-coded, with mini sparkline trend.
 * Cumulative "Lives touched" headline number.
 */

interface KPI {
  label: string
  value: number
  unit: string
  color: string
  trend: number[]   // relative monthly values (last 12 months)
  formatter: (v: number) => string
}

const KPIS: KPI[] = [
  {
    label: 'Meals funded',
    value: 4840,
    unit: 'meals',
    color: '#FF6B35',
    trend: [180, 200, 210, 220, 200, 230, 380, 400, 420, 410, 420, 380],
    formatter: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`,
  },
  {
    label: 'Education yrs',
    value: 38,
    unit: 'child-years',
    color: '#3b82f6',
    trend: [2, 2, 3, 3, 3, 4, 3, 3, 4, 4, 5, 4],
    formatter: v => `${v}`,
  },
  {
    label: 'Health interv.',
    value: 126,
    unit: 'treatments',
    color: '#22c55e',
    trend: [8, 9, 10, 10, 11, 10, 10, 12, 11, 12, 12, 11],
    formatter: v => `${v}`,
  },
  {
    label: 'Trees planted',
    value: 320,
    unit: 'trees',
    color: '#8b5cf6',
    trend: [20, 20, 25, 25, 25, 30, 25, 30, 30, 30, 30, 30],
    formatter: v => `${v}`,
  },
]

const LIVES_TOUCHED = 2140

export function LivesImpactedCounter() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 260

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

    const mt = 26, mb = 24, ml = 8, mr = 8
    const availW = width - ml - mr
    const availH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('LIVES IMPACTED COUNTER', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Headline
    ctx.font = `700 ${chartFontSize(20, width)}px 'Inter', sans-serif`
    ctx.fillStyle = CHART_COLORS.accent
    ctx.textAlign = 'center'
    ctx.fillText(`${LIVES_TOUCHED.toLocaleString()}`, width / 2, mt + 28)

    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('LIVES TOUCHED (ESTIMATED TOTAL)', width / 2, mt + 40)

    // KPI grid
    const cols = width < 340 ? 2 : 4
    const cardW = Math.floor(availW / cols)
    const cardH = Math.floor((availH - 56) / (width < 340 ? 2 : 1))
    const cardY0 = mt + 52

    KPIS.forEach((kpi, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = ml + col * cardW
      const y = cardY0 + row * cardH

      // Card bg
      ctx.fillStyle = `${kpi.color}10`
      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, cardW - 4, cardH - 4, 4)
      ctx.fill()

      ctx.strokeStyle = `${kpi.color}30`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Label
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(kpi.label, x + cardW / 2, y + 14)

      // Value
      ctx.font = `700 ${chartFontSize(16, width)}px 'Inter', sans-serif`
      ctx.fillStyle = kpi.color
      ctx.fillText(kpi.formatter(kpi.value), x + cardW / 2, y + cardH / 2 + 4)

      // Unit
      ctx.font = `400 ${chartFontSize(5.5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = `${kpi.color}80`
      ctx.fillText(kpi.unit, x + cardW / 2, y + cardH / 2 + 16)

      // Mini sparkline
      const spW = cardW - 16
      const spH = 14
      const spX0 = x + 8
      const spY0 = y + cardH - 18
      const maxT = Math.max(...kpi.trend)
      ctx.beginPath()
      kpi.trend.forEach((v, ti) => {
        const sx = spX0 + (ti / (kpi.trend.length - 1)) * spW
        const sy = spY0 + spH - (v / maxT) * spH
        if (ti === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      })
      ctx.strokeStyle = `${kpi.color}60`
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Bottom note
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Cumulative from giving + time + leverage', width / 2, height - 6)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
