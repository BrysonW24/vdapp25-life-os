import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Window of Tolerance — vertical gauge showing current arousal state.
 * Optimal zone in center (blue band). Hyperarousal above (red/amber).
 * Hypoarousal below (purple/grey). Side sparkline shows 30-day history.
 */

interface Props {
  /** Current position: 0 = deep hypoarousal, 50 = center of optimal, 100 = peak hyperarousal */
  currentPosition?: number
  /** 30-day history of positions */
  history?: number[]
}

function generateDefaultHistory(): number[] {
  const history: number[] = []
  let val = 50
  for (let i = 0; i < 30; i++) {
    val += (Math.random() - 0.5) * 15
    val = Math.max(8, Math.min(92, val))
    history.push(Math.round(val))
  }
  return history
}

const DEFAULT_HISTORY = generateDefaultHistory()

export function WindowOfTolerance({
  currentPosition = 55,
  history = DEFAULT_HISTORY,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const height = 280

  const zone = useMemo(() => {
    if (currentPosition >= 35 && currentPosition <= 65) return 'optimal'
    if (currentPosition > 65) return 'hyperarousal'
    return 'hypoarousal'
  }, [currentPosition])

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

    const marginTop = 28
    const marginBottom = 16
    const gaugeLeft = 80
    const gaugeWidth = 40
    const sparkLeft = gaugeLeft + gaugeWidth + 40
    const sparkWidth = width - sparkLeft - 20
    const gaugeTop = marginTop + 10
    const gaugeBottom = height - marginBottom
    const gaugeH = gaugeBottom - gaugeTop

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('WINDOW OF TOLERANCE', width / 2, 14)
    ctx.letterSpacing = '0px'

    // === GAUGE BACKGROUND ===

    // Hyperarousal zone (top) — red to amber gradient
    const hyperGrad = ctx.createLinearGradient(0, gaugeTop, 0, gaugeTop + gaugeH * 0.35)
    hyperGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)')
    hyperGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)')
    hyperGrad.addColorStop(1, 'rgba(234, 179, 8, 0.12)')
    ctx.fillStyle = hyperGrad
    ctx.beginPath()
    ctx.roundRect(gaugeLeft, gaugeTop, gaugeWidth, gaugeH * 0.35, [6, 6, 0, 0])
    ctx.fill()

    // Optimal zone (center) — blue band
    const optimalTop = gaugeTop + gaugeH * 0.35
    const optimalH = gaugeH * 0.3
    const optGrad = ctx.createLinearGradient(0, optimalTop, 0, optimalTop + optimalH)
    optGrad.addColorStop(0, 'rgba(59, 130, 246, 0.2)')
    optGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)')
    optGrad.addColorStop(1, 'rgba(59, 130, 246, 0.2)')
    ctx.fillStyle = optGrad
    ctx.fillRect(gaugeLeft, optimalTop, gaugeWidth, optimalH)

    // Optimal zone border highlight
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 2])
    ctx.beginPath()
    ctx.moveTo(gaugeLeft, optimalTop)
    ctx.lineTo(gaugeLeft + gaugeWidth, optimalTop)
    ctx.moveTo(gaugeLeft, optimalTop + optimalH)
    ctx.lineTo(gaugeLeft + gaugeWidth, optimalTop + optimalH)
    ctx.stroke()
    ctx.setLineDash([])

    // Hypoarousal zone (bottom) — purple to grey gradient
    const hypoTop = gaugeTop + gaugeH * 0.65
    const hypoH = gaugeH * 0.35
    const hypoGrad = ctx.createLinearGradient(0, hypoTop, 0, hypoTop + hypoH)
    hypoGrad.addColorStop(0, 'rgba(139, 92, 246, 0.12)')
    hypoGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)')
    hypoGrad.addColorStop(1, 'rgba(96, 96, 128, 0.3)')
    ctx.fillStyle = hypoGrad
    ctx.beginPath()
    ctx.roundRect(gaugeLeft, hypoTop, gaugeWidth, hypoH, [0, 0, 6, 6])
    ctx.fill()

    // Gauge border
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(gaugeLeft, gaugeTop, gaugeWidth, gaugeH, 6)
    ctx.stroke()

    // Zone labels (left side)
    ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'right'

    ctx.fillStyle = '#ef4444'
    ctx.globalAlpha = 0.7
    ctx.fillText('HYPER-', gaugeLeft - 8, gaugeTop + gaugeH * 0.14)
    ctx.fillText('AROUSAL', gaugeLeft - 8, gaugeTop + gaugeH * 0.14 + 10)

    ctx.fillStyle = '#3b82f6'
    ctx.globalAlpha = 0.8
    ctx.fillText('OPTIMAL', gaugeLeft - 8, gaugeTop + gaugeH * 0.5 + 3)
    ctx.fillText('ZONE', gaugeLeft - 8, gaugeTop + gaugeH * 0.5 + 13)

    ctx.fillStyle = '#8b5cf6'
    ctx.globalAlpha = 0.7
    ctx.fillText('HYPO-', gaugeLeft - 8, gaugeTop + gaugeH * 0.84)
    ctx.fillText('AROUSAL', gaugeLeft - 8, gaugeTop + gaugeH * 0.84 + 10)
    ctx.globalAlpha = 1

    // === CURRENT POSITION MARKER ===
    const posY = gaugeTop + gaugeH * (1 - currentPosition / 100)
    const markerColor = zone === 'optimal' ? '#3b82f6' :
      zone === 'hyperarousal' ? '#ef4444' : '#8b5cf6'

    // Glow behind marker
    const glowGrad = ctx.createRadialGradient(
      gaugeLeft + gaugeWidth / 2, posY, 0,
      gaugeLeft + gaugeWidth / 2, posY, 20,
    )
    glowGrad.addColorStop(0, `${markerColor}40`)
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(gaugeLeft - 10, posY - 20, gaugeWidth + 20, 40)

    // Horizontal marker line
    ctx.beginPath()
    ctx.strokeStyle = markerColor
    ctx.lineWidth = 2
    ctx.moveTo(gaugeLeft - 4, posY)
    ctx.lineTo(gaugeLeft + gaugeWidth + 4, posY)
    ctx.stroke()

    // Marker dot
    ctx.beginPath()
    ctx.arc(gaugeLeft + gaugeWidth / 2, posY, 5, 0, Math.PI * 2)
    ctx.fillStyle = markerColor
    ctx.fill()
    ctx.strokeStyle = '#16162a'
    ctx.lineWidth = 2
    ctx.stroke()

    // Position value label
    ctx.font = `700 ${chartFontSize(10, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = markerColor
    ctx.textAlign = 'left'
    ctx.fillText(`${currentPosition}`, gaugeLeft + gaugeWidth + 8, posY + 4)

    // === SPARKLINE (30-day history) ===
    if (sparkWidth > 40 && history.length > 1) {
      // Sparkline label
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText('30-DAY HISTORY', sparkLeft + sparkWidth / 2, gaugeTop - 2)

      // Draw sparkline zone backgrounds
      const sparkH = gaugeH

      // Hyperarousal bg
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)'
      ctx.fillRect(sparkLeft, gaugeTop, sparkWidth, sparkH * 0.35)

      // Optimal bg
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
      ctx.fillRect(sparkLeft, gaugeTop + sparkH * 0.35, sparkWidth, sparkH * 0.3)

      // Hypoarousal bg
      ctx.fillStyle = 'rgba(139, 92, 246, 0.05)'
      ctx.fillRect(sparkLeft, gaugeTop + sparkH * 0.65, sparkWidth, sparkH * 0.35)

      // Draw the sparkline path
      ctx.beginPath()
      history.forEach((val, i) => {
        const x = sparkLeft + (i / (history.length - 1)) * sparkWidth
        const y = gaugeTop + sparkH * (1 - val / 100)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = CHART_COLORS.textSecondary
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Fill area under sparkline
      ctx.beginPath()
      history.forEach((val, i) => {
        const x = sparkLeft + (i / (history.length - 1)) * sparkWidth
        const y = gaugeTop + sparkH * (1 - val / 100)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.lineTo(sparkLeft + sparkWidth, gaugeTop + sparkH)
      ctx.lineTo(sparkLeft, gaugeTop + sparkH)
      ctx.closePath()
      const areaGrad = ctx.createLinearGradient(0, gaugeTop, 0, gaugeTop + sparkH)
      areaGrad.addColorStop(0, 'rgba(139, 92, 246, 0.08)')
      areaGrad.addColorStop(1, 'rgba(139, 92, 246, 0.01)')
      ctx.fillStyle = areaGrad
      ctx.fill()

      // Dots for last 3 days
      const last3 = history.slice(-3)
      last3.forEach((val, i) => {
        const idx = history.length - 3 + i
        const x = sparkLeft + (idx / (history.length - 1)) * sparkWidth
        const y = gaugeTop + sparkH * (1 - val / 100)
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fillStyle = CHART_COLORS.textSecondary
        ctx.fill()
      })

      // Sparkline border
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3
      ctx.strokeRect(sparkLeft, gaugeTop, sparkWidth, sparkH)
      ctx.globalAlpha = 1
    }

  }, [width, height, currentPosition, history, zone])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: zone === 'optimal' ? '#3b82f6' : zone === 'hyperarousal' ? '#ef4444' : '#8b5cf6' }} />
          <span className="text-[8px] font-medium" style={{
            fontFamily: 'var(--font-mono)',
            color: zone === 'optimal' ? '#3b82f6' : zone === 'hyperarousal' ? '#ef4444' : '#8b5cf6',
          }}>
            {zone === 'optimal' ? 'In Optimal Zone' : zone === 'hyperarousal' ? 'Hyperaroused' : 'Hypoaroused'}
          </span>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          30d avg: {Math.round(history.reduce((s, v) => s + v, 0) / history.length)}
        </span>
      </div>
    </div>
  )
}
