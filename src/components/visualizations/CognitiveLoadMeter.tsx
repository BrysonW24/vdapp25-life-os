import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface LoadSource {
  label: string
  load: number // 0-100
  color: string
}

interface Props {
  sources?: LoadSource[]
  capacity?: number // 0-100
}

const DEFAULT_SOURCES: LoadSource[] = [
  { label: 'Active Projects', load: 35, color: '#3b82f6' },
  { label: 'Decisions Pending', load: 20, color: '#8b5cf6' },
  { label: 'Learning New', load: 15, color: '#22c55e' },
  { label: 'Social Obligations', load: 12, color: '#FF6B35' },
  { label: 'Background Worry', load: 18, color: '#ef4444' },
]

export function CognitiveLoadMeter({ sources = DEFAULT_SOURCES, capacity = 80 }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 200

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
    ctx.fillText('COGNITIVE LOAD', width / 2, 14)
    ctx.letterSpacing = '0px'

    const totalLoad = sources.reduce((s, src) => s + src.load, 0)
    const cx = width / 2
    const cy = 110
    const outerR = Math.min(width * 0.3, 65)
    const innerR = outerR * 0.7
    const arcStart = Math.PI * 0.75
    const arcEnd = Math.PI * 2.25
    const arcRange = arcEnd - arcStart

    // Background arc
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, arcStart, arcEnd)
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    // Stacked load segments
    let angle = arcStart
    sources.forEach(src => {
      const sweep = (src.load / 100) * arcRange
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, angle, angle + sweep)
      ctx.strokeStyle = src.color
      ctx.lineWidth = 12
      ctx.lineCap = 'butt'
      ctx.stroke()
      angle += sweep
    })

    // Capacity marker
    const capAngle = arcStart + (capacity / 100) * arcRange
    const markerR = outerR + 10
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(capAngle) * (outerR + 2), cy + Math.sin(capAngle) * (outerR + 2))
    ctx.lineTo(cx + Math.cos(capAngle) * markerR, cy + Math.sin(capAngle) * markerR)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#ef4444'
    ctx.textAlign = 'center'
    ctx.fillText('CAP', cx + Math.cos(capAngle) * (markerR + 8), cy + Math.sin(capAngle) * (markerR + 8) + 2)

    // Center text
    const loadColor = totalLoad > capacity ? '#ef4444' : totalLoad > capacity * 0.8 ? '#eab308' : '#22c55e'
    ctx.font = `700 ${chartFontSize(18, width)}px 'Inter', sans-serif`
    ctx.fillStyle = loadColor
    ctx.textAlign = 'center'
    ctx.fillText(`${totalLoad}%`, cx, cy + 4)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('UTILIZATION', cx, cy + 14)

    // Legend
    const legendY = cy + outerR + 28
    const cols = Math.min(sources.length, 3)
    const colW = (width - 24) / cols
    sources.forEach((src, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const lx = 12 + col * colW
      const ly = legendY + row * 12

      ctx.fillStyle = src.color
      ctx.fillRect(lx, ly - 3, 6, 6)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'left'
      ctx.fillText(`${src.label} (${src.load}%)`, lx + 10, ly + 2)
    })

  }, [width, sources, capacity])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
