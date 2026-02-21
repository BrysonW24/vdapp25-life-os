import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface CardData {
  belief: string
  evidence: string
  confidence: number // 0-100 how confident the contradiction is real
  color: string
}

interface Props {
  cards?: CardData[]
}

const DEFAULT_CARDS: CardData[] = [
  { belief: 'I work efficiently', evidence: '3.2h deep work / 10h total', confidence: 82, color: '#ef4444' },
  { belief: 'Good at saving', evidence: 'Savings rate: 8% (target 20%)', confidence: 70, color: '#eab308' },
  { belief: 'Balanced lifestyle', evidence: 'Work: 65% of waking hours', confidence: 88, color: '#ef4444' },
  { belief: 'Strong relationships', evidence: 'Avg 2 social hours/wk', confidence: 55, color: '#eab308' },
]

export function ContradictionCards({ cards = DEFAULT_CARDS }: Props) {
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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('BELIEF vs EVIDENCE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28
    const cardW = width - ml - mr
    const cardH = 36
    const gap = 6

    cards.forEach((card, i) => {
      const y = mt + i * (cardH + gap)

      // Card bg
      ctx.beginPath()
      ctx.roundRect(ml, y, cardW, cardH, 6)
      ctx.fillStyle = `${card.color}06`
      ctx.fill()
      ctx.strokeStyle = `${card.color}20`
      ctx.lineWidth = 1
      ctx.stroke()

      // Confidence bar at left edge
      const barH = (card.confidence / 100) * cardH
      ctx.fillStyle = `${card.color}30`
      ctx.fillRect(ml + 1, y + cardH - barH, 3, barH)

      // Belief
      ctx.font = `500 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(`"${card.belief}"`, ml + 12, y + 13)

      // Evidence
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = card.color
      ctx.fillText(`↳ ${card.evidence}`, ml + 12, y + 26)

      // Confidence badge
      ctx.font = `500 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = card.color
      ctx.textAlign = 'right'
      ctx.fillText(`${card.confidence}%`, ml + cardW - 8, y + 20)
    })

  }, [width, cards])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
