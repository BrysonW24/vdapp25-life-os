import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Impact Time Allocation
 * Stacked bar per month (12 months).
 * Categories: Volunteer, Mentorship, Pro Bono, Content.
 * Diverging view: impact hours vs wealth hours per month.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Category {
  label: string
  color: string
  hours: number[]   // hrs/month for each of 12 months
}

const IMPACT_CATS: Category[] = [
  { label: 'Volunteer',  color: '#22c55e', hours: [4,4,6,6,6,8,6,6,8,6,6,8] },
  { label: 'Mentorship', color: '#3b82f6', hours: [4,4,4,4,6,4,4,4,6,4,4,6] },
  { label: 'Pro Bono',   color: '#8b5cf6', hours: [2,2,2,4,2,2,4,2,2,4,2,4] },
  { label: 'Content',    color: '#FF6B35', hours: [4,4,4,4,4,4,6,4,4,6,4,6] },
]

const WEALTH_HOURS = [60,58,62,60,58,55,60,62,58,60,58,55]  // hrs/month on wealth creation

export function ImpactTimeAllocation() {
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

    const ml = width < 320 ? 28 : 38, mr = 12, mt = 26, mb = 48
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('IMPACT TIME ALLOCATION', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Compute totals
    const impactTotals = MONTHS.map((_, mi) =>
      IMPACT_CATS.reduce((s, cat) => s + cat.hours[mi], 0)
    )
    const maxVal = Math.max(...WEALTH_HOURS, ...impactTotals)

    const barW = (chartW / MONTHS.length) - 2
    const toX = (i: number) => ml + i * (chartW / MONTHS.length) + 1
    const toY = (v: number) => mt + chartH - (v / maxVal) * chartH

    // Y-axis grid
    const yTicks = [0, 20, 40, 60, 80]
    yTicks.forEach(v => {
      if (v > maxVal * 1.05) return
      const y = toY(v)
      ctx.beginPath()
      ctx.moveTo(ml - 4, y)
      ctx.lineTo(ml + chartW, y)
      ctx.strokeStyle = v === 0 ? CHART_COLORS.border : CHART_COLORS.gridLine
      ctx.lineWidth = v === 0 ? 1 : 0.5
      ctx.setLineDash(v === 0 ? [] : [3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`${v}h`, ml - 6, y + 3)
    })

    // Wealth hours bars (grey, behind)
    MONTHS.forEach((_, mi) => {
      const x = toX(mi)
      const wH = (WEALTH_HOURS[mi] / maxVal) * chartH
      ctx.fillStyle = `${CHART_COLORS.textDim}20`
      ctx.fillRect(x, mt + chartH - wH, barW, wH)
    })

    // Stacked impact bars
    MONTHS.forEach((_, mi) => {
      const x = toX(mi)
      let stackY = mt + chartH

      IMPACT_CATS.forEach(cat => {
        const h = (cat.hours[mi] / maxVal) * chartH
        ctx.fillStyle = `${cat.color}99`
        ctx.fillRect(x, stackY - h, barW, h)
        stackY -= h
      })

      // Month label
      if (width >= 320 || mi % 2 === 0) {
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textDim
        ctx.textAlign = 'center'
        ctx.fillText(width < 340 ? MONTHS[mi].slice(0, 1) : MONTHS[mi].slice(0, 3), x + barW / 2, mt + chartH + 10)
      }
    })

    // Legend — 2 rows on narrow
    const legY = height - 24
    const legCols = width < 360 ? 2 : IMPACT_CATS.length + 1
    const legItemW = Math.floor((width - ml - mr) / legCols)

    // Impact categories
    IMPACT_CATS.forEach((cat, i) => {
      const col = i % legCols
      const row = Math.floor(i / legCols)
      const x = ml + col * legItemW
      const y = legY + row * 12
      ctx.fillStyle = `${cat.color}99`
      ctx.fillRect(x, y - 6, 8, 6)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(cat.label, x + 11, y)
    })

    // Wealth hours legend item
    const wCol = IMPACT_CATS.length % legCols
    const wRow = Math.floor(IMPACT_CATS.length / legCols)
    const wx = ml + wCol * legItemW
    const wy = legY + wRow * 12
    ctx.fillStyle = `${CHART_COLORS.textDim}20`
    ctx.fillRect(wx, wy - 6, 8, 6)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('Wealth hrs', wx + 11, wy)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
