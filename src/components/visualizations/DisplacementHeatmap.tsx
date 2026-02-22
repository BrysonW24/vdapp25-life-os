import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Displacement Heatmap — dual-channel calendar showing work intensity
 * vs family/social connection. When work goes red, family goes grey.
 * Makes the anti-correlation visible and undeniable.
 *
 * "Most people assume they balance it out on weekends.
 *  The data usually shows they don't."
 */

interface DayData {
  date: string       // yyyy-MM-dd
  work: number       // 0–10 intensity
  connection: number // 0–10 meaningful interaction
}

interface Props {
  data?: DayData[]
  weeks?: number
}

function generateSampleData(weeks: number): DayData[] {
  const days: DayData[] = []
  const now = new Date()

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekInCycle = Math.floor(i / 7) % 6

    // Simulate anti-correlation pattern
    const isHighWorkWeek = weekInCycle < 3
    const isWeekend = dow === 0 || dow === 6

    let work = isWeekend
      ? 1 + Math.random() * 2
      : isHighWorkWeek
        ? 5 + Math.random() * 5
        : 2 + Math.random() * 4

    let connection = isWeekend
      ? 4 + Math.random() * 5
      : isHighWorkWeek
        ? Math.random() * 3
        : 3 + Math.random() * 5

    // Add some noise
    work = Math.min(10, Math.max(0, work + (Math.random() - 0.5) * 2))
    connection = Math.min(10, Math.max(0, connection + (Math.random() - 0.5) * 2))

    days.push({
      date: d.toISOString().split('T')[0],
      work: Math.round(work * 10) / 10,
      connection: Math.round(connection * 10) / 10,
    })
  }

  return days
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function DisplacementHeatmap({ data, weeks = 8 }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const days = useMemo(() => data ?? generateSampleData(weeks), [data, weeks])

  const channelHeight = 56
  const cellGap = 1.5
  const marginLeft = 16
  const marginRight = 8
  const marginTop = 20
  const channelGap = 24
  const totalHeight = marginTop + channelHeight * 2 + channelGap + 40

  useEffect(() => {
    if (!svgRef.current || width < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const availW = width - marginLeft - marginRight
    const numWeeks = Math.ceil(days.length / 7)
    const cellW = Math.max(3, (availW - (numWeeks - 1) * cellGap) / numWeeks)
    const cellH = Math.max(3, (channelHeight - 6 * cellGap) / 7)

    // Work intensity color scale (grey → orange → red)
    const workColor = d3.scaleLinear<string>()
      .domain([0, 3, 6, 10])
      .range(['#1e1e35', '#3d2e1e', '#FF6B35', '#ef4444'])
      .clamp(true)

    // Connection color scale (grey → blue → violet)
    const connColor = d3.scaleLinear<string>()
      .domain([0, 3, 6, 10])
      .range(['#1e1e35', '#1e2a3d', '#3b82f6', '#8b5cf6'])
      .clamp(true)

    // Channel labels
    const drawChannel = (
      yOffset: number,
      label: string,
      colorScale: d3.ScaleLinear<string, string>,
      getValue: (d: DayData) => number,
    ) => {
      // Label
      svg.append('text')
        .attr('x', marginLeft)
        .attr('y', yOffset - 6)
        .attr('fill', CHART_COLORS.textMuted)
        .attr('font-size', 8)
        .attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .attr('letter-spacing', '0.12em')
        .text(label)

      // Day labels on left
      DAY_LABELS.forEach((dl, di) => {
        if (di % 2 === 1) {
          svg.append('text')
            .attr('x', marginLeft - 4)
            .attr('y', yOffset + di * (cellH + cellGap) + cellH * 0.8)
            .attr('text-anchor', 'end')
            .attr('fill', CHART_COLORS.textDim)
            .attr('font-size', 6)
            .attr('font-family', 'var(--font-mono)')
            .text(dl)
        }
      })

      // Grid cells
      days.forEach((day, i) => {
        const weekIdx = Math.floor(i / 7)
        const dayIdx = i % 7
        const x = marginLeft + weekIdx * (cellW + cellGap)
        const y = yOffset + dayIdx * (cellH + cellGap)
        const val = getValue(day)

        svg.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 1.5)
          .attr('fill', colorScale(val))
          .attr('opacity', 0.85)
          .append('title')
          .text(`${day.date}: ${val.toFixed(1)}`)
      })
    }

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('DISPLACEMENT HEATMAP')

    drawChannel(marginTop, 'WORK INTENSITY', workColor, d => d.work)
    drawChannel(marginTop + channelHeight + channelGap, 'CONNECTION', connColor, d => d.connection)

    // Displacement ratio
    const avgWork = days.reduce((s, d) => s + d.work, 0) / days.length
    const avgConn = days.reduce((s, d) => s + d.connection, 0) / days.length
    const ratio = avgWork > 0 ? (avgWork / (avgConn || 1)).toFixed(1) : '—'
    const ratioY = totalHeight - 8

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', ratioY)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textSecondary)
      .attr('font-size', 9)
      .attr('font-family', 'var(--font-mono)')
      .text(`Displacement Ratio: ${ratio}x`)

  }, [width, days, totalHeight])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />

      {/* Legend */}
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-sm" style={{ background: '#FF6B35' }} />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>High work</span>
          <div className="w-3 h-1.5 rounded-sm" style={{ background: '#8b5cf6' }} />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>High connection</span>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {weeks}w view
        </span>
      </div>
    </div>
  )
}
