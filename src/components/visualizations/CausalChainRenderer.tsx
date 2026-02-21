import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Causal Chain Renderer — directed graph showing causal chains between
 * life variables. Nodes arranged in a force-directed circle layout.
 * Arrow thickness = causal strength (0-1). Arrow color: green = positive
 * influence, red = negative. Closed loops are visible as cycles in the graph.
 *
 * "See which life variables drive each other — and where vicious
 * cycles are forming."
 */

interface CausalLink {
  from: string
  to: string
  strength: number  // 0-1
  direction: 'positive' | 'negative'
}

interface CausalNode {
  id: string
  label: string
  icon: string
}

interface Props {
  nodes?: CausalNode[]
  links?: CausalLink[]
}

const DEFAULT_NODES: CausalNode[] = [
  { id: 'sleep',        label: 'Sleep',        icon: '🌙' },
  { id: 'nutrition',    label: 'Nutrition',    icon: '🥗' },
  { id: 'exercise',     label: 'Exercise',     icon: '💪' },
  { id: 'mood',         label: 'Mood',         icon: '☀️' },
  { id: 'focus',        label: 'Focus',        icon: '🎯' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'social',       label: 'Social',       icon: '👥' },
  { id: 'stress',       label: 'Stress',       icon: '🔥' },
]

const DEFAULT_LINKS: CausalLink[] = [
  // Positive chains
  { from: 'sleep',     to: 'mood',         strength: 0.85, direction: 'positive' },
  { from: 'sleep',     to: 'focus',        strength: 0.78, direction: 'positive' },
  { from: 'exercise',  to: 'mood',         strength: 0.72, direction: 'positive' },
  { from: 'exercise',  to: 'sleep',        strength: 0.60, direction: 'positive' },
  { from: 'nutrition', to: 'focus',        strength: 0.55, direction: 'positive' },
  { from: 'mood',      to: 'productivity', strength: 0.80, direction: 'positive' },
  { from: 'focus',     to: 'productivity', strength: 0.90, direction: 'positive' },
  { from: 'social',    to: 'mood',         strength: 0.50, direction: 'positive' },
  { from: 'nutrition', to: 'exercise',     strength: 0.45, direction: 'positive' },

  // Negative chains — vicious cycle
  { from: 'stress',       to: 'sleep',  strength: 0.75, direction: 'negative' },
  { from: 'focus',        to: 'stress', strength: 0.40, direction: 'negative' },
  { from: 'stress',       to: 'mood',   strength: 0.65, direction: 'negative' },
  { from: 'productivity', to: 'stress', strength: 0.35, direction: 'negative' },
]

