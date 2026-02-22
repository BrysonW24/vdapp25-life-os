import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Identity Alignment Index — dual overlapping spider webs.
 * Inner web = actual identity allocation from behavior data.
 * Outer web = desired/declared identity allocation.
 * Gap between the two = where you're betraying your future self.
 */

interface IdentityAxis {
  label: string
  desired: number // 0-100
  actual: number  // 0-100
}

interface Props {
  axes?: IdentityAxis[]
}

const DEFAULT_AXES: IdentityAxis[] = [
  { label: 'Engineer',  desired: 30, actual: 22 },
  { label: 'Founder',   desired: 25, actual: 18 },
  { label: 'Athlete',   desired: 15, actual: 20 },
  { label: 'Investor',  desired: 10, actual: 5 },
  { label: 'Leader',    desired: 10, actual: 8 },
  { label: 'Learner',   desired: 10, actual: 7 },
]

export function IdentityAlignmentIndex({ axes = DEFAULT_AXES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 380)
  const height = size

  const totalGap = useMemo(() => {
    return axes.reduce((s, a) => s + Math.abs(a.desired - a.actual), 0)
  }, [axes])

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
    const cy = size / 2 + 10
    const maxR = size / 2 - 50
    const n = axes.length

    let animFrame: number
    let time = 0

    function getPoint(i: number, value: number) {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2
      const r = (value / 100) * maxR
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
    }

    function draw() {
      time += 0.008
      ctx.clearRect(0, 0, size, height)

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('IDENTITY ALIGNMENT', size / 2, 14)
      ctx.letterSpacing = '0px'

      // Grid rings
      for (let ring = 20; ring <= 100; ring += 20) {
        ctx.beginPath()
        for (let i = 0; i <= n; i++) {
          const p = getPoint(i % n, ring)
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
        ctx.closePath()
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Axis lines + labels
      axes.forEach((a, i) => {
        const p = getPoint(i, 100)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = 'rgba(45, 45, 78, 0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Label
        const lp = getPoint(i, 115)
        ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textSecondary
        ctx.textAlign = 'center'
        ctx.fillText(a.label, lp.x, lp.y + 3)
      })

      // Desired web (outer, dashed)
      ctx.beginPath()
      axes.forEach((a, i) => {
        const p = getPoint(i, a.desired)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      ctx.setLineDash([4, 3])
      ctx.strokeStyle = CHART_COLORS.brandLight
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.5 + 0.1 * Math.sin(time * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Desired fill
      ctx.beginPath()
      axes.forEach((a, i) => {
        const p = getPoint(i, a.desired)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      ctx.fillStyle = `${CHART_COLORS.brandLight}08`
      ctx.fill()

      // Actual web (inner, solid)
      ctx.beginPath()
      axes.forEach((a, i) => {
        const p = getPoint(i, a.actual)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      ctx.strokeStyle = CHART_COLORS.accent
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      // Actual fill
      ctx.beginPath()
      axes.forEach((a, i) => {
        const p = getPoint(i, a.actual)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      ctx.fillStyle = `${CHART_COLORS.accent}15`
      ctx.fill()

      // Gap lines between desired and actual per axis
      axes.forEach((a, i) => {
        const dp = getPoint(i, a.desired)
        const ap = getPoint(i, a.actual)
        const gap = a.desired - a.actual

        if (Math.abs(gap) > 3) {
          ctx.beginPath()
          ctx.moveTo(dp.x, dp.y)
          ctx.lineTo(ap.x, ap.y)
          ctx.strokeStyle = gap > 0 ? CHART_COLORS.avoiding : CHART_COLORS.aligned
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.3
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Actual dot
        ctx.beginPath()
        ctx.arc(ap.x, ap.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = CHART_COLORS.accent
        ctx.fill()
      })

      // Center score
      const alignmentScore = Math.max(0, 100 - totalGap)
      ctx.font = `700 ${chartFontSize(18, width)}px 'Inter', sans-serif`
      ctx.fillStyle = alignmentScore > 70 ? CHART_COLORS.aligned : alignmentScore > 40 ? CHART_COLORS.drifting : CHART_COLORS.avoiding
      ctx.textAlign = 'center'
      ctx.fillText(`${alignmentScore}`, cx, cy + 6)

      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText('ALIGNMENT', cx, cy + 18)

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, axes, totalGap])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-b border-dashed" style={{ borderColor: CHART_COLORS.brandLight }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Desired</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: CHART_COLORS.accent }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Actual</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {axes.length} identity axes
        </span>
      </div>
    </div>
  )
}
