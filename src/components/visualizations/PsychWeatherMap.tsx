import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Psychological Weather Map — topographic-style mental health terrain
 * over 12 months. Contour-like fills show high elevation (good mental
 * state) in cool blues/greens, valleys (low state) in warm reds/ambers.
 * Overlay markers for significant events.
 */

interface MonthData {
  month: string
  score: number // 0-100
}

interface EventMarker {
  monthIndex: number
  label: string
  type: 'positive' | 'negative' | 'neutral'
}

interface Props {
  data?: MonthData[]
  events?: EventMarker[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEFAULT_DATA: MonthData[] = [
  { month: 'Jan', score: 55 }, { month: 'Feb', score: 48 },
  { month: 'Mar', score: 62 }, { month: 'Apr', score: 70 },
  { month: 'May', score: 75 }, { month: 'Jun', score: 60 },
  { month: 'Jul', score: 45 }, { month: 'Aug', score: 38 },
  { month: 'Sep', score: 52 }, { month: 'Oct', score: 68 },
  { month: 'Nov', score: 72 }, { month: 'Dec', score: 65 },
]

const DEFAULT_EVENTS: EventMarker[] = [
  { monthIndex: 3, label: 'Promotion', type: 'positive' },
  { monthIndex: 7, label: 'Burnout', type: 'negative' },
  { monthIndex: 10, label: 'New routine', type: 'positive' },
]

function terrainColor(score: number): string {
  // Low = warm reds/ambers, High = cool blues/greens
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#3b82f6'
  if (score >= 50) return '#6366f1'
  if (score >= 35) return '#eab308'
  return '#ef4444'
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16)
  const bh = parseInt(b.slice(1), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `rgb(${rr},${rg},${rb})`
}

function interpolateScore(data: MonthData[], x: number): number {
  const idx = x * (data.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, data.length - 1)
  const t = idx - lo
  return data[lo].score * (1 - t) + data[hi].score * t
}

export function PsychWeatherMap({
  data = DEFAULT_DATA,
  events = DEFAULT_EVENTS,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const height = 240

  // Pre-compute smooth terrain values at high resolution
  const terrain = useMemo(() => {
    const cols = Math.max(60, width)
    const rows = 40
    const grid: number[][] = []

    for (let row = 0; row < rows; row++) {
      const rowData: number[] = []
      for (let col = 0; col < cols; col++) {
        const xNorm = col / (cols - 1)
        const baseScore = interpolateScore(data, xNorm)
        // Add terrain variation based on vertical position
        const yNorm = row / (rows - 1)
        const variation = Math.sin(xNorm * Math.PI * 4 + yNorm * 2) * 8 +
          Math.cos(xNorm * 6 + yNorm * 3) * 5 +
          Math.sin(yNorm * Math.PI * 3) * 6
        rowData.push(Math.max(0, Math.min(100, baseScore + variation * (1 - Math.abs(yNorm - 0.5) * 1.5))))
      }
      grid.push(rowData)
    }
    return { grid, cols, rows }
  }, [data, width])

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

    const marginTop = 28
    const marginBottom = 24
    const marginLeft = 4
    const marginRight = 4
    const plotW = width - marginLeft - marginRight
    const plotH = height - marginTop - marginBottom

    ctx.clearRect(0, 0, width, height)

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('PSYCHOLOGICAL WEATHER MAP', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Draw terrain cells
    const { grid, cols, rows } = terrain
    const cellW = plotW / cols
    const cellH = plotH / rows

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const score = grid[row][col]
        const color = terrainColor(score)
        const intensity = 0.15 + (score / 100) * 0.45

        ctx.fillStyle = color
        ctx.globalAlpha = intensity
        ctx.fillRect(
          marginLeft + col * cellW,
          marginTop + row * cellH,
          cellW + 0.5,
          cellH + 0.5,
        )
      }
    }
    ctx.globalAlpha = 1

    // Draw contour lines at score thresholds
    const thresholds = [30, 50, 65, 80]
    thresholds.forEach(threshold => {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(232, 232, 240, 0.12)'
      ctx.lineWidth = 0.5

      for (let col = 0; col < cols - 1; col++) {
        // Find the row where score crosses threshold
        for (let row = 0; row < rows - 1; row++) {
          const v00 = grid[row][col]
          const v10 = grid[row][col + 1]
          const v01 = grid[row + 1][col]

          // Horizontal edge crossing
          if ((v00 >= threshold) !== (v10 >= threshold)) {
            const t = (threshold - v00) / (v10 - v00)
            const x = marginLeft + (col + t) * cellW
            const y = marginTop + row * cellH
            ctx.moveTo(x - 0.5, y)
            ctx.lineTo(x + 0.5, y + cellH)
          }
          // Vertical edge crossing
          if ((v00 >= threshold) !== (v01 >= threshold)) {
            const t = (threshold - v00) / (v01 - v00)
            const x = marginLeft + col * cellW
            const y = marginTop + (row + t) * cellH
            ctx.moveTo(x, y - 0.5)
            ctx.lineTo(x + cellW, y + 0.5)
          }
        }
      }
      ctx.stroke()
    })

    // Draw the main score line (altitude ridge)
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(232, 232, 240, 0.5)'
    ctx.lineWidth = 1.5
    for (let col = 0; col < cols; col++) {
      const xNorm = col / (cols - 1)
      const score = interpolateScore(data, xNorm)
      const x = marginLeft + col * cellW
      const y = marginTop + plotH * (1 - score / 100)
      if (col === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Draw event markers
    events.forEach(evt => {
      const xNorm = evt.monthIndex / (data.length - 1)
      const score = interpolateScore(data, xNorm)
      const x = marginLeft + xNorm * plotW
      const y = marginTop + plotH * (1 - score / 100)

      // Vertical dashed line
      ctx.beginPath()
      ctx.setLineDash([2, 2])
      ctx.strokeStyle = evt.type === 'positive' ? '#22c55e' :
        evt.type === 'negative' ? '#ef4444' : '#eab308'
      ctx.lineWidth = 0.8
      ctx.globalAlpha = 0.5
      ctx.moveTo(x, marginTop)
      ctx.lineTo(x, marginTop + plotH)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Marker dot
      const markerColor = evt.type === 'positive' ? '#22c55e' :
        evt.type === 'negative' ? '#ef4444' : '#eab308'

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = markerColor
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#16162a'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = markerColor
      ctx.globalAlpha = 0.8
      ctx.textAlign = 'center'
      ctx.fillText(evt.label, x, y - 8)
      ctx.globalAlpha = 1
    })

    // X-axis month labels
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    data.forEach((d, i) => {
      const x = marginLeft + (i / (data.length - 1)) * plotW
      ctx.fillText(d.month, x, height - 6)
    })

    // Y-axis labels (score ranges)
    ctx.textAlign = 'right'
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.globalAlpha = 0.6
    const yLabels = [
      { score: 80, label: 'Peak' },
      { score: 50, label: 'Baseline' },
      { score: 25, label: 'Low' },
    ]
    yLabels.forEach(({ score, label }) => {
      const y = marginTop + plotH * (1 - score / 100)
      ctx.fillText(label, marginLeft + plotW + marginRight, y + 3)
    })
    ctx.globalAlpha = 1

  }, [width, height, terrain, data, events])

  // Summary stat
  const avgScore = useMemo(() => {
    const sum = data.reduce((s, d) => s + d.score, 0)
    return Math.round(sum / data.length)
  }, [data])

  const trend = useMemo(() => {
    if (data.length < 2) return 'stable'
    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))
    const avgFirst = firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, d) => s + d.score, 0) / secondHalf.length
    if (avgSecond - avgFirst > 5) return 'improving'
    if (avgFirst - avgSecond > 5) return 'declining'
    return 'stable'
  }, [data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>AVG</span>
            <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textPrimary }}>{avgScore}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>TREND</span>
            <span className="text-[9px] font-medium" style={{
              fontFamily: 'var(--font-mono)',
              color: trend === 'improving' ? '#22c55e' : trend === 'declining' ? '#ef4444' : '#eab308',
            }}>
              {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Stable'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { color: '#22c55e', label: 'Peak' },
            { color: '#3b82f6', label: 'Good' },
            { color: '#eab308', label: 'Mid' },
            { color: '#ef4444', label: 'Low' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-0.5">
              <div className="w-2 h-1.5 rounded-sm" style={{ background: l.color, opacity: 0.6 }} />
              <span className="text-[6px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
