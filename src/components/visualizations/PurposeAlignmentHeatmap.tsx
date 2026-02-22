import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Purpose Alignment Heatmap
 * X = 7 days, Y = 6 time blocks (5am–9pm)
 * Cell color = category (mission, reactive, relationships, health, recovery, noise)
 * Opacity = intensity of that category in that block
 * Shows: what % of time is truly irreversible progress vs noise
 */

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const BLOCKS = ['5–9AM', '9AM–12', '12–3PM', '3–6PM', '6–9PM', 'NIGHT']

type Category = 'mission' | 'reactive' | 'relationships' | 'health' | 'noise' | 'recovery'

const CATEGORY_COLORS: Record<Category, string> = {
  mission: '#3b82f6',
  reactive: '#eab308',
  relationships: '#8b5cf6',
  health: '#22c55e',
  noise: '#ef4444',
  recovery: '#404070',
}

const CATEGORY_LABELS: Record<Category, string> = {
  mission: 'Mission',
  reactive: 'Reactive',
  relationships: 'Social',
  health: 'Health',
  noise: 'Noise',
  recovery: 'Recovery',
}

// Seeded fake data: each cell is { category, intensity 0-1 }
function generateData(): { category: Category; intensity: number }[][] {
  const seed: Category[][] = [
    // 7 days × 6 blocks
    ['recovery','mission','mission','reactive','relationships','noise'],
    ['recovery','mission','mission','mission','reactive','noise'],
    ['recovery','mission','reactive','reactive','health','recovery'],
    ['recovery','mission','mission','reactive','relationships','noise'],
    ['recovery','mission','reactive','noise','noise','recovery'],
    ['health','health','relationships','relationships','noise','recovery'],
    ['recovery','health','relationships','mission','noise','recovery'],
  ]
  const intensities = [
    [0.4, 0.9, 0.85, 0.5, 0.7, 0.3],
    [0.5, 0.95, 0.9, 0.8, 0.4, 0.2],
    [0.4, 0.8, 0.5, 0.6, 0.9, 0.5],
    [0.4, 0.85, 0.9, 0.55, 0.75, 0.25],
    [0.3, 0.7, 0.4, 0.6, 0.5, 0.4],
    [0.5, 0.8, 0.85, 0.8, 0.3, 0.6],
    [0.6, 0.75, 0.9, 0.6, 0.4, 0.7],
  ]
  return seed.map((row, d) =>
    row.map((category, b) => ({ category, intensity: intensities[d][b] }))
  )
}

const DATA = generateData()

// Compute per-category summary
function computeSummary() {
  const totals: Record<Category, number> = {
    mission: 0, reactive: 0, relationships: 0, health: 0, noise: 0, recovery: 0,
  }
  let total = 0
  DATA.forEach(row => row.forEach(cell => {
    totals[cell.category] += cell.intensity
    total += cell.intensity
  }))
  return Object.entries(totals).map(([k, v]) => ({
    category: k as Category,
    pct: Math.round((v / total) * 100),
  })).sort((a, b) => b.pct - a.pct)
}

const SUMMARY = computeSummary()

export function PurposeAlignmentHeatmap() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 280

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

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('PURPOSE ALIGNMENT HEATMAP', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = width < 340 ? 34 : 44   // left margin for block labels
    const mt = 28   // top margin
    const mr = 12
    const legendH = 52
    const gridH = height - mt - legendH - 8
    const gridW = width - ml - mr

    const cellW = gridW / 7
    const cellH = gridH / 6

    // Day headers
    DAYS.forEach((d, i) => {
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(d, ml + (i + 0.5) * cellW, mt - 4)
    })

    // Block labels
    BLOCKS.forEach((b, j) => {
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(b, ml - 4, mt + (j + 0.5) * cellH + 3)
    })

    // Cells
    DATA.forEach((row, d) => {
      row.forEach((cell, b) => {
        const x = ml + d * cellW + 1
        const y = mt + b * cellH + 1
        const w = cellW - 2
        const h = cellH - 2
        const color = CATEGORY_COLORS[cell.category]
        const alpha = Math.round(cell.intensity * 255).toString(16).padStart(2, '0')

        ctx.fillStyle = `${color}${alpha}`
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 2)
        ctx.fill()

        // Thin border
        ctx.strokeStyle = `${color}30`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })
    })

    // Summary legend row
    const legY = height - legendH + 8
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`

    const topItems = SUMMARY.slice(0, 4)
    const itemW = (width - 16) / topItems.length

    topItems.forEach((item, i) => {
      const x = 8 + i * itemW
      const color = CATEGORY_COLORS[item.category]

      // Dot
      ctx.beginPath()
      ctx.arc(x + 6, legY + 5, 4, 0, Math.PI * 2)
      ctx.fillStyle = `${color}cc`
      ctx.fill()

      // Label
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'left'
      ctx.fillText(CATEGORY_LABELS[item.category], x + 14, legY + 8)

      // Pct
      ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.fillText(`${item.pct}%`, x + 14, legY + 20)
      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    })

    // Mission % callout
    const missionItem = SUMMARY.find(s => s.category === 'mission')
    if (missionItem) {
      const mPct = missionItem.pct
      const label = width < 360
        ? (mPct >= 40 ? 'HIGH PURPOSE' : mPct >= 25 ? 'MODERATE' : 'LOW PURPOSE')
        : (mPct >= 40 ? 'HIGH PURPOSE DENSITY' : mPct >= 25 ? 'MODERATE PURPOSE' : 'LOW PURPOSE DENSITY')
      const col = mPct >= 40 ? CHART_COLORS.aligned : mPct >= 25 ? CHART_COLORS.drifting : CHART_COLORS.avoiding
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = col
      ctx.textAlign = 'right'
      ctx.fillText(label, width - mr, height - 4)
    }
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}