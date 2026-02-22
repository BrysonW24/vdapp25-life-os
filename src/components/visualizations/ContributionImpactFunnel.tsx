import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Contribution Impact Funnel
 * Flow diagram: Time → Skill → Output → People Helped → Multiplier
 * Shows leverage per hour of investment.
 * Each stage narrows to show conversion efficiency.
 */

interface FunnelStage {
  label: string
  sublabel: string
  value: number    // 0-100 (relative width of funnel stage)
  unit: string
  color: string
}

const STAGES: FunnelStage[] = [
  { label: 'TIME', sublabel: '42 hrs / week', value: 100, unit: 'hrs', color: '#3b82f6' },
  { label: 'SKILL', sublabel: 'AI Systems · Consulting', value: 72, unit: '%', color: '#8b5cf6' },
  { label: 'OUTPUT', sublabel: '12 deliverables / mo', value: 54, unit: 'artifacts', color: '#FF6B35' },
  { label: 'IMPACT', sublabel: '~200 people influenced', value: 38, unit: 'people', color: '#22c55e' },
  { label: 'MULTIPLIER', sublabel: '4.7× leverage', value: 22, unit: '×', color: '#eab308' },
]

export function ContributionImpactFunnel() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 300

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
    ctx.clearRect(0, 0, width, height)

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('CONTRIBUTION IMPACT FUNNEL', width / 2, 14)
    ctx.letterSpacing = '0px'

    const mt = 26
    const mb = 16
    const ml = 8
    const mr = 8
    const maxW = width - ml - mr
    const stageH = (height - mt - mb) / STAGES.length
    const gap = 4

    STAGES.forEach((stage, i) => {
      const stageW = (stage.value / 100) * maxW
      const x = ml + (maxW - stageW) / 2
      const y = mt + i * stageH + gap / 2
      const h = stageH - gap

      // Trapezoid shape: top wider than next stage's width
      const nextStage = STAGES[i + 1]
      const nextW = nextStage ? (nextStage.value / 100) * maxW : stageW * 0.6
      const topX = ml + (maxW - stageW) / 2
      const botX = ml + (maxW - nextW) / 2

      // Fill gradient
      const grad = ctx.createLinearGradient(x, y, x + stageW, y)
      grad.addColorStop(0, `${stage.color}18`)
      grad.addColorStop(0.5, `${stage.color}35`)
      grad.addColorStop(1, `${stage.color}18`)

      ctx.beginPath()
      ctx.moveTo(topX, y)
      ctx.lineTo(topX + stageW, y)
      ctx.lineTo(botX + nextW, y + h)
      ctx.lineTo(botX, y + h)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Border
      ctx.strokeStyle = `${stage.color}50`
      ctx.lineWidth = 1
      ctx.stroke()

      // Left connector line
      if (i > 0) {
        const prevStage = STAGES[i - 1]
        const prevNextW = (prevStage.value / 100) * maxW
        const prevBotX = ml + (maxW - prevNextW) / 2
        ctx.beginPath()
        ctx.moveTo(prevBotX, y - gap / 2)
        ctx.lineTo(topX, y)
        ctx.strokeStyle = `${stage.color}20`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(prevBotX + prevNextW, y - gap / 2)
        ctx.lineTo(topX + stageW, y)
        ctx.stroke()
      }

      // Stage label (left)
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = stage.color
      ctx.textAlign = 'left'
      ctx.fillText(stage.label, ml + 4, y + h / 2 + (width >= 320 ? -4 : 3))

      // Sublabel (center) — only if wide enough
      if (width >= 320) {
        ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textSecondary
        ctx.textAlign = 'center'
        ctx.fillText(stage.sublabel, width / 2, y + h / 2 + 7)
      }

      // Width % (right)
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = stage.color
      ctx.textAlign = 'right'
      ctx.fillText(`${stage.value}%`, width - mr - 4, y + h / 2 + (width >= 320 ? -4 : 3))

      // Flow arrow at bottom of stage (except last)
      if (i < STAGES.length - 1) {
        const arrowX = width / 2
        const arrowY = y + h + gap / 2 - 1
        ctx.beginPath()
        ctx.moveTo(arrowX - 4, arrowY - 3)
        ctx.lineTo(arrowX, arrowY + 2)
        ctx.lineTo(arrowX + 4, arrowY - 3)
        ctx.strokeStyle = CHART_COLORS.border
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Leverage callout at bottom
    ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.drifting
    ctx.textAlign = 'center'
    ctx.fillText('LEVERAGE · TIME SPENT → LIFE CHANGED', width / 2, height - 4)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
