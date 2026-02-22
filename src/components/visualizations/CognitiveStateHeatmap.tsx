import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Cognitive State Heatmap — multi-variable overlay showing focus, mood,
 * stress, and confidence over 30 days. Each row is a variable.
 * Color intensity shows daily rating. Overlay lines show sleep hours
 * and deep work time for correlational viewing.
 */

interface DayState {
  date: string
  focus: number      // 0-10
  mood: number       // 0-10
  stress: number     // 0-10 (inverted — high stress = red)
  confidence: number // 0-10
  sleepHrs: number   // 4-10
  deepWorkHrs: number // 0-8
}

interface Props {
  data?: DayState[]
}

const ROWS: { key: string; label: string; color: string; invert?: boolean }[] = [
  { key: 'focus',      label: 'Focus',      color: '#3b82f6' },
  { key: 'mood',       label: 'Mood',       color: '#22c55e' },
  { key: 'stress',     label: 'Stress',     color: '#ef4444', invert: true },
  { key: 'confidence', label: 'Confidence', color: '#eab308' },
] as const

function generateSample(): DayState[] {
  const days: DayState[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const sleep = 5 + Math.random() * 4
    const exercise = Math.random() > 0.4
    const highWork = Math.random() > 0.5

    days.push({
      date: d.toISOString().split('T')[0],
      focus: Math.min(10, Math.max(0, (sleep > 7 ? 6 : 3) + Math.random() * 3 + (exercise ? 1 : 0))),
      mood: Math.min(10, Math.max(0, (sleep > 7 ? 5 : 3) + Math.random() * 4)),
      stress: Math.min(10, Math.max(0, (highWork ? 6 : 3) + Math.random() * 3 - (sleep > 7 ? 1 : 0))),
      confidence: Math.min(10, Math.max(0, 4 + Math.random() * 4 + (exercise ? 1 : -1))),
      sleepHrs: Math.round(sleep * 10) / 10,
      deepWorkHrs: Math.round((highWork ? 3 + Math.random() * 4 : 1 + Math.random() * 2) * 10) / 10,
    })
  }
  return days
}

export function CognitiveStateHeatmap({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const days = useMemo(() => data ?? generateSample(), [data])

  const rowH = 24
  const cellGap = 1.5
  const marginTop = 22
  const marginLeft = 68
  const marginRight = 8
  const overlayH = 40
  const totalHeight = marginTop + ROWS.length * rowH + overlayH + 16

  useEffect(() => {
    if (!svgRef.current || width < 200) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const availW = width - marginLeft - marginRight
    const cellW = Math.max(3, (availW - (days.length - 1) * cellGap) / days.length)

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('COGNITIVE STATE HEATMAP')

    // Heatmap rows
    ROWS.forEach((row, ri) => {
      const yBase = marginTop + ri * rowH

      // Row label
      svg.append('text')
        .attr('x', marginLeft - 6).attr('y', yBase + rowH / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('fill', row.color)
        .attr('font-size', 7).attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .text(row.label)

      // Cells
      days.forEach((day, di) => {
        let val = (day as any)[row.key] as number
        // Invert stress so that low stress = green, high stress = red
        const displayVal = row.invert ? 10 - val : val

        const x = marginLeft + di * (cellW + cellGap)
        const intensity = displayVal / 10

        svg.append('rect')
          .attr('x', x).attr('y', yBase)
          .attr('width', cellW).attr('height', rowH - 2)
          .attr('rx', 1.5)
          .attr('fill', row.color)
          .attr('opacity', 0.05 + intensity * 0.55)
          .append('title')
          .text(`${day.date}: ${row.label} = ${val.toFixed(1)}`)
      })
    })

    // Overlay: sleep + deep work lines
    const overlayY = marginTop + ROWS.length * rowH + 8

    svg.append('text')
      .attr('x', marginLeft - 6).attr('y', overlayY + overlayH / 2 + 3)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .text('OVERLAY')

    const xScale = d3.scaleLinear().domain([0, days.length - 1]).range([marginLeft, marginLeft + availW])
    const sleepY = d3.scaleLinear().domain([4, 10]).range([overlayY + overlayH, overlayY])
    const workY = d3.scaleLinear().domain([0, 8]).range([overlayY + overlayH, overlayY])

    // Sleep line
    const sleepLine = d3.line<DayState>()
      .x((_, i) => xScale(i))
      .y(d => sleepY(d.sleepHrs))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(days)
      .attr('d', sleepLine)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.5)

    // Deep work line
    const workLine = d3.line<DayState>()
      .x((_, i) => xScale(i))
      .y(d => workY(d.deepWorkHrs))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(days)
      .attr('d', workLine)
      .attr('fill', 'none')
      .attr('stroke', '#FF6B35')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,2')
      .attr('opacity', 0.4)

  }, [width, days])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {ROWS.map(r => (
            <div key={r.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: r.color, opacity: 0.6 }} />
              <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{r.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: '#8b5cf6' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Sleep</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-b border-dashed" style={{ borderColor: '#FF6B35' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Deep work</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          30d view
        </span>
      </div>
    </div>
  )
}
