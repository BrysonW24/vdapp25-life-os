import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  data?: number[][] // 12 weeks × 7 days
}

function generateDefaults(): number[][] {
  return Array.from({ length: 12 }, () =>
    Array.from({ length: 7 }, () => Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0)
  )
}

export function ConnectionCadence({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grid = useMemo(() => data ?? generateDefaults(), [data])
  const height = 180

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
    ctx.fillText('CONNECTION CADENCE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mt = 28, mr = 12, mb = 8
    const cols = 7
    const rows = grid.length
    const cellW = (width - ml - mr) / cols
    const cellH = (height - mt - mb) / rows

    // Day headers
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    days.forEach((d, i) => {
      ctx.fillText(d, ml + i * cellW + cellW / 2, mt - 4)
    })

    // Week labels
    ctx.textAlign = 'right'
    for (let w = 0; w < rows; w += 3) {
      ctx.fillText(`W${w + 1}`, ml - 4, mt + w * cellH + cellH / 2 + 2)
    }

    // Cells
    let consecutiveLow = 0
    grid.forEach((week, w) => {
      const weekTotal = week.reduce((s, v) => s + v, 0)
      if (weekTotal <= 1) consecutiveLow++
      else consecutiveLow = 0

      week.forEach((val, d) => {
        const x = ml + d * cellW
        const y = mt + w * cellH

        if (val === 0) {
          ctx.fillStyle = '#1a1a30'
        } else {
          const intensity = Math.min(val / 4, 1)
          const r = Math.round(139 * intensity)
          const g = Math.round(92 * intensity)
          const b = Math.round(246 * intensity)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.6})`
        }
        ctx.beginPath()
        ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 2)
        ctx.fill()
      })

      // Social debt warning
      if (consecutiveLow >= 2) {
        ctx.strokeStyle = '#ef444430'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(ml - 2, mt + w * cellH - 1, width - ml - mr + 4, cellH + 2, 3)
        ctx.stroke()
      }
    })

  }, [width, grid])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
