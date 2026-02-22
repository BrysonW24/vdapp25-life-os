import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  temperature?: number // 0-100
  zones?: { label: string; min: number; max: number; color: string }[]
}

const DEFAULT_ZONES = [
  { label: 'THRIVING', min: 0, max: 25, color: '#22c55e' },
  { label: 'MANAGING', min: 25, max: 50, color: '#3b82f6' },
  { label: 'STRAINED', min: 50, max: 75, color: '#eab308' },
  { label: 'CRITICAL', min: 75, max: 100, color: '#ef4444' },
]

export function BurnoutThermometer({ temperature = 58, zones = DEFAULT_ZONES }: Props) {
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
    ctx.fillText('BURNOUT THERMOMETER', width / 2, 14)
    ctx.letterSpacing = '0px'

    const barX = width / 2 - 16
    const barW = 32
    const barTop = 36
    const barH = 130
    const bulbR = 22
    const bulbCY = barTop + barH + bulbR - 6

    // Zone backgrounds
    zones.forEach(zone => {
      const y1 = barTop + barH - (zone.max / 100) * barH
      const y2 = barTop + barH - (zone.min / 100) * barH
      ctx.fillStyle = `${zone.color}12`
      ctx.fillRect(barX, y1, barW, y2 - y1)

      // Zone label
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = zone.color
      ctx.globalAlpha = 0.5
      ctx.textAlign = 'left'
      ctx.fillText(zone.label, barX + barW + 8, (y1 + y2) / 2 + 2)
      ctx.globalAlpha = 1

      // Tick
      ctx.textAlign = 'right'
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${zone.max}`, barX - 6, y1 + 3)
    })

    // Thermometer outline
    ctx.beginPath()
    ctx.roundRect(barX, barTop, barW, barH, [8, 8, 0, 0])
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Bulb
    ctx.beginPath()
    ctx.arc(barX + barW / 2, bulbCY, bulbR, 0, Math.PI * 2)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Mercury fill
    const mercuryH = (temperature / 100) * barH
    const mercuryY = barTop + barH - mercuryH
    const currentZone = zones.find(z => temperature >= z.min && temperature <= z.max) ?? zones[zones.length - 1]
    const mercuryColor = currentZone.color

    ctx.fillStyle = `${mercuryColor}40`
    ctx.fillRect(barX + 4, mercuryY, barW - 8, mercuryH)

    // Bulb fill
    ctx.beginPath()
    ctx.arc(barX + barW / 2, bulbCY, bulbR - 4, 0, Math.PI * 2)
    ctx.fillStyle = `${mercuryColor}60`
    ctx.fill()

    // Temperature reading
    ctx.font = `700 ${chartFontSize(16, width)}px 'Inter', sans-serif`
    ctx.fillStyle = mercuryColor
    ctx.textAlign = 'center'
    ctx.fillText(`${temperature}°`, barX + barW / 2, bulbCY + 5)

  }, [width, temperature, zones])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
