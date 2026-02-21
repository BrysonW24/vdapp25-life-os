import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface TimeLayer {
  label: string
  score: number // 0-100
  color: string
}

interface Props {
  layers?: TimeLayer[]
}

const DEFAULT_LAYERS: TimeLayer[] = [
  { label: 'TODAY', score: 72, color: '#3b82f6' },
  { label: 'THIS WEEK', score: 65, color: '#8b5cf6' },
  { label: 'THIS MONTH', score: 58, color: '#22c55e' },
  { label: 'THIS QUARTER', score: 62, color: '#eab308' },
  { label: 'THIS YEAR', score: 55, color: '#FF6B35' },
]

export function ZoomStack({ layers = DEFAULT_LAYERS }: Props) {
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
    ctx.fillText('ZOOM STACK', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const n = layers.length
    const maxW = width - 32
    const layerH = 28
    const gap = 6
    const startY = 32

    layers.forEach((layer, i) => {
      const y = startY + i * (layerH + gap)
      const w = maxW * (0.5 + (1 - i / n) * 0.5) // Wider at top (most zoomed in)
      const x = cx - w / 2

      // Background
      ctx.beginPath()
      ctx.roundRect(x, y, w, layerH, 6)
      ctx.fillStyle = `${layer.color}08`
      ctx.fill()
      ctx.strokeStyle = `${layer.color}30`
      ctx.lineWidth = 1
      ctx.stroke()

      // Score bar
      const barW = (layer.score / 100) * (w - 16)
      ctx.fillStyle = `${layer.color}25`
      ctx.fillRect(x + 8, y + layerH - 6, barW, 3)

      // Label (left)
      ctx.font = `500 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = layer.color
      ctx.textAlign = 'left'
      ctx.fillText(layer.label, x + 8, y + 14)

      // Score (right)
      ctx.font = `700 10px 'Inter', sans-serif`
      ctx.fillStyle = layer.color
      ctx.textAlign = 'right'
      ctx.fillText(`${layer.score}`, x + w - 8, y + 16)

      // Connecting lines between layers
      if (i < n - 1) {
        const nextW = maxW * (0.5 + (1 - (i + 1) / n) * 0.5)
        const nextX = cx - nextW / 2
        ctx.beginPath()
        ctx.moveTo(x + 4, y + layerH)
        ctx.lineTo(nextX + 4, y + layerH + gap)
        ctx.moveTo(x + w - 4, y + layerH)
        ctx.lineTo(nextX + nextW - 4, y + layerH + gap)
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    })

  }, [width, layers])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
