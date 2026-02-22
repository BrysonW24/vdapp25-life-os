import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * One Lever Analysis — identifies the single highest-leverage change
 * this week. Shows each domain's impact coefficient and highlights
 * the dominant lever. "If you improve X by 10%, total life score
 * increases Y%."
 */

interface Lever {
  domain: string
  color: string
  impactCoefficient: number // how much 10% improvement affects total score
  currentScore: number      // 0-100
}

interface Props {
  levers?: Lever[]
}

const DEFAULT_LEVERS: Lever[] = [
  { domain: 'Sleep',      color: '#8b5cf6', impactCoefficient: 6.2, currentScore: 58 },
  { domain: 'Exercise',   color: '#22c55e', impactCoefficient: 4.8, currentScore: 72 },
  { domain: 'Deep Work',  color: '#3b82f6', impactCoefficient: 5.1, currentScore: 65 },
  { domain: 'Social',     color: '#06b6d4', impactCoefficient: 2.3, currentScore: 45 },
  { domain: 'Learning',   color: '#eab308', impactCoefficient: 3.4, currentScore: 40 },
  { domain: 'Finance',    color: '#FF6B35', impactCoefficient: 2.8, currentScore: 70 },
]

export function OneLeverAnalysis({ levers = DEFAULT_LEVERS }: Props) {
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

    // Sort by impact
    const sorted = [...levers].sort((a, b) => b.impactCoefficient - a.impactCoefficient)
    const topLever = sorted[0]
    const maxImpact = topLever.impactCoefficient

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('ONE LEVER ANALYSIS', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Lever bars
    const barStartY = 30
    const barHeight = 18
    const barGap = 6
    const labelW = 64
    const valueW = 50
    const barMaxW = width - labelW - valueW - 24

    sorted.forEach((lever, i) => {
      const y = barStartY + i * (barHeight + barGap)
      const barW = (lever.impactCoefficient / maxImpact) * barMaxW
      const isTop = i === 0

      // Label
      ctx.font = `${isTop ? 700 : 500} ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = lever.color
      ctx.textAlign = 'right'
      ctx.globalAlpha = isTop ? 1 : 0.6
      ctx.fillText(lever.domain, labelW, y + barHeight / 2 + 3)

      // Bar
      ctx.fillStyle = lever.color
      ctx.globalAlpha = isTop ? 0.4 : 0.15
      ctx.beginPath()
      const bx = labelW + 8
      ctx.roundRect(bx, y, barW, barHeight, 3)
      ctx.fill()

      // Bar border for top lever
      if (isTop) {
        ctx.strokeStyle = lever.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.roundRect(bx, y, barW, barHeight, 3)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Impact value
      ctx.font = `${isTop ? 700 : 500} ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = lever.color
      ctx.textAlign = 'left'
      ctx.globalAlpha = isTop ? 1 : 0.5
      ctx.fillText(`+${lever.impactCoefficient.toFixed(1)}%`, bx + barW + 6, y + barHeight / 2 + 3)
      ctx.globalAlpha = 1

      // Current score (small)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`${lever.currentScore}`, labelW - ctx.measureText(lever.domain).width - 8, y + barHeight / 2 + 3)
    })

    // Dominant lever callout
    const calloutY = barStartY + sorted.length * (barHeight + barGap) + 12

    ctx.fillStyle = `${topLever.color}10`
    ctx.beginPath()
    ctx.roundRect(12, calloutY, width - 24, 36, 6)
    ctx.fill()

    ctx.strokeStyle = `${topLever.color}30`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(12, calloutY, width - 24, 36, 6)
    ctx.stroke()

    ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = topLever.color
    ctx.textAlign = 'center'
    ctx.fillText('THIS WEEK\'S LEVER', width / 2, calloutY + 14)

    ctx.font = `400 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textSecondary
    ctx.fillText(
      `Improve ${topLever.domain} by 10% → total score +${topLever.impactCoefficient.toFixed(1)}%`,
      width / 2,
      calloutY + 28
    )

  }, [width, levers])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
