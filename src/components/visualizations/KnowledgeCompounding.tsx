import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  data?: number[] // weekly knowledge accumulation scores
}

function generateDefaults(): number[] {
  const vals: number[] = [10]
  for (let i = 1; i < 52; i++) {
    vals.push(vals[i - 1] * (1 + 0.02 + (Math.random() - 0.4) * 0.03))
  }
  return vals
}

export function KnowledgeCompounding({ data }: Props) {
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
    ctx.fillText('KNOWLEDGE COMPOUNDING', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = values.length
    const maxV = Math.max(...values)
    const minV = Math.min(...values)
    const toX = (i: number) => ml + (i / (n - 1)) * chartW
    const toY = (v: number) => mt + chartH - ((v - minV) / (maxV - minV)) * chartH

    // Linear reference line
    const linearEnd = values[0] + (values[0] * 0.02 * (n - 1))
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(values[0]))
    ctx.lineTo(toX(n - 1), toY(linearEnd))
    ctx.strokeStyle = CHART_COLORS.textDim
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Fill under compound curve
    ctx.beginPath()
    ctx.moveTo(toX(0), mt + chartH)
    values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)))
    ctx.lineTo(toX(n - 1), mt + chartH)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, mt, 0, mt + chartH)
    grad.addColorStop(0, '#8b5cf620')
    grad.addColorStop(1, '#8b5cf602')
    ctx.fillStyle = grad
    ctx.fill()

    // Compound curve
    ctx.beginPath()
    values.forEach((v, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(v))
      else ctx.lineTo(toX(i), toY(v))
    })
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Current value
    const current = values[n - 1]
    const growth = ((current / values[0] - 1) * 100).toFixed(0)
    ctx.font = `700 ${chartFontSize(14, width)}px 'Inter', sans-serif`
    ctx.fillStyle = '#8b5cf6'
    ctx.textAlign = 'right'
    ctx.fillText(`+${growth}%`, width - 12, mt + 10)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('COMPOUND GROWTH', width - 12, mt + 20)

    // Labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'left'
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('LINEAR', toX(n - 1) - 40, toY(linearEnd) - 4)
    ctx.fillStyle = '#8b5cf6'
    ctx.fillText('COMPOUND', toX(n - 1) - 40, toY(current) - 4)

  }, [width, values])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
