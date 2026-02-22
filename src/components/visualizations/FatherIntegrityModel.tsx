import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Father Integrity Model — Value-to-Behaviour Gap Chart
 * The character architecture view. Not "what I said" but "what I demonstrated."
 * Weekly self-rating per value: Discipline, Courage, Patience, Curiosity,
 * Work Ethic, Emotional Steadiness, Kindness.
 * Modeled vs Spoken ratio shown as a diverging bar.
 */

interface Value {
  label: string
  color: string
  modeled: number   // 0-100: "Did I show it this week?"
  spoken: number    // 0-100: "Did I talk about it this week?"
  note: string
}

const VALUES: Value[] = [
  { label: 'Discipline',          color: '#3b82f6', modeled: 75, spoken: 40, note: 'Morning routine visible' },
  { label: 'Patience',            color: '#22c55e', modeled: 55, spoken: 20, note: 'Reactivity under stress' },
  { label: 'Courage',             color: '#FF6B35', modeled: 80, spoken: 35, note: 'Took hard decisions' },
  { label: 'Curiosity',           color: '#8b5cf6', modeled: 70, spoken: 60, note: 'Asked good questions' },
  { label: 'Work Ethic',          color: '#eab308', modeled: 88, spoken: 45, note: 'Consistent output' },
  { label: 'Emotional Steadiness',color: '#ec4899', modeled: 60, spoken: 15, note: 'Volatility check' },
  { label: 'Kindness',            color: '#22c55e', modeled: 72, spoken: 50, note: 'Acts > words' },
]

export function FatherIntegrityModel() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rowH = 38
  const headerH = 30
  const footerH = 28
  const height = headerH + VALUES.length * rowH + footerH

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
    ctx.fillText('FATHER INTEGRITY MODEL', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Column headers — responsive labelW
    const ml = 16, mr = 16
    const labelW = width < 320 ? Math.min(80, width * 0.28) : 130
    const barArea = Math.max(60, width - ml - mr - labelW - 8)
    const barMid = ml + labelW + 8 + barArea / 2

    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    // Only render column headers if there's room
    if (barArea >= 80) {
      ctx.fillText('← SPOKEN', barMid - barArea / 4, headerH - 4)
      ctx.fillText('MODELED →', barMid + barArea / 4, headerH - 4)
    }

    // Center divider line
    ctx.beginPath()
    ctx.moveTo(barMid, headerH - 12)
    ctx.lineTo(barMid, headerH + VALUES.length * rowH)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.stroke()

    VALUES.forEach((val, i) => {
      const y = headerH + i * rowH
      const color = val.color

      // Row separator
      if (i > 0) {
        ctx.beginPath()
        ctx.moveTo(ml, y)
        ctx.lineTo(width - mr, y)
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Value label — truncate to fit labelW
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      let labelText = val.label
      while (ctx.measureText(labelText).width > labelW - 4 && labelText.length > 3) {
        labelText = labelText.slice(0, -1)
      }
      if (labelText !== val.label) labelText += '…'
      ctx.fillText(labelText, ml, y + 14)

      // Only show note on wider screens
      if (labelW >= 100) {
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textDim
        ctx.fillText(val.note, ml, y + 25)
      }

      const halfBar = barArea / 2
      const barH = 10
      const barY = y + rowH / 2 - barH / 2

      // Modeled bar (right of center, green)
      const modeledW = (val.modeled / 100) * halfBar
      ctx.fillStyle = `${color}20`
      ctx.fillRect(barMid, barY, halfBar, barH)
      ctx.fillStyle = `${color}80`
      ctx.fillRect(barMid, barY, modeledW, barH)
      // Only show percentage label if there's room after bar
      if (barMid + modeledW + 20 < width - mr) {
        ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = color
        ctx.textAlign = 'left'
        ctx.fillText(`${val.modeled}%`, barMid + modeledW + 3, barY + barH - 1)
      }

      // Spoken bar (left of center, dim)
      const spokenW = (val.spoken / 100) * halfBar
      ctx.fillStyle = `${CHART_COLORS.textDim}20`
      ctx.fillRect(barMid - halfBar, barY, halfBar, barH)
      ctx.fillStyle = `${CHART_COLORS.textDim}50`
      ctx.fillRect(barMid - spokenW, barY, spokenW, barH)
      if (barMid - spokenW - 20 > ml + labelW + 8) {
        ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textMuted
        ctx.textAlign = 'right'
        ctx.fillText(`${val.spoken}%`, barMid - spokenW - 3, barY + barH - 1)
      }
    })

    // Footer: integrity score
    const avgModeled = VALUES.reduce((s, v) => s + v.modeled, 0) / VALUES.length
    const avgSpoken = VALUES.reduce((s, v) => s + v.spoken, 0) / VALUES.length
    const integrityGap = avgModeled - avgSpoken  // positive = modeled > spoken (good)
    const footerY = headerH + VALUES.length * rowH + 18

    const intScore = Math.round(avgModeled)
    const scoreColor = intScore >= 70 ? CHART_COLORS.aligned : intScore >= 50 ? CHART_COLORS.drifting : CHART_COLORS.avoiding

    ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = scoreColor
    ctx.textAlign = 'left'
    ctx.fillText(`INTEGRITY SCORE  ${intScore}/100`, ml, footerY)

    if (width >= 320) {
      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = integrityGap > 0 ? CHART_COLORS.aligned : CHART_COLORS.drifting
      ctx.textAlign = 'right'
      ctx.fillText(
        integrityGap > 0 ? `+${Math.round(integrityGap)}pts modeled` : `${Math.round(integrityGap)}pts gap`,
        width - mr,
        footerY,
      )
    }
  }, [width, height])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
