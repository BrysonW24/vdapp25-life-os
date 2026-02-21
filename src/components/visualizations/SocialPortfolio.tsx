import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Social Portfolio — concentric donut chart showing relationship allocation.
 * Outer ring = actual allocation across categories.
 * Inner ring = desired/ideal allocation.
 * Gap between rings = rebalancing opportunity.
 * Center shows total relationship count.
 */

interface Segment {
  label: string
  actual: number
  desired: number
  color: string
}

interface Props {
  segments?: Segment[]
  totalRelationships?: number
}

const DEFAULT_SEGMENTS: Segment[] = [
  { label: 'Energising', actual: 28, desired: 40, color: '#22c55e' },
  { label: 'Draining',   actual: 22, desired: 10, color: '#ef4444' },
  { label: 'Dormant',    actual: 20, desired: 10, color: '#606080' },
  { label: 'Growth',     actual: 18, desired: 25, color: '#3b82f6' },
  { label: 'Legacy',     actual: 12, desired: 15, color: '#8b5cf6' },
]

const DEFAULT_TOTAL = 47

export function SocialPortfolio({
  segments = DEFAULT_SEGMENTS,
  totalRelationships = DEFAULT_TOTAL,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const totalActual = useMemo(() => segments.reduce((s, seg) => s + seg.actual, 0), [segments])
  const totalDesired = useMemo(() => segments.reduce((s, seg) => s + seg.desired, 0), [segments])

  // Find the biggest rebalancing gap
  const maxGap = useMemo(() => {
    let best = { label: '', gap: 0 }
    for (const seg of segments) {
      const gap = Math.abs((seg.actual / totalActual) - (seg.desired / totalDesired))
      if (gap > best.gap) best = { label: seg.label, gap }
    }
    return best
  }, [segments, totalActual, totalDesired])

  const size = Math.min(width, 360)
  const totalHeight = size + 28

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 200) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = totalHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${totalHeight}px`
    ctx.scale(dpr, dpr)

    const cx = width / 2
    const cy = 14 + size / 2

    const outerR = size / 2 - 24
    const outerThickness = 28
    const innerR = outerR - outerThickness - 10
    const innerThickness = 18

    // Title
    ctx.font = "500 8px 'JetBrains Mono', monospace"
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('SOCIAL PORTFOLIO', cx, 12)
    ctx.letterSpacing = '0px'

    // Helper to draw a donut ring
    const drawRing = (
      radius: number,
      thickness: number,
      values: number[],
      total: number,
      colors: string[],
      alpha: number,
    ) => {
      let startAngle = -Math.PI / 2
      const gapAngle = 0.03

      values.forEach((val, i) => {
        const sweep = (val / total) * (Math.PI * 2 - gapAngle * values.length)
        const endAngle = startAngle + sweep

        ctx.beginPath()
        ctx.arc(cx, cy, radius, startAngle, endAngle)
        ctx.arc(cx, cy, radius - thickness, endAngle, startAngle, true)
        ctx.closePath()

        ctx.globalAlpha = alpha
        ctx.fillStyle = colors[i]
        ctx.fill()

        // Subtle border
        ctx.globalAlpha = alpha * 0.5
        ctx.strokeStyle = colors[i]
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.globalAlpha = 1

        startAngle = endAngle + gapAngle
      })
    }

    const colors = segments.map(s => s.color)
    const actuals = segments.map(s => s.actual)
    const desireds = segments.map(s => s.desired)

    // Outer ring — actual allocation
    drawRing(outerR, outerThickness, actuals, totalActual, colors, 0.85)

    // Inner ring — desired allocation
    drawRing(innerR, innerThickness, desireds, totalDesired, colors, 0.35)

    // Ring labels
    ctx.font = "400 6px 'JetBrains Mono', monospace"
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText('ACTUAL', cx + outerR - outerThickness + 4, cy - outerR - 4)
    ctx.fillText('DESIRED', cx + innerR - innerThickness + 4, cy - innerR + innerThickness + 12)

    // Center content
    ctx.textAlign = 'center'
    ctx.font = "700 28px 'Inter', sans-serif"
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.fillText(`${totalRelationships}`, cx, cy + 4)

    ctx.font = "400 7px 'JetBrains Mono', monospace"
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('RELATIONSHIPS', cx, cy + 18)

    // Draw gap indicators between rings — dashed arcs for biggest mismatches
    segments.forEach((seg, i) => {
      const actualFrac = seg.actual / totalActual
      const desiredFrac = seg.desired / totalDesired
      const diff = desiredFrac - actualFrac

      if (Math.abs(diff) > 0.05) {
        // Find the midpoint angle for this segment
        let accActual = 0
        for (let j = 0; j < i; j++) accActual += segments[j].actual
        const midFrac = (accActual + seg.actual / 2) / totalActual
        const midAngle = -Math.PI / 2 + midFrac * Math.PI * 2

        const gapR = (outerR - outerThickness + innerR) / 2
        const indicatorR = 3

        ctx.beginPath()
        ctx.arc(
          cx + gapR * Math.cos(midAngle),
          cy + gapR * Math.sin(midAngle),
          indicatorR,
          0,
          Math.PI * 2,
        )

        if (diff > 0) {
          // Need more — show as hollow circle
          ctx.strokeStyle = seg.color
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.6
          ctx.setLineDash([2, 2])
          ctx.stroke()
          ctx.setLineDash([])
        } else {
          // Reduce — show as filled dot
          ctx.fillStyle = seg.color
          ctx.globalAlpha = 0.4
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
    })

    // Segment percentage labels on outer ring
    let accAngle = -Math.PI / 2
    segments.forEach((seg) => {
      const sweep = (seg.actual / totalActual) * Math.PI * 2
      const midAngle = accAngle + sweep / 2
      const labelR = outerR + 12

      const lx = cx + labelR * Math.cos(midAngle)
      const ly = cy + labelR * Math.sin(midAngle)

      ctx.font = "600 7px 'JetBrains Mono', monospace"
      ctx.fillStyle = seg.color
      ctx.textAlign = 'center'
      ctx.globalAlpha = 0.8
      ctx.fillText(`${Math.round((seg.actual / totalActual) * 100)}%`, lx, ly + 3)
      ctx.globalAlpha = 1

      accAngle += sweep
    })

  }, [width, segments, totalRelationships, totalActual, totalDesired, size, totalHeight, maxGap])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
              <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
                {seg.label}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          Outer = actual · Inner = desired
        </span>
      </div>
    </div>
  )
}
