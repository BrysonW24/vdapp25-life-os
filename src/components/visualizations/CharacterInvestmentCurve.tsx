import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Character Investment Curve
 * Longitudinal compounding curve of investment in the child's character.
 * Tracks: books, conversations, shared projects, outdoor time, skill teaching,
 * shared adversity, service/charity moments.
 * Cumulative curve vs what the data would look like "by accident" (passive parenting).
 */

type Investment = {
  label: string
  color: string
  weeklyTarget: number  // sessions/week
  currentAvg: number    // actual sessions/week
}

const INVESTMENTS: Investment[] = [
  { label: 'Reading together',   color: '#3b82f6', weeklyTarget: 7, currentAvg: 5 },
  { label: 'Deep conversations', color: '#8b5cf6', weeklyTarget: 5, currentAvg: 3 },
  { label: 'Shared projects',    color: '#FF6B35', weeklyTarget: 2, currentAvg: 1 },
  { label: 'Outdoor time',       color: '#22c55e', weeklyTarget: 5, currentAvg: 4 },
  { label: 'Skill teaching',     color: '#eab308', weeklyTarget: 3, currentAvg: 2 },
  { label: 'Shared adversity',   color: '#ec4899', weeklyTarget: 1, currentAvg: 0.5 },
]

// Simulate cumulative "character capital" over 18 years
// Deliberate parenting compounds faster; passive plateaus
function buildCurve(weeklyEffort: number, passive = false): number[] {
  const weeks = 18 * 52
  const curve: number[] = [0]
  for (let w = 1; w <= weeks; w++) {
    const prev = curve[w - 1]
    const yearFactor = 1 + (w / weeks) * 0.8  // child's absorption grows with age
    const weeklyGain = passive
      ? weeklyEffort * 0.3 * yearFactor          // passive: low input, low compound
      : weeklyEffort * yearFactor * (1 + prev / 2000) // deliberate: compounds
    curve.push(Math.min(1000, prev + weeklyGain))
  }
  return curve.filter((_, i) => i % 52 === 0)  // yearly sample
}

const totalTarget = INVESTMENTS.reduce((s, inv) => s + inv.weeklyTarget, 0)
const totalCurrent = INVESTMENTS.reduce((s, inv) => s + inv.currentAvg, 0)

const deliberateCurve = buildCurve(totalCurrent)
const passiveCurve = buildCurve(totalCurrent * 0.3, true)

export function CharacterInvestmentCurve() {
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

    const ml = width < 320 ? 28 : 40, mr = 12, mt = 26, mb = 80
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = deliberateCurve.length

    const maxVal = Math.max(...deliberateCurve)

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('CHARACTER INVESTMENT CURVE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const toX = (i: number) => ml + (i / (n - 1)) * chartW
    const toY = (v: number) => mt + chartH - (v / maxVal) * chartH

    // Grid
    const gridValues = [0, 250, 500, 750, 1000]
    gridValues.forEach(v => {
      if (v > maxVal * 1.05) return
      const y = toY(v)
      ctx.beginPath()
      ctx.moveTo(ml, y)
      ctx.lineTo(ml + chartW, y)
      ctx.strokeStyle = v === 0 ? CHART_COLORS.border : CHART_COLORS.gridLine
      ctx.lineWidth = v === 0 ? 1 : 0.5
      ctx.setLineDash(v === 0 ? [] : [3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`${v}`, ml - 4, y + 3)
    })

    // Divergence fill
    ctx.beginPath()
    deliberateCurve.forEach((v, i) => {
      const x = toX(i), y = toY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    passiveCurve.slice().reverse().forEach((v, ri) => {
      const i = n - 1 - ri
      ctx.lineTo(toX(i), toY(v))
    })
    ctx.closePath()
    ctx.fillStyle = 'rgba(255,107,53,0.08)'
    ctx.fill()

    // Passive curve (dashed, dim)
    ctx.beginPath()
    passiveCurve.forEach((v, i) => {
      const x = toX(i), y = toY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = `${CHART_COLORS.textDim}60`
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Deliberate curve (solid, glowing)
    ctx.beginPath()
    deliberateCurve.forEach((v, i) => {
      const x = toX(i), y = toY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.shadowColor = CHART_COLORS.accent
    ctx.shadowBlur = 8
    ctx.strokeStyle = CHART_COLORS.accent
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.shadowBlur = 0

    // Age markers
    const ageLabels = [[0,'Birth'],[5,'5yr'],[10,'10yr'],[13,'Teen'],[18,'18yr']]
    ageLabels.forEach(([yr, label]) => {
      const i = yr as number
      if (i >= n) return
      const x = toX(i)
      ctx.beginPath()
      ctx.moveTo(x, mt + chartH)
      ctx.lineTo(x, mt + chartH + 6)
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(label as string, x, mt + chartH + 14)
    })

    // Y-axis label
    ctx.save()
    ctx.translate(10, mt + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('CHARACTER CAPITAL', 0, 0)
    ctx.restore()

    // Investment tracker rows at bottom
    const trackerY = height - 68
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('WEEKLY INVESTMENT TRACKER', ml, trackerY)

    const itemW = (width - ml - mr) / INVESTMENTS.length
    INVESTMENTS.forEach((inv, i) => {
      const x = ml + i * itemW
      const pct = inv.currentAvg / inv.weeklyTarget
      const color = pct >= 0.9 ? CHART_COLORS.aligned : pct >= 0.6 ? CHART_COLORS.drifting : CHART_COLORS.avoiding

      // Mini arc
      const arcR = 10
      const arcX = x + itemW / 2
      const arcY = trackerY + 20

      ctx.beginPath()
      ctx.arc(arcX, arcY, arcR, Math.PI, Math.PI + Math.PI * pct)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(arcX, arcY, arcR, Math.PI, 2 * Math.PI)
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = `400 ${chartFontSize(5.5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      const shortLabel = inv.label.split(' ').slice(0, 1).join('')
      ctx.fillText(shortLabel, arcX, arcY + 4)
      ctx.fillText(`${inv.currentAvg}/${inv.weeklyTarget}`, arcX, arcY + 14)
    })

    // Legends — proportional split
    const legY = height - 10
    const legMidX = ml + Math.floor((width - ml - mr) / 2)
    ctx.strokeStyle = CHART_COLORS.accent
    ctx.lineWidth = 2
    ctx.shadowColor = CHART_COLORS.accent
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(ml, legY - 3)
    ctx.lineTo(ml + 16, legY - 3)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText(width < 360 ? 'Deliberate' : 'Deliberate parenting', ml + 20, legY)

    ctx.strokeStyle = `${CHART_COLORS.textDim}60`
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(legMidX, legY - 3)
    ctx.lineTo(legMidX + 16, legY - 3)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillText(width < 360 ? 'Passive' : 'Passive parenting', legMidX + 20, legY)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
