import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  scores?: { domain: string; exhaustion: number; cynicism: number; inefficacy: number }[]
}

const DEFAULT_SCORES = [
  { domain: 'Work', exhaustion: 70, cynicism: 45, inefficacy: 30 },
  { domain: 'Health', exhaustion: 35, cynicism: 20, inefficacy: 25 },
  { domain: 'Social', exhaustion: 50, cynicism: 55, inefficacy: 40 },
  { domain: 'Learning', exhaustion: 25, cynicism: 15, inefficacy: 60 },
  { domain: 'Wealth', exhaustion: 40, cynicism: 35, inefficacy: 20 },
  { domain: 'Family', exhaustion: 30, cynicism: 25, inefficacy: 15 },
]

export function BurnoutRadar({ scores = DEFAULT_SCORES }: Props) {
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
    ctx.fillText('BURNOUT RADAR', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 125
    const maxR = Math.min(width * 0.3, 72)
    const n = scores.length

    // Grid rings
    for (let ring = 0.25; ring <= 1; ring += 0.25) {
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * maxR * ring
        const y = cy + Math.sin(angle) * maxR * ring
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Danger zone (>70%)
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * maxR
      const y = cy + Math.sin(angle) * maxR
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    for (let i = n; i >= 0; i--) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * maxR * 0.7
      const y = cy + Math.sin(angle) * maxR * 0.7
      ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = '#ef444410'
    ctx.fill()

    // Axis lines + labels
    scores.forEach((s, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR)
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.stroke()

      const lx = cx + Math.cos(angle) * (maxR + 14)
      const ly = cy + Math.sin(angle) * (maxR + 14)
      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(s.domain, lx, ly + 3)
    })

    // Three MBI dimensions as separate polygons
    const dims = [
      { key: 'exhaustion' as const, color: '#ef4444', label: 'Exhaustion' },
      { key: 'cynicism' as const, color: '#eab308', label: 'Cynicism' },
      { key: 'inefficacy' as const, color: '#8b5cf6', label: 'Inefficacy' },
    ]

    dims.forEach(dim => {
      ctx.beginPath()
      scores.forEach((s, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const r = (s[dim.key] / 100) * maxR
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = `${dim.color}10`
      ctx.fill()
      ctx.strokeStyle = dim.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Legend
    const legendY = cy + maxR + 28
    dims.forEach((dim, i) => {
      const lx = width / 2 - 60 + i * 50
      ctx.fillStyle = dim.color
      ctx.fillRect(lx, legendY - 3, 6, 6)
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'left'
      ctx.fillText(dim.label, lx + 10, legendY + 2)
    })

  }, [width, scores])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
