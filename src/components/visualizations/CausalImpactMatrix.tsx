import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  inputs?: string[]
  outcomes?: string[]
  effects?: number[][] // rows=inputs, cols=outcomes, -1 to 1
}

const DEFAULT_INPUTS = ['Sleep', 'Training', 'Nutrition', 'Social', 'Stress', 'Spending']
const DEFAULT_OUTCOMES = ['Mood', 'Deep Work', 'Performance', 'Energy', 'Creativity', 'Relationships']
const DEFAULT_EFFECTS = [
  [0.8, 0.7, 0.5, 0.9, 0.4, 0.3],
  [0.6, 0.3, 0.8, 0.7, 0.2, 0.1],
  [0.5, 0.4, 0.6, 0.8, 0.3, 0.1],
  [0.7, -0.2, -0.1, 0.4, 0.3, 0.9],
  [-0.8, -0.6, -0.4, -0.7, -0.5, -0.3],
  [-0.2, -0.1, 0.0, -0.1, 0.1, 0.3],
]

export function CausalImpactMatrix({
  inputs = DEFAULT_INPUTS,
  outcomes = DEFAULT_OUTCOMES,
  effects = DEFAULT_EFFECTS,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('CAUSAL IMPACT MATRIX', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 56, mt = 48, mr = 8, mb = 8
    const cols = outcomes.length
    const rows = inputs.length
    const cellW = (width - ml - mr) / cols
    const cellH = (height - mt - mb) / rows

    // Column headers (rotated)
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textSecondary
    outcomes.forEach((o, i) => {
      ctx.save()
      ctx.translate(ml + i * cellW + cellW / 2, mt - 6)
      ctx.rotate(-Math.PI / 4)
      ctx.textAlign = 'left'
      ctx.fillText(o, 0, 0)
      ctx.restore()
    })

    // Row labels + cells
    inputs.forEach((inp, r) => {
      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'right'
      ctx.fillText(inp, ml - 4, mt + r * cellH + cellH / 2 + 2)

      outcomes.forEach((_, c) => {
        const effect = effects[r]?.[c] ?? 0
        const x = ml + c * cellW
        const y = mt + r * cellH

        // Color: green for positive, red for negative
        const intensity = Math.abs(effect)
        if (effect > 0) {
          ctx.fillStyle = `rgba(34, 197, 94, ${intensity * 0.5})`
        } else if (effect < 0) {
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.5})`
        } else {
          ctx.fillStyle = '#1a1a30'
        }
        ctx.beginPath()
        ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 2)
        ctx.fill()

        // Value
        if (intensity > 0.1) {
          ctx.font = `500 6px 'JetBrains Mono', monospace`
          ctx.fillStyle = effect > 0 ? '#22c55e' : '#ef4444'
          ctx.textAlign = 'center'
          ctx.globalAlpha = 0.7
          ctx.fillText(effect > 0 ? `+${effect.toFixed(1)}` : effect.toFixed(1), x + cellW / 2, y + cellH / 2 + 2)
          ctx.globalAlpha = 1
        }
      })
    })

  }, [width, inputs, outcomes, effects])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
