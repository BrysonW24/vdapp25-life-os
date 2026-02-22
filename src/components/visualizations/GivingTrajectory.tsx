import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Giving Trajectory
 * Dual-axis canvas chart over 20 years.
 * Left axis: net worth growth. Right axis: annual giving.
 * Shaded region = cumulative lifetime giving.
 * Two giving scenarios: 2% vs 10% of income.
 */

const YEARS = 20
const CURRENT_INCOME = 180000  // AUD/yr
const INCOME_GROWTH = 0.08     // 8% per year
const INITIAL_WEALTH = 350000
const WEALTH_GROWTH = 0.09

function buildSeries(givingPct: number) {
  const wealth: number[] = [INITIAL_WEALTH]
  const giving: number[] = [0]
  for (let y = 1; y <= YEARS; y++) {
    const income = CURRENT_INCOME * (1 + INCOME_GROWTH) ** y
    giving.push(income * givingPct)
    wealth.push(INITIAL_WEALTH * (1 + WEALTH_GROWTH) ** y - giving.reduce((a, b) => a + b, 0) * 0.3)
  }
  return { wealth, giving }
}

const series2 = buildSeries(0.02)
const series10 = buildSeries(0.10)

export function GivingTrajectory() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 300

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

    const ml = width < 320 ? 36 : 48, mr = width < 320 ? 30 : 42, mt = 26, mb = 42
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('GIVING TRAJECTORY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const maxWealth = Math.max(...series2.wealth, ...series10.wealth)
    const maxGiving = Math.max(...series10.giving)

    const toX = (y: number) => ml + (y / YEARS) * chartW
    const toYW = (v: number) => mt + chartH - (v / maxWealth) * chartH
    const toYG = (v: number) => mt + chartH - (v / maxGiving) * chartH

    // Grid
    const gridValues = [0, 500000, 1000000, 1500000]
    gridValues.forEach(v => {
      if (v > maxWealth * 1.05) return
      const y = toYW(v)
      ctx.beginPath()
      ctx.moveTo(ml, y)
      ctx.lineTo(ml + chartW, y)
      ctx.strokeStyle = v === 0 ? CHART_COLORS.border : CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.setLineDash(v === 0 ? [] : [3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`$${(v / 1000).toFixed(0)}k`, ml - 4, y + 3)
    })

    // Right axis giving labels
    const giveGridValues = [0, 20000, 40000, 60000]
    giveGridValues.forEach(v => {
      if (v > maxGiving * 1.05) return
      const y = toYG(v)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = `${CHART_COLORS.aligned}99`
      ctx.textAlign = 'left'
      ctx.fillText(`$${(v / 1000).toFixed(0)}k`, ml + chartW + 4, y + 3)
    })

    // Cumulative giving fill (10% scenario)
    ctx.beginPath()
    series10.giving.forEach((v, i) => {
      const x = toX(i)
      const y = toYG(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.lineTo(toX(YEARS), toYG(0))
    ctx.lineTo(toX(0), toYG(0))
    ctx.closePath()
    ctx.fillStyle = `${CHART_COLORS.aligned}15`
    ctx.fill()

    // Wealth curves
    const drawLine = (data: number[], toY: (v: number) => number, color: string, dash: number[]) => {
      ctx.beginPath()
      data.forEach((v, i) => {
        const x = toX(i)
        const y = toY(v)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.setLineDash(dash)
      ctx.stroke()
      ctx.setLineDash([])
    }

    drawLine(series2.wealth, toYW, `${CHART_COLORS.drifting}80`, [4, 4])
    drawLine(series10.wealth, toYW, `${CHART_COLORS.accent}cc`, [])
    drawLine(series10.giving, toYG, `${CHART_COLORS.aligned}cc`, [])
    drawLine(series2.giving, toYG, `${CHART_COLORS.aligned}40`, [4, 4])

    // X axis year labels
    const yearLabels = width < 340 ? [0, 5, 10, 15, 20] : [0, 2, 5, 10, 15, 20]
    yearLabels.forEach(y => {
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(y === 0 ? 'NOW' : `+${y}yr`, toX(y), mt + chartH + 10)
    })

    // Legend
    const legY = height - 16
    const legMid = ml + Math.floor(chartW / 2)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'

    // Item 1
    ctx.strokeStyle = `${CHART_COLORS.accent}cc`
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath(); ctx.moveTo(ml, legY - 3); ctx.lineTo(ml + 14, legY - 3); ctx.stroke()
    ctx.fillText(width < 360 ? 'Wealth 10%' : 'Wealth (10% giving)', ml + 17, legY)

    // Item 2
    ctx.strokeStyle = `${CHART_COLORS.aligned}cc`
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(legMid, legY - 3); ctx.lineTo(legMid + 14, legY - 3); ctx.stroke()
    ctx.fillText('Annual giving', legMid + 17, legY)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
