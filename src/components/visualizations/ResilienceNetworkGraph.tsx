import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface PersonNode {
  name: string
  tier: 'inner' | 'active' | 'weak'
  importance: number // 0-1
}

interface Edge {
  from: number
  to: number
  strength: number // 0-1
}

interface Props {
  people?: PersonNode[]
  edges?: Edge[]
}

const DEFAULT_PEOPLE: PersonNode[] = [
  { name: 'Partner', tier: 'inner', importance: 1.0 },
  { name: 'Best Friend', tier: 'inner', importance: 0.9 },
  { name: 'Mum', tier: 'inner', importance: 0.85 },
  { name: 'Mentor', tier: 'active', importance: 0.7 },
  { name: 'Colleague', tier: 'active', importance: 0.5 },
  { name: 'Gym Buddy', tier: 'active', importance: 0.4 },
  { name: 'Old Friend', tier: 'weak', importance: 0.3 },
  { name: 'Neighbour', tier: 'weak', importance: 0.2 },
]

const DEFAULT_EDGES: Edge[] = [
  { from: 0, to: 1, strength: 0.3 },
  { from: 0, to: 2, strength: 0.7 },
  { from: 1, to: 3, strength: 0.4 },
  { from: 2, to: 6, strength: 0.2 },
  { from: 3, to: 4, strength: 0.5 },
  { from: 4, to: 5, strength: 0.3 },
  { from: 5, to: 7, strength: 0.2 },
]

export function ResilienceNetworkGraph({ people = DEFAULT_PEOPLE, edges = DEFAULT_EDGES }: Props) {
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
    ctx.fillText('RESILIENCE NETWORK', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 135
    const tierColors = { inner: '#22c55e', active: '#3b82f6', weak: '#eab308' }

    // Position nodes in concentric circles by tier
    const tiers = { inner: [] as number[], active: [] as number[], weak: [] as number[] }
    people.forEach((p, i) => tiers[p.tier].push(i))

    const positions: { x: number; y: number }[] = new Array(people.length)
    const tierRadii = { inner: 35, active: 65, weak: 95 }

    Object.entries(tiers).forEach(([tier, indices]) => {
      const r = tierRadii[tier as keyof typeof tierRadii]
      indices.forEach((idx, i) => {
        const angle = (i / indices.length) * Math.PI * 2 - Math.PI / 2
        positions[idx] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
      })
    })

    // Draw edges
    edges.forEach(e => {
      const from = positions[e.from]
      const to = positions[e.to]
      if (!from || !to) return
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = CHART_COLORS.textDim
      ctx.lineWidth = 0.5 + e.strength * 2
      ctx.globalAlpha = 0.1 + e.strength * 0.2
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Draw nodes
    people.forEach((p, i) => {
      const pos = positions[i]
      if (!pos) return
      const nodeR = 8 + p.importance * 10
      const color = tierColors[p.tier]

      // Check if single-point-of-failure
      const connections = edges.filter(e => e.from === i || e.to === i).length
      const isSPOF = connections <= 1 && p.importance > 0.6

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2)
      ctx.fillStyle = `${color}20`
      ctx.fill()
      ctx.strokeStyle = isSPOF ? '#ef4444' : color
      ctx.lineWidth = isSPOF ? 2 : 1
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      if (isSPOF) {
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeR + 4, 0, Math.PI * 2)
        ctx.strokeStyle = '#ef444440'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.font = `500 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.fillText(p.name, pos.x, pos.y + nodeR + 10)
    })

    // Center "You"
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.brand
    ctx.fill()
    ctx.font = `600 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.textAlign = 'center'
    ctx.fillText('YOU', cx, cy + 14)

  }, [width, people, edges])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        {[{ label: 'Inner circle', color: '#22c55e' }, { label: 'Active', color: '#3b82f6' }, { label: 'Weak', color: '#eab308' }, { label: 'SPOF risk', color: '#ef4444' }].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[6px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
