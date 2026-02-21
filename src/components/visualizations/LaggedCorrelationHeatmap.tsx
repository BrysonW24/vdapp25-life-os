import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface LagPair {
  label: string
  correlations: number[] // correlation at lag 0,1,2...7 days
  peakLag: number
}

interface Props {
  pairs?: LagPair[]
}

const DEFAULT_PAIRS: LagPair[] = [
  { label: 'Sleep → Mood', correlations: [0.3, 0.5, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1], peakLag: 2 },
  { label: 'Exercise → Focus', correlations: [0.2, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.1], peakLag: 1 },
  { label: 'Stress → Sleep', correlations: [0.1, 0.3, 0.2, 0.5, 0.6, 0.4, 0.3, 0.2], peakLag: 4 },
  { label: 'Social → Mood', correlations: [0.4, 0.5, 0.3, 0.2, 0.1, 0.1, 0.0, 0.0], peakLag: 1 },
  { label: 'Nutrition → Energy', correlations: [0.6, 0.7, 0.5, 0.3, 0.2, 0.1, 0.1, 0.0], peakLag: 1 },
  { label: 'Work → Stress', correlations: [0.5, 0.4, 0.6, 0.7, 0.5, 0.3, 0.2, 0.1], peakLag: 3 },
]

export function LaggedCorrelationHeatmap({ pairs = DEFAULT_PAIRS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 220

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
    ctx.fillText('LAGGED CORRELATIONS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 90, mt = 36, mr = 12, mb = 8
    const cols = 8
    const rows = pairs.length
    const cellW = (width - ml - mr) / cols
    const cellH = (height - mt - mb) / rows

    // Column headers (lag days)
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    for (let c = 0; c < cols; c++) {
      ctx.fillText(`${c}d`, ml + c * cellW + cellW / 2, mt - 6)
    }

    // Rows
    pairs.forEach((pair, r) => {
      const y = mt + r * cellH

      // Label
      ctx.font = `500 7px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'right'
      ctx.fillText(pair.label, ml - 6, y + cellH / 2 + 2)

      // Cells
      pair.correlations.forEach((corr, c) => {
        const x = ml + c * cellW
        const isPeak = c === pair.peakLag
        const intensity = Math.abs(corr)

        ctx.fillStyle = `rgba(124, 58, 237, ${intensity * 0.6})`
        ctx.beginPath()
        ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 2)
        ctx.fill()

        if (isPeak) {
          ctx.strokeStyle = '#7c3aed'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 2)
          ctx.stroke()
        }

        if (intensity > 0.2) {
          ctx.font = `500 6px 'JetBrains Mono', monospace`
          ctx.fillStyle = isPeak ? '#e8e8f0' : '#808090'
          ctx.textAlign = 'center'
          ctx.fillText(corr.toFixed(1), x + cellW / 2, y + cellH / 2 + 2)
        }
      })
    })

  }, [width, pairs])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>bordered = peak lag</span>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>0-7 day time lags</span>
      </div>
    </div>
  )
}
