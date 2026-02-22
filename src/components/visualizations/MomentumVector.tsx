import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Momentum Vector — a prominent arrow on canvas.
 * Direction = which domain is driving momentum. Length = magnitude.
 * Green if intentional, amber if drift-driven.
 * Shows misalignment angle against declared primary goal.
 */

interface Props {
  /** Angle in degrees of actual momentum direction (0 = right, 90 = up) */
  directionDeg?: number
  /** Angle in degrees of declared primary goal */
  goalDeg?: number
  /** Momentum magnitude 0-100 */
  magnitude?: number
  /** Whether momentum is intentional (true) or drift-driven (false) */
  intentional?: boolean
  /** The domain label driving momentum */
  dominantDomain?: string
}

export function MomentumVector({
  directionDeg = 72,
  goalDeg = 80,
  magnitude = 68,
  intentional = true,
  dominantDomain = 'Career',
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2 + 10
    const maxLen = Math.min(width * 0.35, height * 0.35)
    const arrowLen = maxLen * (magnitude / 100)

    // Misalignment angle
    let misalignment = Math.abs(directionDeg - goalDeg)
    if (misalignment > 180) misalignment = 360 - misalignment

    const arrowColor = intentional ? CHART_COLORS.aligned : CHART_COLORS.drifting
    const goalColor = CHART_COLORS.textMuted

    // Convert degrees to radians (canvas: 0 = right, positive = clockwise)
    // We want 0 = up, so offset by -90
    const dirRad = ((directionDeg - 90) * Math.PI) / 180
    const goalRad = ((goalDeg - 90) * Math.PI) / 180

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('MOMENTUM VECTOR', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Background reference circle
    ctx.beginPath()
    ctx.arc(cx, cy, maxLen + 8, 0, Math.PI * 2)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Inner reference circle at 50%
    ctx.beginPath()
    ctx.arc(cx, cy, maxLen * 0.5, 0, Math.PI * 2)
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Goal direction line (dashed, dim)
    const goalEndX = cx + Math.cos(goalRad) * (maxLen + 8)
    const goalEndY = cy + Math.sin(goalRad) * (maxLen + 8)
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(cx, cy)
    ctx.lineTo(goalEndX, goalEndY)
    ctx.strokeStyle = goalColor
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash([])

    // Goal label
    const goalLabelX = cx + Math.cos(goalRad) * (maxLen + 20)
    const goalLabelY = cy + Math.sin(goalRad) * (maxLen + 20)
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GOAL', goalLabelX, goalLabelY)

    // Misalignment arc between goal and direction
    if (misalignment > 2) {
      const arcRadius = 24
      const startAngle = Math.min(dirRad, goalRad)
      const endAngle = Math.max(dirRad, goalRad)

      // Choose shorter arc
      const diff = endAngle - startAngle
      if (diff <= Math.PI) {
        ctx.beginPath()
        ctx.arc(cx, cy, arcRadius, startAngle, endAngle)
      } else {
        ctx.beginPath()
        ctx.arc(cx, cy, arcRadius, endAngle, startAngle + Math.PI * 2)
      }
      ctx.strokeStyle = misalignment > 45
        ? CHART_COLORS.avoiding
        : misalignment > 15
          ? CHART_COLORS.drifting
          : CHART_COLORS.aligned
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Misalignment angle label in the arc
      const midAngle = (dirRad + goalRad) / 2
      const labelR = arcRadius + 12
      const labelX = cx + Math.cos(midAngle) * labelR
      const labelY = cy + Math.sin(midAngle) * labelR
      ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = ctx.strokeStyle
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(misalignment)}°`, labelX, labelY)
    }

    // Momentum arrow shaft
    const arrowEndX = cx + Math.cos(dirRad) * arrowLen
    const arrowEndY = cy + Math.sin(dirRad) * arrowLen

    // Glow effect
    ctx.shadowColor = arrowColor
    ctx.shadowBlur = 12

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(arrowEndX, arrowEndY)
    ctx.strokeStyle = arrowColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    // Arrow head
    const headLen = 12
    const headAngle = 0.4
    const headX1 = arrowEndX - headLen * Math.cos(dirRad - headAngle)
    const headY1 = arrowEndY - headLen * Math.sin(dirRad - headAngle)
    const headX2 = arrowEndX - headLen * Math.cos(dirRad + headAngle)
    const headY2 = arrowEndY - headLen * Math.sin(dirRad + headAngle)

    ctx.beginPath()
    ctx.moveTo(arrowEndX, arrowEndY)
    ctx.lineTo(headX1, headY1)
    ctx.moveTo(arrowEndX, arrowEndY)
    ctx.lineTo(headX2, headY2)
    ctx.strokeStyle = arrowColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.shadowBlur = 0

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = arrowColor
    ctx.fill()

    // Alignment status text
    const statusText = misalignment <= 10
      ? 'ALIGNED'
      : misalignment <= 30
        ? 'SLIGHTLY OFF'
        : misalignment <= 60
          ? 'DRIFTING'
          : misalignment <= 90
            ? 'PERPENDICULAR'
            : 'OPPOSED'

    const statusColor = misalignment <= 10
      ? CHART_COLORS.aligned
      : misalignment <= 30
        ? CHART_COLORS.aligned
        : misalignment <= 60
          ? CHART_COLORS.drifting
          : CHART_COLORS.avoiding

    // Bottom left: domain + magnitude
    ctx.font = `600 ${chartFontSize(11, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = arrowColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(dominantDomain.toUpperCase(), 12, height - 24)

    ctx.font = `400 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textSecondary
    ctx.fillText(`Magnitude: ${magnitude}`, 12, height - 10)

    // Bottom right: alignment status
    ctx.font = `600 ${chartFontSize(10, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = statusColor
    ctx.textAlign = 'right'
    ctx.fillText(statusText, width - 12, height - 24)

    ctx.font = `400 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textSecondary
    ctx.fillText(
      `${Math.round(misalignment)}° off goal`,
      width - 12,
      height - 10,
    )
  }, [width, directionDeg, goalDeg, magnitude, intentional, dominantDomain])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
