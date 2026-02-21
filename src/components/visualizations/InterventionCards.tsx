import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface DomainDelta {
  domain: string
  delta: number // -100 to 100
}

interface Intervention {
  name: string
  duration: string
  deltas: DomainDelta[]
}

interface Props {
  interventions?: Intervention[]
}

const DEFAULT_INTERVENTIONS: Intervention[] = [
  { name: 'No alcohol 14 days', duration: '14d', deltas: [
    { domain: 'Sleep', delta: 18 }, { domain: 'Mood', delta: 12 }, { domain: 'Focus', delta: 15 },
    { domain: 'Energy', delta: 22 }, { domain: 'Spend', delta: -8 },
  ]},
  { name: 'Morning sunlight', duration: '21d', deltas: [
    { domain: 'Sleep', delta: 10 }, { domain: 'Mood', delta: 20 }, { domain: 'Focus', delta: 8 },
    { domain: 'Energy', delta: 15 }, { domain: 'Stress', delta: -12 },
  ]},
  { name: 'No meetings Wed', duration: '30d', deltas: [
    { domain: 'Deep Work', delta: 35 }, { domain: 'Focus', delta: 25 }, { domain: 'Mood', delta: 8 },
    { domain: 'Energy', delta: 10 }, { domain: 'Social', delta: -5 },
  ]},
]

export function InterventionCards({ interventions = DEFAULT_INTERVENTIONS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardH = 72
  const height = 28 + interventions.length * (cardH + 8)

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
    ctx.fillText('INTERVENTION RESULTS', width / 2, 14)
    ctx.letterSpacing = '0px'

    interventions.forEach((intv, ci) => {
      const y = 28 + ci * (cardH + 8)

      // Card bg
      ctx.fillStyle = CHART_COLORS.surfaceLight
      ctx.beginPath()
      ctx.roundRect(8, y, width - 16, cardH, 6)
      ctx.fill()
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(8, y, width - 16, cardH, 6)
      ctx.stroke()

      // Name + duration
      ctx.font = `600 8px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(intv.name, 16, y + 16)

      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(intv.duration, width - 16, y + 16)

      // Delta bars
      const barStartY = y + 26
      const barH = 8
      const barGap = 2
      const barAreaW = width - 120
      const maxDelta = Math.max(...intv.deltas.map(d => Math.abs(d.delta)), 1)
      const centerX = 80 + barAreaW / 2

      intv.deltas.forEach((d, di) => {
        const by = barStartY + di * (barH + barGap)
        const barW = (Math.abs(d.delta) / maxDelta) * (barAreaW / 2)
        const isPositive = d.delta >= 0

        // Label
        ctx.font = `400 6px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textDim
        ctx.textAlign = 'right'
        ctx.fillText(d.domain, 74, by + barH / 2 + 2)

        // Bar
        const bx = isPositive ? centerX : centerX - barW
        ctx.fillStyle = isPositive ? '#22c55e25' : '#ef444425'
        ctx.beginPath()
        ctx.roundRect(bx, by, barW, barH, 2)
        ctx.fill()

        // Value
        ctx.font = `600 6px 'JetBrains Mono', monospace`
        ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444'
        ctx.textAlign = isPositive ? 'left' : 'right'
        const vx = isPositive ? centerX + barW + 3 : centerX - barW - 3
        ctx.fillText(`${isPositive ? '+' : ''}${d.delta}%`, vx, by + barH / 2 + 2)
      })

      // Center line
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(centerX, barStartY)
      ctx.lineTo(centerX, barStartY + intv.deltas.length * (barH + barGap))
      ctx.stroke()
    })

  }, [width, interventions, height])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
