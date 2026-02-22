import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Opportunity Network — force-directed network graph rendered on Canvas.
 * Central node = "You". Connected nodes = key people.
 * Node size = opportunity value. Edge thickness = interaction frequency.
 * Color by domain: work=#3b82f6, personal=#8b5cf6, financial=#FF6B35.
 * Top 3 high-leverage nodes highlighted. Gaps shown as dashed circles.
 */

type Domain = 'work' | 'personal' | 'financial'

interface NetworkNode {
  id: string
  label: string
  domain: Domain
  opportunityValue: number // 1-10
  interactionFreq: number  // 1-10
}

interface Props {
  nodes?: NetworkNode[]
}

const DOMAIN_COLORS: Record<Domain, string> = {
  work: '#3b82f6',
  personal: '#8b5cf6',
  financial: '#FF6B35',
}

const DEFAULT_NODES: NetworkNode[] = [
  { id: 'a', label: 'Sarah',   domain: 'work',      opportunityValue: 9, interactionFreq: 8 },
  { id: 'b', label: 'Marcus',  domain: 'work',      opportunityValue: 7, interactionFreq: 5 },
  { id: 'c', label: 'Lena',    domain: 'personal',  opportunityValue: 6, interactionFreq: 9 },
  { id: 'd', label: 'Tom',     domain: 'financial',  opportunityValue: 8, interactionFreq: 3 },
  { id: 'e', label: 'Priya',   domain: 'work',      opportunityValue: 5, interactionFreq: 6 },
  { id: 'f', label: 'James',   domain: 'personal',  opportunityValue: 4, interactionFreq: 7 },
  { id: 'g', label: 'Chen',    domain: 'financial',  opportunityValue: 7, interactionFreq: 2 },
  { id: 'h', label: 'Aisha',   domain: 'work',      opportunityValue: 6, interactionFreq: 4 },
  { id: 'i', label: 'Dev',     domain: 'personal',  opportunityValue: 3, interactionFreq: 5 },
  { id: 'j', label: 'Olivia',  domain: 'financial',  opportunityValue: 5, interactionFreq: 1 },
]

export function OpportunityNetwork({ nodes = DEFAULT_NODES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 420)
  const totalHeight = size + 28

  // Position nodes in a radial layout around center
  const positioned = useMemo(() => {
    const cx = size / 2
    const cy = 14 + size / 2
    const maxR = size / 2 - 50

    // Sort by domain for grouping
    const sorted = [...nodes].sort((a, b) => {
      const order: Record<Domain, number> = { work: 0, personal: 1, financial: 2 }
      return order[a.domain] - order[b.domain]
    })

    return sorted.map((node, i) => {
      const angle = (i / sorted.length) * Math.PI * 2 - Math.PI / 2
      const distFrac = 0.5 + (1 - node.interactionFreq / 10) * 0.5
      const dist = distFrac * maxR
      return {
        ...node,
        x: cx + dist * Math.cos(angle),
        y: cy + dist * Math.sin(angle),
        r: 6 + (node.opportunityValue / 10) * 14,
      }
    })
  }, [nodes, size])

  // Top 3 high-leverage nodes
  const topNodes = useMemo(() => {
    return [...nodes]
      .sort((a, b) => (b.opportunityValue * b.interactionFreq) - (a.opportunityValue * a.interactionFreq))
      .slice(0, 3)
      .map(n => n.id)
  }, [nodes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 200) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = totalHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${totalHeight}px`
    ctx.scale(dpr, dpr)

    const cx = width / 2
    const cy = 14 + size / 2

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('OPPORTUNITY NETWORK', cx, 12)
    ctx.letterSpacing = '0px'

    // Network gaps — dashed circles in underrepresented domains
    const domainCounts: Record<Domain, number> = { work: 0, personal: 0, financial: 0 }
    nodes.forEach(n => domainCounts[n.domain]++)
    const avgCount = nodes.length / 3
    const maxR = size / 2 - 50

    Object.entries(domainCounts).forEach(([domain, count]) => {
      if (count < avgCount * 0.6) {
        const domainNodes = positioned.filter(n => n.domain === domain)
        if (domainNodes.length > 0) {
          const gapX = domainNodes.reduce((s, n) => s + n.x, 0) / domainNodes.length
          const gapY = domainNodes.reduce((s, n) => s + n.y, 0) / domainNodes.length
          ctx.beginPath()
          ctx.arc(gapX, gapY, 30, 0, Math.PI * 2)
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = DOMAIN_COLORS[domain as Domain]
          ctx.globalAlpha = 0.15
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1

          ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
          ctx.fillStyle = DOMAIN_COLORS[domain as Domain]
          ctx.globalAlpha = 0.3
          ctx.fillText('GAP', gapX, gapY + 2)
          ctx.globalAlpha = 1
        }
      }
    })

    // Draw edges from center to each node
    positioned.forEach((node) => {
      const edgeWidth = 0.5 + (node.interactionFreq / 10) * 3
      const color = DOMAIN_COLORS[node.domain]

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(node.x, node.y)
      ctx.strokeStyle = color
      ctx.lineWidth = edgeWidth
      ctx.globalAlpha = 0.15 + (node.interactionFreq / 10) * 0.2
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Draw center node
    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
    centerGlow.addColorStop(0, `${CHART_COLORS.textPrimary}30`)
    centerGlow.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(cx, cy, 20, 0, Math.PI * 2)
    ctx.fillStyle = centerGlow
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, 10, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.surfaceLight
    ctx.fill()
    ctx.strokeStyle = CHART_COLORS.textPrimary
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.font = `700 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.textAlign = 'center'
    ctx.fillText('YOU', cx, cy + 3)

    // Draw each node
    positioned.forEach((node) => {
      const color = DOMAIN_COLORS[node.domain]
      const isTop = topNodes.includes(node.id)

      // Glow for top nodes
      if (isTop) {
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r + 10)
        glow.addColorStop(0, `${color}40`)
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + 10, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Highlight ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
      ctx.fillStyle = `${color}30`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = isTop ? 2 : 1
      ctx.globalAlpha = isTop ? 0.9 : 0.5
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label
      ctx.font = `${isTop ? 600 : 400} ${isTop ? 8 : 7}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.globalAlpha = isTop ? 0.9 : 0.6
      ctx.fillText(node.label, node.x, node.y + node.r + 12)
      ctx.globalAlpha = 1

      // Value inside node
      ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.globalAlpha = 0.8
      ctx.fillText(`${node.opportunityValue}`, node.x, node.y + 3)
      ctx.globalAlpha = 1
    })

    // Top leverage label
    const topPositioned = positioned.filter(n => topNodes.includes(n.id))
    if (topPositioned.length > 0) {
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText('★ = HIGH LEVERAGE', width - 8, totalHeight - 4)
    }

  }, [width, positioned, topNodes, nodes, size, totalHeight])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          {(['work', 'personal', 'financial'] as Domain[]).map((d) => (
            <div key={d} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: DOMAIN_COLORS[d] }} />
              <span className="text-[7px] text-[#606080] capitalize" style={{ fontFamily: 'var(--font-mono)' }}>
                {d}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {nodes.length} nodes · size = opportunity
        </span>
      </div>
    </div>
  )
}
