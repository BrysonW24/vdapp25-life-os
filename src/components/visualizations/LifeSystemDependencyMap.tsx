import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Life System Dependency Map — weighted directed graph showing how
 * domains influence each other. If Sleep drops 10%, what downstream
 * nodes statistically decline? Animated force-directed layout with
 * weighted edges showing influence strength.
 */

interface SystemNode {
  id: string
  label: string
  color: string
  health: number // 0-100 current health
}

interface SystemEdge {
  from: string
  to: string
  weight: number // 0-1 influence strength
}

interface Props {
  nodes?: SystemNode[]
  edges?: SystemEdge[]
}

const DEFAULT_NODES: SystemNode[] = [
  { id: 'sleep',      label: 'Sleep',      color: '#8b5cf6', health: 65 },
  { id: 'deepwork',   label: 'Deep Work',  color: '#3b82f6', health: 72 },
  { id: 'fitness',    label: 'Fitness',     color: '#22c55e', health: 80 },
  { id: 'energy',     label: 'Energy',      color: '#ec4899', health: 60 },
  { id: 'confidence', label: 'Confidence',  color: '#eab308', health: 55 },
  { id: 'social',     label: 'Social',      color: '#06b6d4', health: 45 },
  { id: 'revenue',    label: 'Revenue',     color: '#FF6B35', health: 70 },
  { id: 'stress',     label: 'Stress',      color: '#ef4444', health: 40 },
]

const DEFAULT_EDGES: SystemEdge[] = [
  { from: 'sleep',    to: 'energy',      weight: 0.9 },
  { from: 'sleep',    to: 'deepwork',    weight: 0.7 },
  { from: 'fitness',  to: 'energy',      weight: 0.8 },
  { from: 'energy',   to: 'deepwork',    weight: 0.6 },
  { from: 'deepwork', to: 'confidence',  weight: 0.5 },
  { from: 'deepwork', to: 'revenue',     weight: 0.7 },
  { from: 'confidence', to: 'social',    weight: 0.4 },
  { from: 'revenue',  to: 'stress',      weight: -0.6 }, // negative = reduces stress
  { from: 'stress',   to: 'sleep',       weight: -0.5 }, // stress hurts sleep
  { from: 'social',   to: 'energy',      weight: -0.3 }, // social drains energy (introvert)
]

export function LifeSystemDependencyMap({ nodes = DEFAULT_NODES, edges = DEFAULT_EDGES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 400)
  const height = size * 0.85

  // Arrange nodes in a circle
  const positions = useMemo(() => {
    const cx = size / 2
    const cy = height / 2 + 6
    const r = Math.min(size, height) / 2 - 55

    return nodes.map((n, i) => {
      const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2
      return {
        ...n,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      }
    })
  }, [nodes, size, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = height * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    let animFrame: number
    let time = 0

    function draw() {
      time += 0.01
      ctx.clearRect(0, 0, size, height)

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('SYSTEM DEPENDENCY MAP', size / 2, 14)
      ctx.letterSpacing = '0px'

      // Draw edges
      edges.forEach(edge => {
        const fromNode = positions.find(n => n.id === edge.from)
        const toNode = positions.find(n => n.id === edge.to)
        if (!fromNode || !toNode) return

        const isNegative = edge.weight < 0
        const absWeight = Math.abs(edge.weight)

        // Draw curved arrow
        const mx = (fromNode.x + toNode.x) / 2
        const my = (fromNode.y + toNode.y) / 2
        // Offset control point for curve
        const dx = toNode.x - fromNode.x
        const dy = toNode.y - fromNode.y
        const perpX = -dy * 0.15
        const perpY = dx * 0.15
        const cpx = mx + perpX
        const cpy = my + perpY

        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.quadraticCurveTo(cpx, cpy, toNode.x, toNode.y)
        ctx.strokeStyle = isNegative ? '#ef4444' : '#22c55e'
        ctx.lineWidth = absWeight * 2.5
        ctx.globalAlpha = 0.15 + absWeight * 0.15

        // Pulse for strong connections
        if (absWeight > 0.6) {
          ctx.globalAlpha *= 0.7 + 0.3 * Math.sin(time * 2 + edges.indexOf(edge))
        }

        ctx.stroke()
        ctx.globalAlpha = 1

        // Arrow head
        const angle = Math.atan2(toNode.y - cpy, toNode.x - cpx)
        const arrowLen = 6
        const ax1 = toNode.x - Math.cos(angle - 0.3) * arrowLen
        const ay1 = toNode.y - Math.sin(angle - 0.3) * arrowLen
        const ax2 = toNode.x - Math.cos(angle + 0.3) * arrowLen
        const ay2 = toNode.y - Math.sin(angle + 0.3) * arrowLen

        ctx.beginPath()
        ctx.moveTo(toNode.x, toNode.y)
        ctx.lineTo(ax1, ay1)
        ctx.lineTo(ax2, ay2)
        ctx.closePath()
        ctx.fillStyle = isNegative ? '#ef4444' : '#22c55e'
        ctx.globalAlpha = 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Draw nodes
      positions.forEach(node => {
        const healthFrac = node.health / 100
        const nodeR = 16

        // Outer glow based on health
        const glowR = nodeR + 8
        const glow = ctx.createRadialGradient(node.x, node.y, nodeR, node.x, node.y, glowR)
        glow.addColorStop(0, `${node.color}20`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2)
        ctx.fillStyle = `${node.color}15`
        ctx.fill()
        ctx.strokeStyle = node.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.3 + healthFrac * 0.5
        ctx.stroke()
        ctx.globalAlpha = 1

        // Health arc (fills proportionally)
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeR, -Math.PI / 2, -Math.PI / 2 + healthFrac * Math.PI * 2)
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2.5
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1

        // Health number
        ctx.font = `700 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = node.color
        ctx.textAlign = 'center'
        ctx.fillText(`${node.health}`, node.x, node.y + 3)

        // Label
        ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.6
        ctx.fillText(node.label, node.x, node.y + nodeR + 14)
        ctx.globalAlpha = 1
      })

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, positions, edges])

  const positiveEdges = edges.filter(e => e.weight > 0).length
  const negativeEdges = edges.filter(e => e.weight < 0).length

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: '#22c55e' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Amplifies ({positiveEdges})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: '#ef4444' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Depletes ({negativeEdges})</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>
    </div>
  )
}
