import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Nutrition x Output Scatter — correlates diet quality with cognitive output.
 *
 * X-axis: diet quality score (0-100).
 * Y-axis: deep work / cognitive output score (0-100).
 * Each dot = one day over ~90 days, colored by recency.
 * Includes trend line and correlation coefficient.
 */

interface DayPoint {
  day: number         // days ago (0 = today)
  dietQuality: number // 0-100
  cogOutput: number   // 0-100
}

interface Props {
  data?: DayPoint[]
}

function generateSample(): DayPoint[] {
  const points: DayPoint[] = []
  for (let i = 89; i >= 0; i--) {
    const diet = 30 + Math.random() * 60
    // Positive correlation with noise
    const cog = Math.min(100, Math.max(0, diet * 0.6 + 15 + (Math.random() - 0.5) * 30))
    points.push({ day: i, dietQuality: Math.round(diet), cogOutput: Math.round(cog) })
  }
  return points
}

function computeCorrelation(points: DayPoint[]): number {
  const n = points.length
  if (n < 3) return 0
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of points) {
    sumX += p.dietQuality
    sumY += p.cogOutput
    sumXY += p.dietQuality * p.cogOutput
    sumX2 += p.dietQuality * p.dietQuality
    sumY2 += p.cogOutput * p.cogOutput
  }
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  return den === 0 ? 0 : num / den
}

function computeTrendLine(points: DayPoint[]): { slope: number; intercept: number } {
  const n = points.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const p of points) {
    sumX += p.dietQuality
    sumY += p.cogOutput
    sumXY += p.dietQuality * p.cogOutput
    sumX2 += p.dietQuality * p.dietQuality
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export function NutritionOutputScatter({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const points = useMemo(() => data ?? generateSample(), [data])

  const height = Math.min(width * 0.75, 300)
  const margin = { top: 28, right: 16, bottom: 36, left: 40 }

  const correlation = useMemo(() => computeCorrelation(points), [points])
  const trend = useMemo(() => computeTrendLine(points), [points])

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

    const plotW = width - margin.left - margin.right
    const plotH = height - margin.top - margin.bottom

    const xScale = (v: number) => margin.left + (v / 100) * plotW
    const yScale = (v: number) => margin.top + plotH - (v / 100) * plotH

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('NUTRITION \u00D7 OUTPUT', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Grid lines
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 0.5
    for (let v = 0; v <= 100; v += 25) {
      // Horizontal
      ctx.beginPath()
      ctx.moveTo(margin.left, yScale(v))
      ctx.lineTo(margin.left + plotW, yScale(v))
      ctx.stroke()
      // Vertical
      ctx.beginPath()
      ctx.moveTo(xScale(v), margin.top)
      ctx.lineTo(xScale(v), margin.top + plotH)
      ctx.stroke()
    }

    // Axis lines
    ctx.strokeStyle = CHART_COLORS.axisLine
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top + plotH)
    ctx.lineTo(margin.left + plotW, margin.top + plotH)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + plotH)
    ctx.stroke()

    // Axis labels
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    for (let v = 0; v <= 100; v += 25) {
      ctx.fillText(`${v}`, xScale(v), margin.top + plotH + 12)
    }
    ctx.textAlign = 'right'
    for (let v = 0; v <= 100; v += 25) {
      ctx.fillText(`${v}`, margin.left - 6, yScale(v) + 3)
    }

    // Axis titles
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textMuted
    ctx.textAlign = 'center'
    ctx.fillText('DIET QUALITY', margin.left + plotW / 2, height - 4)

    ctx.save()
    ctx.translate(10, margin.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('COGNITIVE OUTPUT', 0, 0)
    ctx.restore()

    // Trend line
    const trendX1 = 0
    const trendX2 = 100
    const trendY1 = Math.max(0, Math.min(100, trend.slope * trendX1 + trend.intercept))
    const trendY2 = Math.max(0, Math.min(100, trend.slope * trendX2 + trend.intercept))

    ctx.beginPath()
    ctx.moveTo(xScale(trendX1), yScale(trendY1))
    ctx.lineTo(xScale(trendX2), yScale(trendY2))
    ctx.strokeStyle = CHART_COLORS.accent
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.4
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Data points — colored by recency
    const maxDay = Math.max(...points.map(p => p.day))

    // Sort by day descending so recent dots render on top
    const sorted = [...points].sort((a, b) => b.day - a.day)
    for (const p of sorted) {
      const recency = 1 - p.day / maxDay
      const alpha = 0.15 + recency * 0.75
      const radius = 2.5 + recency * 1.5

      ctx.beginPath()
      ctx.arc(xScale(p.dietQuality), yScale(p.cogOutput), radius, 0, Math.PI * 2)
      ctx.fillStyle = CHART_COLORS.brandLight
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Correlation badge — top right
    const corrColor = correlation > 0.5 ? '#22c55e' : correlation > 0.2 ? '#eab308' : '#ef4444'
    const corrLabel = `r = ${correlation.toFixed(2)}`
    ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = corrColor
    ctx.textAlign = 'right'
    ctx.fillText(corrLabel, width - margin.right, margin.top + 12)

    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textMuted
    ctx.fillText('CORRELATION', width - margin.right, margin.top + 22)
  }, [width, height, points, correlation, trend, margin.top, margin.right, margin.bottom, margin.left])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
          {points.length} days tracked
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS.brandLight, opacity: 0.9 }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Recent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS.brandLight, opacity: 0.2 }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Older</span>
          </div>
        </div>
      </div>
    </div>
  )
}
