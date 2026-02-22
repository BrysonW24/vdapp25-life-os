import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Reserve {
  label: string
  level: number // 0-100
  color: string
}

interface Props {
  reserves?: Reserve[]
}

const DEFAULT_RESERVES: Reserve[] = [
  { label: 'Physical', level: 65, color: '#22c55e' },
  { label: 'Emotional', level: 40, color: '#8b5cf6' },
  { label: 'Cognitive', level: 55, color: '#3b82f6' },
  { label: 'Social', level: 75, color: '#FF6B35' },
  { label: 'Motivational', level: 30, color: '#eab308' },
]

export function ReservesGauge({ reserves = DEFAULT_RESERVES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('RESERVES GAUGE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 30, mb = 12
    const chartW = width - ml - mr
    const n = reserves.length
    const gaugeW = Math.min(28, (chartW - (n - 1) * 8) / n)
    const gaugeH = height - mt - mb
    const totalSpacing = (chartW - n * gaugeW) / (n + 1)

    reserves.forEach((res, i) => {
      const x = ml + totalSpacing + i * (gaugeW + totalSpacing)

      // Background tank
      ctx.beginPath()
      ctx.roundRect(x, mt, gaugeW, gaugeH, 6)
      ctx.fillStyle = CHART_COLORS.gridLine
      ctx.fill()
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 1
      ctx.stroke()

      // Danger zone (bottom 25%)
      const dangerH = gaugeH * 0.25
      ctx.fillStyle = '#ef444408'
      ctx.fillRect(x + 1, mt + gaugeH - dangerH, gaugeW - 2, dangerH)

      // Fill level
      const fillH = (res.level / 100) * gaugeH
      const fillY = mt + gaugeH - fillH
      const levelColor = res.level < 25 ? '#ef4444' : res.level < 50 ? '#eab308' : res.color

      ctx.beginPath()
      ctx.roundRect(x + 2, fillY, gaugeW - 4, fillH - 2, [0, 0, 4, 4])
      ctx.fillStyle = `${levelColor}35`
      ctx.fill()

      // Fill line at top
      ctx.beginPath()
      ctx.moveTo(x + 2, fillY)
      ctx.lineTo(x + gaugeW - 2, fillY)
      ctx.strokeStyle = levelColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Tick marks
      for (const tick of [25, 50, 75]) {
        const ty = mt + gaugeH - (tick / 100) * gaugeH
        ctx.beginPath()
        ctx.moveTo(x, ty)
        ctx.lineTo(x + 3, ty)
        ctx.strokeStyle = CHART_COLORS.border
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Level %
      ctx.font = `700 ${chartFontSize(8, width)}px 'Inter', sans-serif`
      ctx.fillStyle = levelColor
      ctx.textAlign = 'center'
      ctx.fillText(`${res.level}`, x + gaugeW / 2, fillY - 6)

      // Label
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.fillText(res.label.slice(0, 5), x + gaugeW / 2, mt + gaugeH + 10)
    })

    // Overall composite
    const avg = Math.round(reserves.reduce((s, r) => s + r.level, 0) / reserves.length)
    const avgColor = avg < 30 ? '#ef4444' : avg < 50 ? '#eab308' : '#22c55e'
    ctx.font = `700 ${chartFontSize(10, width)}px 'Inter', sans-serif`
    ctx.fillStyle = avgColor
    ctx.textAlign = 'right'
    ctx.fillText(`${avg}%`, width - 12, 24)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('AVG', width - 12, 32)

  }, [width, reserves])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
