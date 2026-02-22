import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface PressureSource {
  label: string
  pressure: number // 0-100
  color: string
}

interface Props {
  sources?: PressureSource[]
  threshold?: number
}

const DEFAULT_SOURCES: PressureSource[] = [
  { label: 'Work Hours', pressure: 72, color: '#3b82f6' },
  { label: 'Sleep Debt', pressure: 45, color: '#8b5cf6' },
  { label: 'Decision Load', pressure: 58, color: '#FF6B35' },
  { label: 'Social Drain', pressure: 30, color: '#22c55e' },
  { label: 'Financial Stress', pressure: 25, color: '#eab308' },
]

export function BurnoutPressureSystem({ sources = DEFAULT_SOURCES, threshold = 65 }: Props) {
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
    ctx.fillText('BURNOUT PRESSURE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 115
    const maxR = Math.min(width * 0.32, 75)

    // Pressure vessel (outer circle)
    ctx.beginPath()
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 2
    ctx.stroke()

    // Threshold ring
    const threshR = maxR * (threshold / 100)
    ctx.beginPath()
    ctx.arc(cx, cy, threshR, 0, Math.PI * 2)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Pressure sources as expanding rings from center
    const totalPressure = sources.reduce((s, p) => s + p.pressure, 0) / sources.length
    let currentR = 0

    sources.forEach(src => {
      const ringWidth = (src.pressure / 100) * (maxR / sources.length)
      const innerR = currentR
      const outerRing = currentR + ringWidth

      ctx.beginPath()
      ctx.arc(cx, cy, outerRing, 0, Math.PI * 2)
      if (innerR > 0) ctx.arc(cx, cy, innerR, Math.PI * 2, 0, true)
      ctx.closePath()
      ctx.fillStyle = `${src.color}20`
      ctx.fill()
      ctx.strokeStyle = `${src.color}40`
      ctx.lineWidth = 0.5
      ctx.stroke()

      currentR = outerRing
    })

    // Pressure cracks if above threshold
    if (totalPressure > threshold) {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + 0.3
        const startR = maxR * 0.7
        const endR = maxR * 1.05
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR)
        ctx.lineTo(cx + Math.cos(angle + 0.05) * endR, cy + Math.sin(angle + 0.05) * endR)
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    // Center pressure reading
    const pressColor = totalPressure > threshold ? '#ef4444' : totalPressure > threshold * 0.7 ? '#eab308' : '#22c55e'
    ctx.beginPath()
    ctx.arc(cx, cy, 20, 0, Math.PI * 2)
    ctx.fillStyle = CHART_COLORS.surface
    ctx.fill()

    ctx.font = `700 ${chartFontSize(14, width)}px 'Inter', sans-serif`
    ctx.fillStyle = pressColor
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(totalPressure)}`, cx, cy + 4)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('PSI', cx, cy + 12)

    // Legend
    const legendY = cy + maxR + 16
    sources.forEach((src, i) => {
      const lx = 12 + (i % 3) * ((width - 24) / 3)
      const ly = legendY + Math.floor(i / 3) * 12
      ctx.fillStyle = src.color
      ctx.fillRect(lx, ly - 3, 6, 6)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'left'
      ctx.fillText(`${src.label} ${src.pressure}`, lx + 10, ly + 2)
    })

  }, [width, sources, threshold])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
