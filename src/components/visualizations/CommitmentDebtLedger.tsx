import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Commitment {
  label: string
  domain: string
  promisedFreq: string  // e.g., "3x/week"
  actualFreq: string    // e.g., "1x/week"
  debtScore: number     // 0-100 (100 = maximum debt)
  weeksMissing: number
  color: string
}

interface Props {
  commitments?: Commitment[]
}

const DEFAULT_COMMITMENTS: Commitment[] = [
  { label: 'Gym sessions', domain: 'Health', promisedFreq: '4x/wk', actualFreq: '2x/wk', debtScore: 50, weeksMissing: 6, color: '#22c55e' },
  { label: 'Chinese study', domain: 'Learning', promisedFreq: 'Daily', actualFreq: '0x/wk', debtScore: 95, weeksMissing: 12, color: '#3b82f6' },
  { label: 'Journal', domain: 'Mental', promisedFreq: 'Daily', actualFreq: '2x/wk', debtScore: 70, weeksMissing: 8, color: '#8b5cf6' },
  { label: 'Call parents', domain: 'Family', promisedFreq: '1x/wk', actualFreq: '2x/mo', debtScore: 40, weeksMissing: 4, color: '#FF6B35' },
  { label: 'Save 20%', domain: 'Wealth', promisedFreq: 'Monthly', actualFreq: '8% actual', debtScore: 60, weeksMissing: 3, color: '#eab308' },
]

export function CommitmentDebtLedger({ commitments = DEFAULT_COMMITMENTS }: Props) {
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
    ctx.fillText('COMMITMENT DEBT', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28
    const cardW = width - ml - mr
    const cardH = 32
    const gap = 4

    const sorted = [...commitments].sort((a, b) => b.debtScore - a.debtScore)

    sorted.forEach((c, i) => {
      const y = mt + i * (cardH + gap)
      const debtColor = c.debtScore >= 70 ? '#ef4444' : c.debtScore >= 40 ? '#eab308' : '#22c55e'

      // Card
      ctx.beginPath()
      ctx.roundRect(ml, y, cardW, cardH, 6)
      ctx.fillStyle = `${debtColor}06`
      ctx.fill()
      ctx.strokeStyle = `${debtColor}20`
      ctx.lineWidth = 1
      ctx.stroke()

      // Debt bar background
      const barW = (c.debtScore / 100) * cardW
      ctx.fillStyle = `${debtColor}10`
      ctx.fillRect(ml + 1, y + 1, barW, cardH - 2)

      // Label + domain
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = c.color
      ctx.textAlign = 'left'
      ctx.fillText(c.label, ml + 8, y + 12)

      // Promised vs actual
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${c.promisedFreq} → ${c.actualFreq}`, ml + 8, y + 24)

      // Debt score + weeks
      ctx.font = `700 ${chartFontSize(8, width)}px 'Inter', sans-serif`
      ctx.fillStyle = debtColor
      ctx.textAlign = 'right'
      ctx.fillText(`${c.debtScore}`, ml + cardW - 8, y + 14)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${c.weeksMissing}w`, ml + cardW - 8, y + 24)
    })

    // Total debt
    const totalDebt = Math.round(sorted.reduce((s, c) => s + c.debtScore, 0) / sorted.length)
    const totalColor = totalDebt >= 60 ? '#ef4444' : totalDebt >= 35 ? '#eab308' : '#22c55e'
    ctx.font = `700 ${chartFontSize(10, width)}px 'Inter', sans-serif`
    ctx.fillStyle = totalColor
    ctx.textAlign = 'right'
    ctx.fillText(`${totalDebt}`, width - 12, 24)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('AVG DEBT', width - 12, 32)

  }, [width, commitments])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
