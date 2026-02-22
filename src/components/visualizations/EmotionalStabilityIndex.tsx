import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Emotional Stability Index — Volatility Line Chart
 * Shows stress variance, impulse events, sleep stability, reaction intensity
 * over 30 days. High oscillation = unstable internal state.
 * Includes rolling volatility band and stability score.
 */

interface SignalPoint {
  day: number
  stress: number       // 0-100
  impulse: number      // 0-100 (spike = impulse event)
  sleep: number        // 0-100
  reaction: number     // 0-100
}

function generateData(): SignalPoint[] {
  // 30 days of data with realistic variance patterns
  const base = [
    60, 55, 70, 65, 75, 80, 72, 68, 55, 50,
    62, 78, 85, 70, 65, 60, 55, 72, 68, 62,
    58, 65, 70, 75, 60, 55, 62, 68, 65, 60,
  ]
  const impulseSpikes = [0,0,0,0,0,0,0,80,0,0,0,0,90,0,0,0,0,0,75,0,0,0,0,0,0,0,0,0,85,0]
  const sleepQ = [70,65,80,72,75,78,60,55,70,68,72,65,60,78,80,75,68,70,65,72,78,72,65,68,75,80,70,65,68,72]

  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    stress: Math.min(100, base[i] + (Math.random() - 0.5) * 10),
    impulse: impulseSpikes[i],
    sleep: sleepQ[i] + (Math.random() - 0.5) * 8,
    reaction: Math.min(100, base[i] * 0.8 + (Math.random() - 0.5) * 15),
  }))
}

function rollingVolatility(values: number[], window = 7): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length
    return Math.sqrt(variance)
  })
}

export function EmotionalStabilityIndex() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 240

  const data = useMemo(() => generateData(), [])

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

    const ml = 16, mr = 16, mt = 26, mb = 36
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('EMOTIONAL STABILITY INDEX', width / 2, 14)
    ctx.letterSpacing = '0px'

    const n = data.length
    const stressVals = data.map(d => d.stress)
    const sleepVals = data.map(d => d.sleep)
    const volatility = rollingVolatility(stressVals)

    const toX = (i: number) => ml + (i / (n - 1)) * chartW
    const toY = (v: number) => mt + chartH - (v / 100) * chartH

    // Grid lines
    const gridValues = [25, 50, 75]
    gridValues.forEach(v => {
      ctx.beginPath()
      ctx.moveTo(ml, toY(v))
      ctx.lineTo(ml + chartW, toY(v))
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Volatility band (upper/lower ± rolling std)
    ctx.beginPath()
    volatility.forEach((v, i) => {
      const stress = stressVals[i]
      const x = toX(i)
      const upper = toY(Math.min(100, stress + v))
      if (i === 0) ctx.moveTo(x, upper)
      else ctx.lineTo(x, upper)
    })
    volatility.slice().reverse().forEach((v, i) => {
      const ri = n - 1 - i
      const stress = stressVals[ri]
      const x = toX(ri)
      const lower = toY(Math.max(0, stress - v))
      ctx.lineTo(x, lower)
    })
    ctx.closePath()
    ctx.fillStyle = 'rgba(239,68,68,0.06)'
    ctx.fill()

    // Sleep line (cool blue, secondary)
    ctx.beginPath()
    sleepVals.forEach((v, i) => {
      const x = toX(i)
      const y = toY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#3b82f630'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Stress line (main)
    ctx.beginPath()
    stressVals.forEach((v, i) => {
      const x = toX(i)
      const y = toY(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#ef4444aa'
    ctx.lineWidth = 2
    ctx.stroke()

    // Impulse spikes
    data.forEach((d, i) => {
      if (d.impulse > 0) {
        const x = toX(i)
        const y = toY(d.impulse)

        // Spike line from bottom to spike
        ctx.beginPath()
        ctx.moveTo(x, toY(0))
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#ef444460'
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        ctx.stroke()
        ctx.setLineDash([])

        // Diamond at spike
        const s = 5
        ctx.beginPath()
        ctx.moveTo(x, y - s)
        ctx.lineTo(x + s, y)
        ctx.lineTo(x, y + s)
        ctx.lineTo(x - s, y)
        ctx.closePath()
        ctx.fillStyle = '#ef4444'
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })

    // Stability score
    const avgVolatility = volatility.reduce((a, b) => a + b, 0) / volatility.length
    const stabilityScore = Math.max(0, Math.round(100 - avgVolatility * 2.5))
    const scoreColor = stabilityScore >= 65 ? CHART_COLORS.aligned
      : stabilityScore >= 40 ? CHART_COLORS.drifting
      : CHART_COLORS.avoiding

    ctx.font = `700 ${chartFontSize(22, width)}px 'Inter', sans-serif`
    ctx.fillStyle = scoreColor
    ctx.textAlign = 'right'
    ctx.fillText(`${stabilityScore}`, width - mr, mt + 32)

    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('STABILITY SCORE', width - mr, mt + 44)

    // Bottom axis labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DAY 1', ml, height - 4)
    ctx.textAlign = 'center'
    ctx.fillText('DAY 15', ml + chartW / 2, height - 4)
    ctx.textAlign = 'right'
    ctx.fillText('DAY 30', ml + chartW, height - 4)

    // Legend — proportional positioning across 3 items
    const legItems = [
      { label: width < 360 ? 'Stress' : 'Stress', color: '#ef4444', diamond: false },
      { label: width < 360 ? 'Sleep' : 'Sleep quality', color: '#3b82f6', diamond: false },
      { label: width < 360 ? 'Impulse' : 'Impulse event', color: '#ef4444', diamond: true },
    ]
    const legY = height - 22
    const legItemW = Math.floor((width - ml - mr) / legItems.length)
    legItems.forEach((item, idx) => {
      const lx = ml + idx * legItemW
      if (item.diamond) {
        const ds = 4
        ctx.beginPath()
        ctx.moveTo(lx + ds, legY - ds)
        ctx.lineTo(lx + ds * 2, legY)
        ctx.lineTo(lx + ds, legY + ds)
        ctx.lineTo(lx, legY)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()
      } else {
        ctx.fillStyle = item.color
        ctx.fillRect(lx, legY - 3, 12, 3)
      }
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'left'
      ctx.fillText(item.label, lx + (item.diamond ? 14 : 16), legY + 2)
    })
  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}