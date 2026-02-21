import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Cognitive Distortion Patterns — heatmap showing frequency of
 * cognitive distortions over 12 weeks. Rows = distortion types,
 * columns = weeks. Intensity = frequency detected.
 */

interface WeekData {
  week: string
  catastrophizing: number   // 0-10
  allOrNothing: number      // 0-10
  perfectionism: number     // 0-10
  avoidance: number         // 0-10
  mindReading: number       // 0-10
  emotionalReasoning: number // 0-10
}

interface Props {
  data?: WeekData[]
}

const DISTORTIONS = [
  { key: 'catastrophizing', label: 'Catastrophizing', color: '#ef4444' },
  { key: 'allOrNothing', label: 'All-or-Nothing', color: '#f97316' },
  { key: 'perfectionism', label: 'Perfectionism', color: '#eab308' },
  { key: 'avoidance', label: 'Avoidance', color: '#8b5cf6' },
  { key: 'mindReading', label: 'Mind-Reading', color: '#3b82f6' },
  { key: 'emotionalReasoning', label: 'Emotional Reasoning', color: '#ec4899' },
] as const

function generateDefaultData(): WeekData[] {
  const weeks: WeekData[] = []
  const base = {
    catastrophizing: 4, allOrNothing: 3, perfectionism: 6,
    avoidance: 2, mindReading: 3, emotionalReasoning: 4,
  }

  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const weekLabel = `W${12 - i}`

    // Simulate some variation with a stress spike around week 6-8
    const stressMultiplier = (i >= 4 && i <= 6) ? 1.5 : 1

    weeks.push({
      week: weekLabel,
      catastrophizing: Math.min(10, Math.max(0, Math.round(base.catastrophizing * stressMultiplier + (Math.random() - 0.5) * 3))),
      allOrNothing: Math.min(10, Math.max(0, Math.round(base.allOrNothing * stressMultiplier + (Math.random() - 0.5) * 3))),
      perfectionism: Math.min(10, Math.max(0, Math.round(base.perfectionism * stressMultiplier + (Math.random() - 0.5) * 3))),
      avoidance: Math.min(10, Math.max(0, Math.round(base.avoidance * stressMultiplier + (Math.random() - 0.5) * 3))),
      mindReading: Math.min(10, Math.max(0, Math.round(base.mindReading * stressMultiplier + (Math.random() - 0.5) * 3))),
      emotionalReasoning: Math.min(10, Math.max(0, Math.round(base.emotionalReasoning * stressMultiplier + (Math.random() - 0.5) * 3))),
    })
  }
  return weeks
}

export function CognitiveDistortionMap({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const weeks = useMemo(() => data ?? generateDefaultData(), [data])

  const rowH = 28
  const marginTop = 28
  const marginBottom = 22
  const marginLeft = 120
  const marginRight = 12
  const height = marginTop + DISTORTIONS.length * rowH + marginBottom

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 250) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const availW = width - marginLeft - marginRight
    const cellW = Math.max(8, (availW - (weeks.length - 1) * 2) / weeks.length)
    const cellGap = 2

    // Title
    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('COGNITIVE DISTORTION PATTERNS', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Draw heatmap
    DISTORTIONS.forEach((distortion, ri) => {
      const yBase = marginTop + ri * rowH

      // Row label
      ctx.font = `500 7px 'JetBrains Mono', monospace`
      ctx.fillStyle = distortion.color
      ctx.globalAlpha = 0.7
      ctx.textAlign = 'right'
      ctx.fillText(distortion.label, marginLeft - 8, yBase + rowH / 2 + 2)
      ctx.globalAlpha = 1

      // Cells
      weeks.forEach((week, ci) => {
        const val = (week as any)[distortion.key] as number
        const x = marginLeft + ci * (cellW + cellGap)
        const intensity = val / 10

        // Cell background
        ctx.fillStyle = distortion.color
        ctx.globalAlpha = 0.05 + intensity * 0.55
        ctx.beginPath()
        ctx.roundRect(x, yBase + 2, cellW, rowH - 4, 3)
        ctx.fill()
        ctx.globalAlpha = 1

        // Value text in cell (only if cell is wide enough)
        if (cellW > 16 && val > 0) {
          ctx.font = `600 7px 'JetBrains Mono', monospace`
          ctx.fillStyle = CHART_COLORS.textPrimary
          ctx.globalAlpha = intensity > 0.5 ? 0.8 : 0.4
          ctx.textAlign = 'center'
          ctx.fillText(`${val}`, x + cellW / 2, yBase + rowH / 2 + 3)
          ctx.globalAlpha = 1
        }
      })

      // Row separator line
      if (ri < DISTORTIONS.length - 1) {
        ctx.beginPath()
        ctx.strokeStyle = CHART_COLORS.gridLine
        ctx.lineWidth = 0.5
        ctx.moveTo(marginLeft, yBase + rowH)
        ctx.lineTo(marginLeft + availW, yBase + rowH)
        ctx.stroke()
      }
    })

    // Column (week) labels
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    weeks.forEach((week, ci) => {
      const x = marginLeft + ci * (cellW + cellGap) + cellW / 2
      ctx.fillText(week.week, x, marginTop + DISTORTIONS.length * rowH + 12)
    })

    // Row average sparklines (right side)
    DISTORTIONS.forEach((distortion, ri) => {
      const yBase = marginTop + ri * rowH
      const vals = weeks.map(w => (w as any)[distortion.key] as number)
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length

      // Average badge
      ctx.font = `600 7px 'JetBrains Mono', monospace`
      ctx.fillStyle = distortion.color
      ctx.globalAlpha = 0.6
      ctx.textAlign = 'left'
      ctx.fillText(`${avg.toFixed(1)}`, marginLeft + weeks.length * (cellW + cellGap) + 4, yBase + rowH / 2 + 2)
      ctx.globalAlpha = 1
    })

  }, [width, height, weeks])

  // Summary stats
  const topDistortion = useMemo(() => {
    const avgs = DISTORTIONS.map(d => {
      const avg = weeks.reduce((s, w) => s + ((w as any)[d.key] as number), 0) / weeks.length
      return { ...d, avg }
    })
    return avgs.sort((a, b) => b.avg - a.avg)[0]
  }, [weeks])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2">
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>DOMINANT</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: topDistortion.color, opacity: 0.6 }} />
            <span className="text-[8px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: topDistortion.color }}>
              {topDistortion.label}
            </span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          12 weeks
        </span>
      </div>
    </div>
  )
}
