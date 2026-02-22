import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS, chartFontSize } from '@/components/visualizations/theme'
import { subDays, format, startOfWeek, addDays } from 'date-fns'
import type { HabitLog } from '@/types'

type HabitHeatmapProps = {
  logs: HabitLog[]
  habitCount: number
  weeks?: number
}

const DAY_LABELS = ['', 'M', '', 'W', '', 'F', '']

export function HabitHeatmap({ logs, habitCount, weeks = 12 }: HabitHeatmapProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  // Build completion map
  const completionMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of logs) {
      if (log.completed) {
        map.set(log.date, (map.get(log.date) ?? 0) + 1)
      }
    }
    return map
  }, [logs])

  // Generate grid dates
  const { gridDates, todayStr } = useMemo(() => {
    const today = new Date()
    const tStr = format(today, 'yyyy-MM-dd')
    const endWeek = startOfWeek(today, { weekStartsOn: 1 })
    const startDate = subDays(endWeek, (weeks - 1) * 7)
    const dates: Date[] = []
    for (let i = 0; i < weeks * 7; i++) {
      dates.push(addDays(startDate, i))
    }
    return { gridDates: dates, todayStr: tStr }
  }, [weeks])

  const leftPad = 16
  const topPad = 14
  const gap = 2
  const cellSize = Math.max(4, Math.floor((width - leftPad - gap * (weeks - 1)) / weeks))
  const height = topPad + 7 * (cellSize + gap)

  const colorScale = useMemo(() =>
    d3.scaleSequential(d3.interpolateRgb(CHART_COLORS.surfaceLight, '#22c55e')).domain([0, 1]),
    [],
  )

  useEffect(() => {
    if (!svgRef.current || width === 0 || habitCount === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Day labels
    DAY_LABELS.forEach((label, i) => {
      if (!label) return
      svg.append('text')
        .attr('x', 0)
        .attr('y', topPad + i * (cellSize + gap) + cellSize * 0.8)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', '9px')
        .text(label)
    })

    // Cells
    gridDates.forEach((date, i) => {
      const col = Math.floor(i / 7)
      const row = i % 7
      const dateStr = format(date, 'yyyy-MM-dd')
      const completed = completionMap.get(dateStr) ?? 0
      const ratio = completed / habitCount
      const isFuture = dateStr > todayStr
      const isToday = dateStr === todayStr

      svg.append('rect')
        .attr('x', leftPad + col * (cellSize + gap))
        .attr('y', topPad + row * (cellSize + gap))
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('rx', 2)
        .attr('fill', isFuture ? CHART_COLORS.surface : ratio > 0 ? colorScale(ratio) : CHART_COLORS.surfaceLight)
        .attr('opacity', isFuture ? 0.3 : 1)
        .attr('stroke', isToday ? '#7c3aed' : 'none')
        .attr('stroke-width', isToday ? 1.5 : 0)
    })

  }, [width, habitCount, gridDates, completionMap, todayStr, cellSize, colorScale])

  if (habitCount === 0) return null

  return (
    <div ref={containerRef} className="w-full">
      <p className="text-[10px] text-[#606080] mb-1.5">12 Week Overview</p>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  )
}
