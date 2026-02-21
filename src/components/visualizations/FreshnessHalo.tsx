import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Domain {
  label: string
  freshness: number // 0-100
  color: string
}

interface Props {
  domains?: Domain[]
}

const DEFAULT_DOMAINS: Domain[] = [
  { label: 'Health', freshness: 92, color: '#22c55e' },
  { label: 'Mental', freshness: 75, color: '#8b5cf6' },
  { label: 'Work', freshness: 60, color: '#3b82f6' },
  { label: 'Wealth', freshness: 85, color: '#eab308' },
  { label: 'Social', freshness: 40, color: '#FF6B35' },
  { label: 'Learning', freshness: 55, color: '#ef4444' },
]

export function FreshnessHalo({ domains = DEFAULT_DOMAINS }: Props) {
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
    ctx.fillText('FRESHNESS HALO', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 118
    const maxR = Math.min(width * 0.32, 75)
    const n = domains.length

    // Outer reference ring
    ctx.beginPath()
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 1
    ctx.stroke()

    // Domain arcs
    domains.forEach((domain, i) => {
      const startAngle = (i / n) * Math.PI * 2 - Math.PI / 2
      const endAngle = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
      const gap = 0.04

      // Freshness arc
      const r = maxR * (0.4 + (domain.freshness / 100) * 0.6)
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle + gap, endAngle - gap)
      ctx.arc(cx, cy, r - 8, endAngle - gap, startAngle + gap, true)
      ctx.closePath()

      // Glow based on freshness
      const alpha = domain.freshness >= 70 ? '40' : domain.freshness >= 40 ? '25' : '15'
      ctx.fillStyle = `${domain.color}${alpha}`
      ctx.fill()
      ctx.strokeStyle = domain.color
      ctx.lineWidth = 1
      ctx.globalAlpha = domain.freshness / 100
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label
      const midAngle = (startAngle + endAngle) / 2
      const labelR = maxR + 14
      const lx = cx + Math.cos(midAngle) * labelR
      const ly = cy + Math.sin(midAngle) * labelR
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = domain.color
      ctx.textAlign = 'center'
      ctx.fillText(domain.label, lx, ly + 2)
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${domain.freshness}%`, lx, ly + 10)
    })

    // Center
    const avg = Math.round(domains.reduce((s, d) => s + d.freshness, 0) / domains.length)
    const avgColor = avg >= 70 ? '#22c55e' : avg >= 40 ? '#eab308' : '#ef4444'
    ctx.beginPath()
    ctx.arc(cx, cy, 20, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.surface
    ctx.fill()
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = `700 14px 'Inter', sans-serif`
    ctx.fillStyle = avgColor
    ctx.textAlign = 'center'
    ctx.fillText(`${avg}`, cx, cy + 4)
    ctx.font = `400 5px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('FRESH', cx, cy + 12)

  }, [width, domains])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
