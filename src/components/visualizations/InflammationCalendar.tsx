import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Inflammation Calendar — 90-day contribution-graph-style heatmap.
 *
 * Each cell colored on a spectrum:
 *   deep green (#22c55e) = anti-inflammatory day
 *   deep red (#ef4444) = inflammatory day
 *
 * Score aggregated from food quality, sleep, stress, and alcohol signals.
 * Month labels shown along top.
 */

interface DaySignal {
  date: string        // YYYY-MM-DD
  score: number       // -1 (inflammatory) to 1 (anti-inflammatory)
}

interface Props {
  data?: DaySignal[]
}

function generateSample(): DaySignal[] {
  const days: DaySignal[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    // Simulate: mostly neutral with spikes
    const base = Math.sin(i * 0.15) * 0.3
    const noise = (Math.random() - 0.5) * 0.8
    const alcohol = Math.random() > 0.85 ? -0.4 : 0
    const exercise = Math.random() > 0.6 ? 0.2 : 0
    const score = Math.max(-1, Math.min(1, base + noise + alcohol + exercise))
    days.push({
      date: d.toISOString().split('T')[0],
      score: Math.round(score * 100) / 100,
    })
  }
  return days
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function interpolateColor(score: number): string {
  // score: -1 (red) to 1 (green), 0 = neutral dark
  const t = (score + 1) / 2 // 0 to 1
  if (t < 0.5) {
    // Red to neutral
    const f = t / 0.5
    const r = Math.round(239 - f * (239 - 30))
    const g = Math.round(68 + f * (30 - 68))
    const b = Math.round(68 + f * (48 - 68))
    return `rgb(${r},${g},${b})`
  } else {
    // Neutral to green
    const f = (t - 0.5) / 0.5
    const r = Math.round(30 + f * (34 - 30))
    const g = Math.round(30 + f * (197 - 30))
    const b = Math.round(48 + f * (94 - 48))
    return `rgb(${r},${g},${b})`
  }
}

export function InflammationCalendar({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const days = useMemo(() => data ?? generateSample(), [data])

  // Build grid: 7 rows (Mon-Sun), ~13 weeks
  const grid = useMemo(() => {
    const cells: { col: number; row: number; date: string; score: number; month: number }[] = []
    if (days.length === 0) return { cells, weeks: 0, monthLabels: [] as { label: string; col: number }[] }

    const firstDate = new Date(days[0].date)
    const firstDow = (firstDate.getDay() + 6) % 7 // Mon=0

    days.forEach((d, i) => {
      const dayOffset = firstDow + i
      const col = Math.floor(dayOffset / 7)
      const row = dayOffset % 7
      const dateObj = new Date(d.date)
      cells.push({ col, row, date: d.date, score: d.score, month: dateObj.getMonth() })
    })

    const weeks = cells.length > 0 ? cells[cells.length - 1].col + 1 : 0

    // Month labels — find first cell of each month
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    for (const c of cells) {
      if (c.month !== lastMonth) {
        monthLabels.push({ label: MONTH_NAMES[c.month], col: c.col })
        lastMonth = c.month
      }
    }

    return { cells, weeks, monthLabels }
  }, [days])

  const cellGap = 2
  const leftPad = 24
  const topPad = 32
  const cellSize = Math.max(6, Math.min(14, Math.floor((width - leftPad - 16) / Math.max(grid.weeks, 1)) - cellGap))
  const canvasHeight = topPad + 7 * (cellSize + cellGap) + 20

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 150 || grid.cells.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, canvasHeight)

    // Title
    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('INFLAMMATION CALENDAR', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Month labels along top
    ctx.font = `400 7px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textMuted
    ctx.textAlign = 'left'
    for (const ml of grid.monthLabels) {
      const x = leftPad + ml.col * (cellSize + cellGap)
      ctx.fillText(ml.label, x, topPad - 6)
    }

    // Day labels (Mon, Wed, Fri)
    const dayLabels = ['M', '', 'W', '', 'F', '', 'S']
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'right'
    dayLabels.forEach((label, i) => {
      if (label) {
        ctx.fillText(label, leftPad - 4, topPad + i * (cellSize + cellGap) + cellSize * 0.75)
      }
    })

    // Cells
    for (const cell of grid.cells) {
      const x = leftPad + cell.col * (cellSize + cellGap)
      const y = topPad + cell.row * (cellSize + cellGap)

      ctx.fillStyle = interpolateColor(cell.score)
      ctx.globalAlpha = 0.3 + Math.abs(cell.score) * 0.6

      const radius = Math.min(2, cellSize / 4)
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, radius)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Legend at bottom
    const legendY = topPad + 7 * (cellSize + cellGap) + 8
    const legendW = Math.min(120, width * 0.4)
    const legendX = width / 2 - legendW / 2
    const legendH = 6

    // Gradient bar
    const grad = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0)
    grad.addColorStop(0, '#ef4444')
    grad.addColorStop(0.5, CHART_COLORS.surfaceLight)
    grad.addColorStop(1, '#22c55e')
    ctx.fillStyle = grad
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.roundRect(legendX, legendY, legendW, legendH, 2)
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('Inflammatory', legendX, legendY + legendH + 10)
    ctx.textAlign = 'right'
    ctx.fillText('Anti-inflammatory', legendX + legendW, legendY + legendH + 10)
  }, [width, canvasHeight, grid])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
