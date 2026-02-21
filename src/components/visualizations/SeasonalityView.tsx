import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  data?: number[][] // 12 months × 4 weeks
}

function generateDefaults(): number[][] {
  return Array.from({ length: 12 }, (_, m) =>
    Array.from({ length: 4 }, () =>
      50 + Math.sin(m / 2) * 15 + (Math.random() - 0.5) * 20
    )
  )
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function SeasonalityView({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const values = useMemo(() => data ?? generateDefaults(), [data])
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
    ctx.fillText('SEASONALITY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 20, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const cols = 12
    const rows = 4
    const cellW = chartW / cols
    const cellH = chartH / rows
    const gap = 2

    // Month labels
    MONTHS.forEach((m, i) => {
      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(m, ml + i * cellW + cellW / 2, mt + chartH + 12)
    })

    // Week labels
    for (let w = 0; w < rows; w++) {
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`W${w + 1}`, ml - 4, mt + w * cellH + cellH / 2 + 2)
    }

    // Heatmap cells
    values.forEach((month, m) => {
      month.forEach((val, w) => {
        const x = ml + m * cellW + gap / 2
        const y = mt + w * cellH + gap / 2
        const cw = cellW - gap
        const ch = cellH - gap

        // Color based on value
        let color: string
        if (val >= 70) color = '#22c55e'
        else if (val >= 50) color = '#3b82f6'
        else if (val >= 30) color = '#eab308'
        else color = '#ef4444'

        const alpha = Math.round((val / 100) * 50 + 5)
        const hex = alpha.toString(16).padStart(2, '0')

        ctx.beginPath()
        ctx.roundRect(x, y, cw, ch, 2)
        ctx.fillStyle = `${color}${hex}`
        ctx.fill()
      })
    })

    // Seasonal pattern annotation
    const allVals = values.flat()
    const peakMonth = values.reduce((best, month, i) => {
      const avg = month.reduce((s, v) => s + v, 0) / month.length
      return avg > best.avg ? { i, avg } : best
    }, { i: 0, avg: 0 })

    ctx.font = `400 5px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'right'
    ctx.fillText(`PEAK: ${MONTHS[peakMonth.i]}`, width - 12, mt + 8)

  }, [width, values])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
