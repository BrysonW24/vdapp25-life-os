import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface StateNode {
  label: string
  color: string
  frequency: number // 0-1, how often in this state
}

interface Transition {
  from: number
  to: number
  weight: number // 0-1
}

interface Props {
  states?: StateNode[]
  transitions?: Transition[]
  currentState?: number
}

const DEFAULT_STATES: StateNode[] = [
  { label: 'Calm', color: '#22c55e', frequency: 0.25 },
  { label: 'Driven', color: '#3b82f6', frequency: 0.30 },
  { label: 'Anxious', color: '#eab308', frequency: 0.15 },
  { label: 'Flat', color: '#606080', frequency: 0.10 },
  { label: 'Flow', color: '#8b5cf6', frequency: 0.12 },
  { label: 'Scattered', color: '#ef4444', frequency: 0.08 },
]

const DEFAULT_TRANSITIONS: Transition[] = [
  { from: 0, to: 1, weight: 0.6 },
  { from: 1, to: 4, weight: 0.4 },
  { from: 1, to: 2, weight: 0.5 },
  { from: 2, to: 5, weight: 0.3 },
  { from: 2, to: 3, weight: 0.4 },
  { from: 3, to: 0, weight: 0.3 },
  { from: 4, to: 0, weight: 0.5 },
  { from: 5, to: 2, weight: 0.4 },
  { from: 5, to: 3, weight: 0.3 },
]

export function StateTransitionDiagram({
  states = DEFAULT_STATES,
  transitions = DEFAULT_TRANSITIONS,
  currentState = 1,
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('STATE TRANSITIONS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 135
    const radius = Math.min(width * 0.32, 80)

    // Position nodes in circle
    const positions = states.map((_, i) => {
      const angle = (i / states.length) * Math.PI * 2 - Math.PI / 2
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
    })

    // Draw transitions (edges)
    transitions.forEach(t => {
      const from = positions[t.from]
      const to = positions[t.to]
      const midX = (from.x + to.x) / 2 + (Math.random() - 0.5) * 10
      const midY = (from.y + to.y) / 2 + (Math.random() - 0.5) * 10

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.quadraticCurveTo(midX, midY, to.x, to.y)
      ctx.strokeStyle = states[t.from].color
      ctx.lineWidth = 0.5 + t.weight * 2
      ctx.globalAlpha = 0.15 + t.weight * 0.25
      ctx.stroke()
      ctx.globalAlpha = 1

      // Arrow head
      const dx = to.x - midX
      const dy = to.y - midY
      const angle = Math.atan2(dy, dx)
      const arrLen = 5
      const arrX = to.x - Math.cos(angle) * 16
      const arrY = to.y - Math.sin(angle) * 16

      ctx.beginPath()
      ctx.moveTo(arrX, arrY)
      ctx.lineTo(arrX - Math.cos(angle - 0.4) * arrLen, arrY - Math.sin(angle - 0.4) * arrLen)
      ctx.lineTo(arrX - Math.cos(angle + 0.4) * arrLen, arrY - Math.sin(angle + 0.4) * arrLen)
      ctx.closePath()
      ctx.fillStyle = states[t.from].color
      ctx.globalAlpha = 0.3 + t.weight * 0.3
      ctx.fill()
      ctx.globalAlpha = 1
    })

    // Draw nodes
    states.forEach((state, i) => {
      const pos = positions[i]
      const nodeR = 12 + state.frequency * 16
      const isCurrent = i === currentState

      // Glow for current state
      if (isCurrent) {
        const glow = ctx.createRadialGradient(pos.x, pos.y, nodeR, pos.x, pos.y, nodeR + 12)
        glow.addColorStop(0, `${state.color}30`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeR + 12, 0, Math.PI * 2)
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2)
      ctx.fillStyle = `${state.color}${isCurrent ? '30' : '15'}`
      ctx.fill()
      ctx.strokeStyle = state.color
      ctx.lineWidth = isCurrent ? 2 : 1
      ctx.globalAlpha = isCurrent ? 0.8 : 0.4
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label
      ctx.font = `${isCurrent ? 700 : 500} ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = state.color
      ctx.textAlign = 'center'
      ctx.globalAlpha = isCurrent ? 1 : 0.7
      ctx.fillText(state.label, pos.x, pos.y + 3)
      ctx.globalAlpha = 1

      // Frequency
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${Math.round(state.frequency * 100)}%`, pos.x, pos.y + 12)
    })

  }, [width, states, transitions, currentState])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
