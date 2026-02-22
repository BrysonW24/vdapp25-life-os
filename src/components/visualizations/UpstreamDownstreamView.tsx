import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Variable {
  label: string
  layer: 'upstream' | 'midstream' | 'downstream'
  color: string
}

interface Flow {
  from: number
  to: number
  strength: number
}

interface Props {
  variables?: Variable[]
  flows?: Flow[]
}

const DEFAULT_VARS: Variable[] = [
  { label: 'Sleep', layer: 'upstream', color: '#3b82f6' },
  { label: 'Nutrition', layer: 'upstream', color: '#22c55e' },
  { label: 'Exercise', layer: 'upstream', color: '#FF6B35' },
  { label: 'Mood', layer: 'midstream', color: '#8b5cf6' },
  { label: 'Energy', layer: 'midstream', color: '#eab308' },
  { label: 'Focus', layer: 'midstream', color: '#06b6d4' },
  { label: 'Productivity', layer: 'downstream', color: '#3b82f6' },
  { label: 'Creativity', layer: 'downstream', color: '#8b5cf6' },
  { label: 'Social Quality', layer: 'downstream', color: '#22c55e' },
]

const DEFAULT_FLOWS: Flow[] = [
  { from: 0, to: 3, strength: 0.8 }, { from: 0, to: 4, strength: 0.9 }, { from: 0, to: 5, strength: 0.7 },
  { from: 1, to: 3, strength: 0.5 }, { from: 1, to: 4, strength: 0.7 },
  { from: 2, to: 3, strength: 0.6 }, { from: 2, to: 4, strength: 0.8 },
  { from: 3, to: 6, strength: 0.5 }, { from: 3, to: 8, strength: 0.6 },
  { from: 4, to: 6, strength: 0.8 }, { from: 4, to: 7, strength: 0.5 },
  { from: 5, to: 6, strength: 0.9 }, { from: 5, to: 7, strength: 0.7 },
]

export function UpstreamDownstreamView({ variables = DEFAULT_VARS, flows = DEFAULT_FLOWS }: Props) {
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('UPSTREAM / DOWNSTREAM', width / 2, 14)
    ctx.letterSpacing = '0px'

    const layers = { upstream: 50, midstream: 115, downstream: 180 }
    const layerLabels = { upstream: 'UPSTREAM (causes)', midstream: 'MIDSTREAM', downstream: 'DOWNSTREAM (effects)' }

    // Layer labels
    Object.entries(layers).forEach(([key, y]) => {
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(layerLabels[key as keyof typeof layerLabels], 8, y - 12)
    })

    // Position nodes within each layer
    const positions: { x: number; y: number }[] = []
    const layerNodes: Record<string, number[]> = { upstream: [], midstream: [], downstream: [] }
    variables.forEach((v, i) => layerNodes[v.layer].push(i))

    Object.entries(layerNodes).forEach(([layer, indices]) => {
      const y = layers[layer as keyof typeof layers]
      indices.forEach((idx, i) => {
        const x = (width / (indices.length + 1)) * (i + 1)
        positions[idx] = { x, y }
      })
    })

    // Draw flows
    flows.forEach(f => {
      const from = positions[f.from]
      const to = positions[f.to]
      if (!from || !to) return

      ctx.beginPath()
      ctx.moveTo(from.x, from.y + 10)
      ctx.bezierCurveTo(from.x, from.y + 30, to.x, to.y - 30, to.x, to.y - 10)
      ctx.strokeStyle = variables[f.from].color
      ctx.lineWidth = 0.5 + f.strength * 2
      ctx.globalAlpha = 0.1 + f.strength * 0.15
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Draw nodes
    variables.forEach((v, i) => {
      const pos = positions[i]
      if (!pos) return

      ctx.beginPath()
      ctx.roundRect(pos.x - 28, pos.y - 8, 56, 16, 4)
      ctx.fillStyle = `${v.color}15`
      ctx.fill()
      ctx.strokeStyle = `${v.color}40`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = v.color
      ctx.textAlign = 'center'
      ctx.fillText(v.label, pos.x, pos.y + 3)
    })

  }, [width, variables, flows])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
