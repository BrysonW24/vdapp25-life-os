import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  calories?: number[]
  protein?: number[]
  fiber?: number[]
}

function generateSeries(base: number, variance: number, n = 30): number[] {
  return Array.from({ length: n }, () => base + (Math.random() - 0.5) * variance * 2)
}

function rollingVariance(data: number[], window: number): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    const mean = slice.reduce((s, v) => s + v, 0) / slice.length
    return Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / slice.length)
  })
}

export function NutritionVolatility({ calories, protein, fiber }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const cal = useMemo(() => calories ?? generateSeries(2200, 400), [calories])
  const pro = useMemo(() => protein ?? generateSeries(140, 30), [protein])
  const fib = useMemo(() => fiber ?? generateSeries(28, 8), [fiber])

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
    ctx.fillText('NUTRITION VOLATILITY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const series = [
      { label: 'Calories', data: rollingVariance(cal, 7), color: '#FF6B35', raw: cal },
      { label: 'Protein', data: rollingVariance(pro, 7), color: '#22c55e', raw: pro },
      { label: 'Fiber', data: rollingVariance(fib, 7), color: '#8b5cf6', raw: fib },
    ]

    const rowH = 48
    const marginLeft = 60
    const marginRight = 40
    const sparkW = width - marginLeft - marginRight

    series.forEach((s, si) => {
      const baseY = 30 + si * (rowH + 8)
      const maxVar = Math.max(...s.data, 1)

      // Label
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = s.color
      ctx.textAlign = 'right'
      ctx.fillText(s.label, marginLeft - 8, baseY + rowH / 2 + 3)

      // Sparkline area
      ctx.beginPath()
      s.data.forEach((v, i) => {
        const x = marginLeft + (i / (s.data.length - 1)) * sparkW
        const y = baseY + rowH - (v / maxVar) * rowH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      // Close area
      ctx.lineTo(marginLeft + sparkW, baseY + rowH)
      ctx.lineTo(marginLeft, baseY + rowH)
      ctx.closePath()
      ctx.fillStyle = `${s.color}15`
      ctx.fill()

      // Sparkline stroke
      ctx.beginPath()
      s.data.forEach((v, i) => {
        const x = marginLeft + (i / (s.data.length - 1)) * sparkW
        const y = baseY + rowH - (v / maxVar) * rowH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = s.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      // Current variance value
      const currentVar = s.data[s.data.length - 1]
      ctx.font = `700 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = s.color
      ctx.textAlign = 'left'
      ctx.fillText(`σ ${currentVar.toFixed(0)}`, marginLeft + sparkW + 6, baseY + rowH / 2 + 3)
    })

  }, [width, cal, pro, fib])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
