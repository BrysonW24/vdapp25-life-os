import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Assumption Tracker — Hypothesis Board
 * Tracks beliefs, evidence for, evidence against, and confidence level.
 * Prevents self-delusion. The brutal clarity view.
 * Renders as a visual card matrix with confidence bars.
 */

type AssumptionStatus = 'confirmed' | 'challenged' | 'unknown' | 'refuted'

interface Assumption {
  belief: string
  evidence: number    // 0-100 evidence for
  against: number     // 0-100 evidence against
  confidence: number  // 0-100
  status: AssumptionStatus
}

const STATUS_COLORS: Record<AssumptionStatus, string> = {
  confirmed: '#22c55e',
  challenged: '#eab308',
  unknown: '#404070',
  refuted: '#ef4444',
}

const STATUS_LABELS: Record<AssumptionStatus, string> = {
  confirmed: 'CONFIRMED',
  challenged: 'CHALLENGED',
  unknown: 'UNKNOWN',
  refuted: 'REFUTED',
}

const ASSUMPTIONS: Assumption[] = [
  { belief: 'Deep work > reactive work for output', evidence: 88, against: 12, confidence: 85, status: 'confirmed' },
  { belief: 'Sleep quality drives creativity', evidence: 74, against: 20, confidence: 72, status: 'confirmed' },
  { belief: 'More hours = more done', evidence: 25, against: 78, confidence: 30, status: 'refuted' },
  { belief: 'Social time reduces productivity', evidence: 30, against: 60, confidence: 40, status: 'challenged' },
  { belief: 'AI tools will plateau in 18 months', evidence: 20, against: 55, confidence: 25, status: 'challenged' },
  { belief: 'I perform best alone', evidence: 55, against: 40, confidence: 55, status: 'unknown' },
]

export function AssumptionTracker() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const itemH = 52
  const headerH = 28
  const footerH = 20
  const height = headerH + ASSUMPTIONS.length * itemH + footerH + 16

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
    ctx.fillText('ASSUMPTION TRACKER', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Column headers — responsive proportions
    const ml = 8, mr = 8
    const narrow = width < 340
    const barAreaW = Math.max(60, width * (narrow ? 0.22 : 0.28))
    const statusW = narrow ? 0 : Math.max(50, width * 0.16)
    const beliefW = width - ml - mr - barAreaW - statusW

    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('BELIEF', ml, headerH - 4)
    ctx.textAlign = 'center'
    ctx.fillText('EVIDENCE', ml + beliefW + barAreaW / 2, headerH - 4)
    if (!narrow) {
      ctx.textAlign = 'right'
      ctx.fillText('STATUS', width - mr, headerH - 4)
    }

    // Divider
    ctx.beginPath()
    ctx.moveTo(ml, headerH)
    ctx.lineTo(width - mr, headerH)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.stroke()

    ASSUMPTIONS.forEach((a, i) => {
      const y = headerH + i * itemH
      const color = STATUS_COLORS[a.status]

      // Row separator
      if (i > 0) {
        ctx.beginPath()
        ctx.moveTo(ml, y)
        ctx.lineTo(width - mr, y)
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Status dot
      ctx.beginPath()
      ctx.arc(ml + 5, y + 16, 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Belief text — use measureText for accurate truncation
      ctx.font = `400 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'left'
      const maxBeliefW = beliefW - 18
      let beliefText = a.belief
      while (ctx.measureText(beliefText).width > maxBeliefW && beliefText.length > 3) {
        beliefText = beliefText.slice(0, -1)
      }
      if (beliefText !== a.belief) beliefText += '…'
      ctx.fillText(beliefText, ml + 14, y + 18)

      // Confidence
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${a.confidence}% conf`, ml + 14, y + 30)

      // Evidence bars
      const barX = ml + beliefW
      const barH = 10
      const barW = barAreaW - (narrow ? 4 : 8)

      // For bar — number inside bar if no room outside
      ctx.fillStyle = '#22c55e18'
      ctx.fillRect(barX, y + 10, barW, barH)
      ctx.fillStyle = '#22c55e60'
      ctx.fillRect(barX, y + 10, (a.evidence / 100) * barW, barH)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = '#22c55e'
      ctx.textAlign = narrow ? 'right' : 'left'
      const forLabelX = narrow ? barX + barW - 2 : barX + barW + 3
      ctx.fillText(`↑${a.evidence}`, forLabelX, y + 18)

      // Against bar
      ctx.fillStyle = '#ef444418'
      ctx.fillRect(barX, y + 24, barW, barH)
      ctx.fillStyle = '#ef444460'
      ctx.fillRect(barX, y + 24, (a.against / 100) * barW, barH)
      ctx.fillStyle = '#ef4444'
      ctx.textAlign = narrow ? 'right' : 'left'
      const againstLabelX = narrow ? barX + barW - 2 : barX + barW + 3
      ctx.fillText(`↓${a.against}`, againstLabelX, y + 32)

      // Status label — skip on narrow to avoid overflow
      if (!narrow) {
        const shortStatus: Record<string, string> = { confirmed: 'OK', challenged: '?', unknown: '–', refuted: 'NO' }
        ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = color
        ctx.textAlign = 'right'
        ctx.fillText(width < 400 ? shortStatus[a.status] : STATUS_LABELS[a.status], width - mr, y + 18)
      }
    })

    // Footer summary
    const footerY = headerH + ASSUMPTIONS.length * itemH + 12
    const counts = {
      confirmed: ASSUMPTIONS.filter(a => a.status === 'confirmed').length,
      challenged: ASSUMPTIONS.filter(a => a.status === 'challenged').length,
      refuted: ASSUMPTIONS.filter(a => a.status === 'refuted').length,
    }
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText(
      `${counts.confirmed} confirmed · ${counts.challenged} challenged · ${counts.refuted} refuted`,
      width / 2,
      footerY,
    )
  }, [width, height])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
