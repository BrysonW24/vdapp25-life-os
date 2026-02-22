import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  data?: number[] // 12 weekly integrity scores (0-100)
  domains?: { label: string; score: number; color: string }[]
}

function generateDefaults() {
  return Array.from({ length: 12 }, (_, i) => 50 + Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 10)
}

const DEFAULT_DOMAINS = [
  { label: 'Health', score: 72, color: '#22c55e' },
  { label: 'Work', score: 45, color: '#3b82f6' },
  { label: 'Wealth', score: 80, color: '#eab308' },
  { label: 'Family', score: 65, color: '#8b5cf6' },
  { label: 'Learning', score: 30, color: '#ef4444' },
]

export function IntegrityIndex({ data, domains = DEFAULT_DOMAINS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const values = useMemo(() => data ?? generateDefaults(), [data])
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('INTEGRITY INDEX', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Trend sparkline (top section)
    const ml = 24, mr = 12, mt = 28
    const sparkH = 50
    const chartW = width - ml - mr
    const n = values.length
    const maxV = Math.max(...values)
    const minV = Math.min(...values)

    ctx.beginPath()
    values.forEach((v, i) => {
      const x = ml + (i / (n - 1)) * chartW
      const y = mt + sparkH - ((v - minV) / (maxV - minV)) * (sparkH - 8)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    const current = values[n - 1]
    const trendColor = current >= 65 ? '#22c55e' : current >= 40 ? '#eab308' : '#ef4444'
    ctx.strokeStyle = trendColor
    ctx.lineWidth = 2
    ctx.stroke()

    // Current score
    ctx.font = `700 ${chartFontSize(16, width)}px 'Inter', sans-serif`
    ctx.fillStyle = trendColor
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(current)}`, width - 12, mt + 16)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('INTEGRITY', width - 12, mt + 24)

    // Domain breakdown (bottom section)
    const breakdownTop = mt + sparkH + 16
    const barH = 14
    const gap = 6

    domains.forEach((d, i) => {
      const y = breakdownTop + i * (barH + gap)
      const barColor = d.score >= 65 ? d.color : d.score >= 40 ? '#eab308' : '#ef4444'

      // Label
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'right'
      ctx.fillText(d.label, ml + 36, y + barH / 2 + 2)

      // Bar bg
      const barX = ml + 42
      const barW = chartW - 42
      ctx.fillStyle = CHART_COLORS.gridLine
      ctx.fillRect(barX, y, barW, barH)

      // Bar fill
      const fillW = (d.score / 100) * barW
      ctx.fillStyle = `${barColor}30`
      ctx.fillRect(barX, y, fillW, barH)
      ctx.strokeStyle = barColor
      ctx.lineWidth = 1
      ctx.strokeRect(barX, y, fillW, barH)

      // Score
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = barColor
      ctx.textAlign = 'left'
      ctx.fillText(`${d.score}`, barX + fillW + 4, y + barH / 2 + 2)
    })

  }, [width, values, domains])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