export function CausalChainRenderer({
  nodes = DEFAULT_NODES,
  links = DEFAULT_LINKS,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 420)
  const height = size

  // Circle layout positions
  const nodePositions = useMemo(() => {
    const cx = size / 2
    const cy = size / 2 + 6
    const r = size / 2 - 56

    return nodes.map((node, i) => {
      const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2
      return {
        ...node,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      }
    })
  }, [size, nodes])

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

    const cx = size / 2
    const cy = size / 2 + 6
    let animFrame: number
    let time = 0

    function drawArrow(
      fromX: number, fromY: number,
      toX: number, toY: number,
      strength: number,
      color: string,
      nodeRadius: number,
    ) {
      const dx = toX - fromX
      const dy = toY - fromY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1) return

      const nx = dx / dist
      const ny = dy / dist

      // Offset from node edges
      const startX = fromX + nx * nodeRadius
      const startY = fromY + ny * nodeRadius
      const endX = toX - nx * (nodeRadius + 8)
      const endY = toY - ny * (nodeRadius + 8)

      // Curve the arrow slightly to avoid overlap
      const perpX = -ny
      const perpY = nx
      const curvature = 18
      const cpX = (startX + endX) / 2 + perpX * curvature
      const cpY = (startY + endY) / 2 + perpY * curvature

      // Draw curved line
      const lineWidth = 1 + strength * 3
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.quadraticCurveTo(cpX, cpY, endX, endY)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.globalAlpha = 0.3 + strength * 0.45
      ctx.stroke()
      ctx.globalAlpha = 1

      // Arrowhead
      const arrowSize = 5 + strength * 3
      // Get tangent at endpoint for arrowhead direction
      const t = 0.98
      const tangentX = 2 * (1 - t) * (cpX - startX) + 2 * t * (endX - cpX)
      const tangentY = 2 * (1 - t) * (cpY - startY) + 2 * t * (endY - cpY)
      const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
      const tnx = tangentX / tangentLen
      const tny = tangentY / tangentLen

      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - tnx * arrowSize + tny * arrowSize * 0.5,
        endY - tny * arrowSize - tnx * arrowSize * 0.5,
      )
      ctx.lineTo(
        endX - tnx * arrowSize - tny * arrowSize * 0.5,
        endY - tny * arrowSize + tnx * arrowSize * 0.5,
      )
      ctx.closePath()
      ctx.fillStyle = color
      ctx.globalAlpha = 0.4 + strength * 0.4
      ctx.fill()
      ctx.globalAlpha = 1
    }

    function draw() {
      time += 0.008
      ctx.clearRect(0, 0, size, height)

      // Background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2)
      bgGrad.addColorStop(0, 'rgba(124, 58, 237, 0.03)')
      bgGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, size, height)

      // Title
      ctx.font = `500 8px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('CAUSAL CHAINS', size / 2, 14)
      ctx.letterSpacing = '0px'

      const nodeRadius = 16

      // Draw links with animated flow particles
      links.forEach((link, li) => {
        const fromNode = nodePositions.find(n => n.id === link.from)
        const toNode = nodePositions.find(n => n.id === link.to)
        if (!fromNode || !toNode) return

        const color = link.direction === 'positive' ? CHART_COLORS.aligned : CHART_COLORS.avoiding

        drawArrow(fromNode.x, fromNode.y, toNode.x, toNode.y, link.strength, color, nodeRadius)

        // Animated flow dot along the curve
        const dx = toNode.x - fromNode.x
        const dy = toNode.y - fromNode.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / dist
        const ny = dy / dist
        const perpX = -ny
        const perpY = nx
        const curvature = 18

        const startX = fromNode.x + nx * nodeRadius
        const startY = fromNode.y + ny * nodeRadius
        const endX = toNode.x - nx * (nodeRadius + 8)
        const endY = toNode.y - ny * (nodeRadius + 8)
        const cpX = (startX + endX) / 2 + perpX * curvature
        const cpY = (startY + endY) / 2 + perpY * curvature

        const flowT = ((time * 0.8 + li * 0.15) % 1)
        const flowX = (1 - flowT) * (1 - flowT) * startX + 2 * (1 - flowT) * flowT * cpX + flowT * flowT * endX
        const flowY = (1 - flowT) * (1 - flowT) * startY + 2 * (1 - flowT) * flowT * cpY + flowT * flowT * endY

        ctx.beginPath()
        ctx.arc(flowX, flowY, 1.5 + link.strength, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.5 + link.strength * 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Draw nodes
      nodePositions.forEach(node => {
        // Outer glow
        const nodeGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius + 10)
        nodeGrad.addColorStop(0, `${CHART_COLORS.brandLight}15`)
        nodeGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = nodeGrad
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius + 10, 0, Math.PI * 2)
        ctx.fill()

        // Node circle fill
        ctx.fillStyle = CHART_COLORS.surfaceLight
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Node border
        ctx.strokeStyle = CHART_COLORS.border
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Icon
        ctx.font = '12px sans-serif'
        ctx.fillStyle = CHART_COLORS.textPrimary
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.icon, node.x, node.y)
        ctx.textBaseline = 'alphabetic'

        // Label
        ctx.font = `600 7px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textSecondary
        ctx.globalAlpha = 0.8
        ctx.fillText(node.label, node.x, node.y + nodeRadius + 12)
        ctx.globalAlpha = 1
      })

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, nodePositions, links])

  const positiveCount = links.filter(l => l.direction === 'positive').length
  const negativeCount = links.filter(l => l.direction === 'negative').length
  const avgStrength = links.length > 0
    ? (links.reduce((s, l) => s + l.strength, 0) / links.length).toFixed(2)
    : '0'

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 rounded-full" style={{ background: CHART_COLORS.aligned }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Positive</span>
            <span className="text-[9px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.aligned }}>{positiveCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 rounded-full" style={{ background: CHART_COLORS.avoiding }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Negative</span>
            <span className="text-[9px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.avoiding }}>{negativeCount}</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          avg strength {avgStrength}
        </span>
      </div>
    </div>
  )
}
