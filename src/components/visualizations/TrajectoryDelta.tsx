import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  data?: number[] // 12 months of rate-of-change values (-10 to 10)
}

function generateDefaults(): number[] {
  return Array.from({ length: 52 }, (_, i) =>
    Math.sin(i / 6) * 4 + (Math.random() - 0.5) * 3 + (i > 35 ? -2 : 0)
  )
}

export function TrajectoryDelta({ data }: Props) {
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('TRAJECTORY DELTA', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 24, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const maxVal = Math.max(...values.map(Math.abs), 1)
    const zeroY = mt + chartH / 2
    const n = values.length

    // Zero line
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ml, zeroY)
    ctx.lineTo(ml + chartW, zeroY)
    ctx.stroke()

    // Zone labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'left'
    ctx.fillText('COMPOUNDING', ml + 4, mt + 8)
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('STAGNANT', ml + 4, zeroY - 4)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('ERODING', ml + 4, mt + chartH - 4)
    ctx.globalAlpha = 1

    // Fill areas
    // Positive fill (green)
    ctx.beginPath()
    ctx.moveTo(ml, zeroY)
    values.forEach((v, i) => {
      const x = ml + (i / (n - 1)) * chartW
      const y = zeroY - (Math.max(0, v) / maxVal) * (chartH / 2)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(ml + chartW, zeroY)
    ctx.closePath()
    ctx.fillStyle = '#22c55e10'
    ctx.fill()

    // Negative fill (red)
    ctx.beginPath()
    ctx.moveTo(ml, zeroY)
    values.forEach((v, i) => {
      const x = ml + (i / (n - 1)) * chartW
      const y = zeroY - (Math.min(0, v) / maxVal) * (chartH / 2)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(ml + chartW, zeroY)
    ctx.closePath()
    ctx.fillStyle = '#ef444410'
    ctx.fill()

    // Line
    ctx.beginPath()
    values.forEach((v, i) => {
      const x = ml + (i / (n - 1)) * chartW
      const y = zeroY - (v / maxVal) * (chartH / 2)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    const current = values[values.length - 1]
    ctx.strokeStyle = current >= 0 ? '#22c55e' : '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Current value
    const currentColor = current >= 2 ? '#22c55e' : current >= -2 ? '#eab308' : '#ef4444'
    const label = current >= 2 ? 'COMPOUNDING' : current >= -2 ? 'STAGNANT' : 'ERODING'
    ctx.font = `700 ${chartFontSize(12, width)}px 'Inter', sans-serif`
    ctx.fillStyle = currentColor
    ctx.textAlign = 'right'
    ctx.fillText(`${current >= 0 ? '+' : ''}${current.toFixed(1)}`, width - 12, mt + 12)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText(label, width - 12, mt + 22)

  }, [width, values])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
