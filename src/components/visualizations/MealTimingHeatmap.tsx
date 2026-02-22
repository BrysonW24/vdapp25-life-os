import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  data?: number[][] // 30 days × 18 hours (6am-midnight)
}

function generateDefaultData(): number[][] {
  return Array.from({ length: 30 }, () =>
    Array.from({ length: 18 }, (_, h) => {
      if (h < 1 || h > 16) return 0
      if (h >= 1 && h <= 2) return Math.random() * 400 + 200 // breakfast
      if (h >= 6 && h <= 7) return Math.random() * 500 + 300 // lunch
      if (h >= 12 && h <= 13) return Math.random() * 600 + 300 // dinner
      if (h >= 15 && Math.random() > 0.6) return Math.random() * 300 // late snack
      return Math.random() * 50
    })
  )
}

export function MealTimingHeatmap({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridData = useMemo(() => data ?? generateDefaultData(), [data])
  const height = 240

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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('MEAL TIMING', width / 2, 14)
    ctx.letterSpacing = '0px'

    const marginLeft = 28
    const marginTop = 28
    const marginRight = 8
    const marginBottom = 20
    const cols = 18
    const rows = gridData.length
    const cellW = (width - marginLeft - marginRight) / cols
    const cellH = (height - marginTop - marginBottom) / rows
    const maxVal = Math.max(...gridData.flat())

    // Hour labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    for (let h = 0; h < cols; h += 3) {
      const hour = h + 6
      ctx.fillText(`${hour}`, marginLeft + h * cellW + cellW / 2, marginTop - 4)
    }

    // Day labels
    ctx.textAlign = 'right'
    for (let d = 0; d < rows; d += 7) {
      ctx.fillText(`${rows - d}d`, marginLeft - 4, marginTop + d * cellH + cellH / 2 + 2)
    }

    // Cells
    gridData.forEach((row, d) => {
      row.forEach((val, h) => {
        const x = marginLeft + h * cellW
        const y = marginTop + d * cellH
        const intensity = val / maxVal

        if (intensity > 0.02) {
          const r = Math.round(255 * intensity)
          const g = Math.round(107 * intensity)
          const b = Math.round(53 * intensity)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.7})`
        } else {
          ctx.fillStyle = '#1a1a30'
        }
        ctx.beginPath()
        ctx.roundRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1, 1)
        ctx.fill()
      })
    })

  }, [width, gridData])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>30 days · 6am–midnight</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ background: '#1a1a30' }} />
          <span className="text-[6px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>none</span>
          <div className="w-2 h-2 rounded-sm" style={{ background: '#FF6B35' }} />
          <span className="text-[6px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>high</span>
        </div>
      </div>
    </div>
  )
}
