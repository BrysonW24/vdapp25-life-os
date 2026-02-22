import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Long Horizon Projection — 5-Year Domain Simulation
 * Simulates two futures per domain: current trajectory vs deliberate +10%/mo.
 * Shows the divergence gap — the cost of inaction made visible.
 * Domains: Income, Skill, Health, Network, Impact
 */

interface Domain {
  label: string
  color: string
  baseValue: number    // current score 0-100
  currentGrowthPct: number  // % monthly growth/decline on current path
  intentionalGrowthPct: number // % monthly with deliberate effort
}

const DOMAINS: Domain[] = [
  { label: 'Income',   color: '#eab308', baseValue: 55, currentGrowthPct: 1.2, intentionalGrowthPct: 3.5 },
  { label: 'Skill',    color: '#3b82f6', baseValue: 62, currentGrowthPct: 0.8, intentionalGrowthPct: 2.8 },
  { label: 'Health',   color: '#22c55e', baseValue: 70, currentGrowthPct: -0.3, intentionalGrowthPct: 1.5 },
  { label: 'Network',  color: '#8b5cf6', baseValue: 45, currentGrowthPct: 0.5, intentionalGrowthPct: 2.2 },
  { label: 'Impact',   color: '#FF6B35', baseValue: 38, currentGrowthPct: 1.5, intentionalGrowthPct: 4.2 },
]

const MONTHS = 60  // 5 years

function project(base: number, growthPct: number, months: number): number[] {
  const points = [base]
  for (let m = 1; m <= months; m++) {
    const prev = points[m - 1]
    const next = Math.min(100, Math.max(0, prev * (1 + growthPct / 100)))
    points.push(next)
  }
  return points
}

export function LongHorizonProjection() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 320

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

    const ml = 32, mr = 12, mt = 26, mb = 52
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('5-YEAR DOMAIN PROJECTION', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Grid
    const gridValues = [0, 25, 50, 75, 100]
    gridValues.forEach(v => {
      const y = mt + chartH - (v / 100) * chartH
      ctx.beginPath()
      ctx.moveTo(ml, y)
      ctx.lineTo(ml + chartW, y)
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`${v}`, ml - 4, y + 3)
    })

    // Year markers
    const yearMarkers = [0, 12, 24, 36, 48, 60]
    yearMarkers.forEach(m => {
      const x = ml + (m / MONTHS) * chartW
      ctx.beginPath()
      ctx.moveTo(x, mt + chartH)
      ctx.lineTo(x, mt + chartH + 6)
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.stroke()
      const label = m === 0 ? 'NOW' : `Y${m / 12}`
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(label, x, mt + chartH + 14)
    })

    const toX = (m: number) => ml + (m / MONTHS) * chartW
    const toY = (v: number) => mt + chartH - (v / 100) * chartH

    // Draw each domain
    DOMAINS.forEach(domain => {
      const current = project(domain.baseValue, domain.currentGrowthPct, MONTHS)
      const intentional = project(domain.baseValue, domain.intentionalGrowthPct, MONTHS)

      // Divergence fill between curves
      ctx.beginPath()
      current.forEach((v, m) => {
        const x = toX(m)
        const y = toY(v)
        if (m === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      intentional.slice().reverse().forEach((v, ri) => {
        const m = MONTHS - ri
        ctx.lineTo(toX(m), toY(v))
      })
      ctx.closePath()
      ctx.fillStyle = `${domain.color}12`
      ctx.fill()

      // Current path (dashed, dim)
      ctx.beginPath()
      current.forEach((v, m) => {
        const x = toX(m)
        const y = toY(v)
        if (m === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = `${domain.color}40`
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Intentional path (solid, bright)
      ctx.beginPath()
      intentional.forEach((v, m) => {
        const x = toX(m)
        const y = toY(v)
        if (m === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = `${domain.color}cc`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // End point labels
      const endCurrent = current[MONTHS]
      const endIntentional = intentional[MONTHS]
      const gap = Math.round(endIntentional - endCurrent)

      ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = `${domain.color}cc`
      ctx.textAlign = 'left'
      ctx.fillText(`+${gap}`, toX(MONTHS) + 4, toY(endIntentional) + 3)
    })

    // Current position marker (vertical line at month 0)
    ctx.beginPath()
    ctx.moveTo(ml, mt)
    ctx.lineTo(ml, mt + chartH)
    ctx.strokeStyle = '#ffffff18'
    ctx.lineWidth = 1
    ctx.stroke()

    // Legend — proportional, 5 domain items
    const legY = height - 32
    const legItemW = Math.floor((width - ml - mr) / DOMAINS.length)
    DOMAINS.forEach((d, i) => {
      const x = ml + i * legItemW
      // Solid line sample
      ctx.strokeStyle = `${d.color}cc`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, legY + 4)
      ctx.lineTo(x + 10, legY + 4)
      ctx.stroke()
      // Dashed line sample
      ctx.setLineDash([3, 3])
      ctx.strokeStyle = `${d.color}40`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, legY + 9)
      ctx.lineTo(x + 10, legY + 9)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = d.color
      ctx.textAlign = 'left'
      ctx.fillText(d.label, x + 13, legY + 6)
    })

    // Legend key — abbreviated on narrow
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText(
      width < 380 ? 'solid = deliberate · dashed = current' : 'solid = deliberate · dashed = current path · gap = cost of inaction',
      ml + (width - ml - mr) / 2,
      height - 4
    )
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
