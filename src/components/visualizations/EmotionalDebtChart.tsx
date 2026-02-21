import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  debtScores?: number[]
  factors?: { canceledPlans: number[]; reducedOutput: number[]; sleepDisruption: number[]; irritability: number[] }
}

function generateDefaults() {
  const n = 30
  const debtScores = Array.from({ length: n }, (_, i) => 30 + Math.sin(i / 4) * 25 + Math.random() * 10)
  const canceledPlans = Array.from({ length: n }, () => Math.random() * 20)
  const reducedOutput = Array.from({ length: n }, () => Math.random() * 15)
  const sleepDisruption = Array.from({ length: n }, () => Math.random() * 18)
  const irritability = Array.from({ length: n }, () => Math.random() * 12)
  return { debtScores, factors: { canceledPlans, reducedOutput, sleepDisruption, irritability } }
}

export function EmotionalDebtChart({ debtScores, factors }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const defaults = useMemo(() => generateDefaults(), [])
  const scores = debtScores ?? defaults.debtScores
  const facs = factors ?? defaults.factors
  const height = 200

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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('EMOTIONAL DEBT', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 24, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = scores.length

    // Threshold
    const thresholdY = mt + chartH * (1 - 70 / 100)
    ctx.fillStyle = '#ef444408'
    ctx.fillRect(ml, mt, chartW, thresholdY - mt)
    ctx.strokeStyle = '#ef444430'
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(ml, thresholdY)
    ctx.lineTo(ml + chartW, thresholdY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#ef444460'
    ctx.textAlign = 'left'
    ctx.fillText('WARNING ZONE', ml + 4, thresholdY - 4)

    // Stacked area for factors
    const factorSeries = [
      { data: facs.canceledPlans, color: '#ef4444' },
      { data: facs.reducedOutput, color: '#eab308' },
      { data: facs.sleepDisruption, color: '#8b5cf6' },
      { data: facs.irritability, color: '#FF6B35' },
    ]

    // Draw stacked areas
    for (let fi = factorSeries.length - 1; fi >= 0; fi--) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const x = ml + (i / (n - 1)) * chartW
        let stack = 0
        for (let j = 0; j <= fi; j++) stack += factorSeries[j].data[i]
        const y = mt + chartH - (stack / 100) * chartH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineTo(ml + chartW, mt + chartH)
      ctx.lineTo(ml, mt + chartH)
      ctx.closePath()
      ctx.fillStyle = `${factorSeries[fi].color}15`
      ctx.fill()
    }

    // Main debt line
    ctx.beginPath()
    scores.forEach((v, i) => {
      const x = ml + (i / (n - 1)) * chartW
      const y = mt + chartH - (v / 100) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Current value
    const current = scores[scores.length - 1]
    const currentColor = current >= 70 ? '#ef4444' : current >= 50 ? '#eab308' : '#22c55e'
    ctx.font = `700 12px 'Inter', sans-serif`
    ctx.fillStyle = currentColor
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(current)}%`, width - 12, mt + 12)

    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('current debt', width - 12, mt + 22)

  }, [width, scores, facs])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        {[
          { label: 'Canceled plans', color: '#ef4444' },
          { label: 'Reduced output', color: '#eab308' },
          { label: 'Sleep disruption', color: '#8b5cf6' },
          { label: 'Irritability', color: '#FF6B35' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
            <span className="text-[6px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
