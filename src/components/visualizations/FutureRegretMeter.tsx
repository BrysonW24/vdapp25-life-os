import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Future Regret Meter — "If I repeat this week 52 times, am I proud?"
 * A single, confronting gauge. Green = proud. Amber = neutral. Red = regret.
 * Animated needle with a pulsing glow. Shows the composite week score
 * against your declared standards.
 */

interface Props {
  /** Composite week score 0-100 (higher = more aligned with declared life) */
  weekScore?: number
  /** Key insight text */
  insight?: string
}

export function FutureRegretMeter({
  weekScore = 54,
  insight = 'This week repeated = a life you designed 54% of.',
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 320)
  const height = size * 0.65

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = height * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = height - 24
    const outerR = Math.min(cx - 24, cy - 12)
    const innerR = outerR - 16

    const startAngle = Math.PI + 0.3
    const endAngle = 2 * Math.PI - 0.3
    const range = endAngle - startAngle

    let animFrame: number
    let time = 0

    function draw() {
      time += 0.015
      ctx.clearRect(0, 0, size, height)

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('FUTURE REGRET METER', size / 2, 14)
      ctx.letterSpacing = '0px'

      // Background arc
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, startAngle, endAngle)
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = CHART_COLORS.surfaceLight
      ctx.fill()

      // Color gradient arc segments
      const segments = 60
      for (let i = 0; i < segments; i++) {
        const frac = i / segments
        const segStart = startAngle + frac * range
        const segEnd = startAngle + ((i + 1) / segments) * range

        // Green → Amber → Red (reversed because 100=good=green)
        let r: number, g: number, b: number
        if (frac < 0.33) {
          // Red zone (low scores)
          r = 239; g = 68; b = 68
        } else if (frac < 0.66) {
          // Amber zone
          const t = (frac - 0.33) / 0.33
          r = Math.round(239 - t * 5); g = Math.round(68 + t * 129); b = Math.round(68 - t * 60)
        } else {
          // Green zone (high scores)
          r = 34; g = 197; b = 94
        }

        ctx.beginPath()
        ctx.arc(cx, cy, outerR - 2, segStart, segEnd)
        ctx.arc(cx, cy, innerR + 2, segEnd, segStart, true)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},0.15)`
        ctx.fill()
      }

      // Needle
      const needleAngle = startAngle + (weekScore / 100) * range
      const needleLen = outerR + 6
      const nx = cx + Math.cos(needleAngle) * needleLen
      const ny = cy + Math.sin(needleAngle) * needleLen

      const needleColor = weekScore > 70 ? CHART_COLORS.aligned
        : weekScore > 40 ? CHART_COLORS.drifting
        : CHART_COLORS.avoiding

      // Needle glow
      ctx.save()
      ctx.shadowColor = needleColor
      ctx.shadowBlur = 8 + 4 * Math.sin(time * 3)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(nx, ny)
      ctx.strokeStyle = needleColor
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()

      // Center hub
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = needleColor
      ctx.fill()

      // Score
      ctx.font = `700 ${chartFontSize(28, width)}px 'Inter', sans-serif`
      ctx.fillStyle = needleColor
      ctx.textAlign = 'center'
      ctx.fillText(`${weekScore}`, cx, cy - 24)

      // Label
      const label = weekScore > 70 ? 'PROUD'
        : weekScore > 50 ? 'NEUTRAL'
        : weekScore > 30 ? 'CONCERN'
        : 'REGRET'

      ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = needleColor
      ctx.globalAlpha = 0.7
      ctx.fillText(label, cx, cy - 10)
      ctx.globalAlpha = 1

      // Min/Max
      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      const minX = cx + Math.cos(startAngle) * (outerR + 14)
      const minY = cy + Math.sin(startAngle) * (outerR + 14)
      ctx.textAlign = 'center'
      ctx.fillText('REGRET', minX, minY)

      const maxX = cx + Math.cos(endAngle) * (outerR + 14)
      const maxY = cy + Math.sin(endAngle) * (outerR + 14)
      ctx.fillText('PROUD', maxX, maxY)

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, weekScore])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <p className="text-[9px] text-[#606080] text-center" style={{ fontFamily: 'var(--font-mono)' }}>
          {insight}
        </p>
      </div>
    </div>
  )
}
