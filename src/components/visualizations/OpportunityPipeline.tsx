import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Opportunity {
  label: string
  domain: string
  stage: 'identified' | 'evaluating' | 'acting' | 'captured'
  potential: number // 0-100
  urgency: number   // 0-100
  color: string
}

interface Props {
  opportunities?: Opportunity[]
}

const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  { label: 'Start newsletter', domain: 'Work', stage: 'evaluating', potential: 75, urgency: 40, color: '#3b82f6' },
  { label: 'Invest in ETFs', domain: 'Wealth', stage: 'acting', potential: 65, urgency: 60, color: '#eab308' },
  { label: 'Learn Mandarin', domain: 'Learning', stage: 'identified', potential: 80, urgency: 30, color: '#22c55e' },
  { label: 'Hire VA', domain: 'Work', stage: 'evaluating', potential: 70, urgency: 75, color: '#3b82f6' },
  { label: 'Join golf club', domain: 'Health', stage: 'acting', potential: 55, urgency: 50, color: '#8b5cf6' },
  { label: 'Side project MVP', domain: 'Work', stage: 'identified', potential: 90, urgency: 85, color: '#FF6B35' },
]

const STAGES = ['identified', 'evaluating', 'acting', 'captured'] as const
const STAGE_COLORS = { identified: '#606080', evaluating: '#eab308', acting: '#3b82f6', captured: '#22c55e' }

export function OpportunityPipeline({ opportunities = DEFAULT_OPPORTUNITIES }: Props) {
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
    ctx.fillText('OPPORTUNITY PIPELINE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 36, mb = 8
    const chartW = width - ml - mr
    const cols = STAGES.length
    const colW = chartW / cols
    const colGap = 4

    // Stage headers
    STAGES.forEach((stage, i) => {
      const x = ml + i * colW
      const count = opportunities.filter(o => o.stage === stage).length

      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = STAGE_COLORS[stage]
      ctx.textAlign = 'center'
      ctx.fillText(stage.toUpperCase(), x + colW / 2, mt - 8)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`(${count})`, x + colW / 2, mt - 1)

      // Column divider
      if (i < cols - 1) {
        ctx.beginPath()
        ctx.moveTo(x + colW, mt + 4)
        ctx.lineTo(x + colW, height - mb)
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }
    })

    // Pipeline funnel shape (background)
    const funnelTop = mt + 6
    const funnelH = height - mt - mb - 6
    STAGES.forEach((_, i) => {
      const x = ml + i * colW + colGap
      const w = colW - colGap * 2
      const shrink = i * 0.06
      const adjustedW = w * (1 - shrink)
      const offsetX = (w - adjustedW) / 2

      ctx.fillStyle = `${CHART_COLORS.gridLine}40`
      ctx.fillRect(x + offsetX, funnelTop, adjustedW, funnelH)
    })

    // Plot opportunities as cards within their stage columns
    const stageOffsets: Record<string, number> = {}
    STAGES.forEach(s => { stageOffsets[s] = 0 })

    // Sort by potential within each stage
    const sorted = [...opportunities].sort((a, b) => b.potential - a.potential)

    sorted.forEach(opp => {
      const stageIdx = STAGES.indexOf(opp.stage)
      const x = ml + stageIdx * colW + colGap + 2
      const w = colW - colGap * 2 - 4
      const cardH = 24
      const y = funnelTop + 4 + stageOffsets[opp.stage] * (cardH + 4)
      stageOffsets[opp.stage]++

      // Card
      ctx.beginPath()
      ctx.roundRect(x, y, w, cardH, 4)
      ctx.fillStyle = `${opp.color}15`
      ctx.fill()
      ctx.strokeStyle = `${opp.color}30`
      ctx.lineWidth = 1
      ctx.stroke()

      // Urgency indicator (left edge)
      if (opp.urgency > 70) {
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(x + 1, y + 1, 2, cardH - 2)
      }

      // Label
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = opp.color
      ctx.textAlign = 'left'
      const maxChars = Math.floor(w / 4)
      const displayLabel = opp.label.length > maxChars ? opp.label.slice(0, maxChars - 1) + '…' : opp.label
      ctx.fillText(displayLabel, x + 6, y + 10)

      // Potential
      ctx.font = `500 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${opp.potential}p`, x + 6, y + 19)
    })

  }, [width, opportunities])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
