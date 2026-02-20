import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS } from '@/components/visualizations/theme'
import { parseISO } from 'date-fns'
import type { Reflection } from '@/types'

type MoodEnergyLineProps = {
  reflections: Reflection[]
}

type DataPoint = { date: Date; energy: number; mood: number }

export function MoodEnergyLine({ reflections }: MoodEnergyLineProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const data = useMemo(() => {
    const byDate = new Map<string, { energySum: number; moodSum: number; count: number }>()
    for (const r of reflections) {
      const existing = byDate.get(r.date)
      if (existing) {
        existing.energySum += r.energyLevel
        existing.moodSum += r.mood
        existing.count += 1
      } else {
        byDate.set(r.date, { energySum: r.energyLevel, moodSum: r.mood, count: 1 })
      }
    }
    const points: DataPoint[] = []
    for (const [dateStr, v] of byDate) {
      points.push({
        date: parseISO(dateStr),
        energy: Math.round(v.energySum / v.count),
        mood: Math.round(v.moodSum / v.count),
      })
    }
    return points.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [reflections])

  const height = 160
  const margin = { top: 16, right: 12, bottom: 24, left: 24 }

  useEffect(() => {
    if (!svgRef.current || width === 0 || data.length < 2) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, w])

    const yScale = d3.scaleLinear().domain([1, 10]).range([h, 0])

    // Grid lines
    for (const tick of [2, 4, 6, 8]) {
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', yScale(tick)).attr('y2', yScale(tick))
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 1)
    }

    // Y-axis labels
    for (const tick of [2, 4, 6, 8, 10]) {
      g.append('text')
        .attr('x', -6).attr('y', yScale(tick) + 3)
        .attr('text-anchor', 'end')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', '9px')
        .text(tick)
    }

    // X-axis labels (first & last date)
    const xAxis = d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%d %b') as unknown as (d: d3.NumberValue, i: number) => string)
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', CHART_COLORS.axisLine))
      .call(g => g.selectAll('.tick line').attr('stroke', CHART_COLORS.gridLine))
      .call(g => g.selectAll('.tick text').attr('fill', CHART_COLORS.textDim).attr('font-size', '9px'))

    // Energy area + line
    const energyArea = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(h)
      .y1(d => yScale(d.energy))
      .curve(d3.curveMonotoneX)

    const energyLine = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.energy))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(data)
      .attr('d', energyArea)
      .attr('fill', CHART_COLORS.amber)
      .attr('opacity', 0.1)

    g.append('path').datum(data)
      .attr('d', energyLine)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.amber)
      .attr('stroke-width', 2)

    // Mood area + line
    const moodArea = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(h)
      .y1(d => yScale(d.mood))
      .curve(d3.curveMonotoneX)

    const moodLine = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.mood))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(data)
      .attr('d', moodArea)
      .attr('fill', CHART_COLORS.violet)
      .attr('opacity', 0.1)

    g.append('path').datum(data)
      .attr('d', moodLine)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.violet)
      .attr('stroke-width', 2)

    // Data point dots
    g.selectAll('.energy-dot')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.energy))
      .attr('r', 2.5)
      .attr('fill', CHART_COLORS.amber)

    g.selectAll('.mood-dot')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.mood))
      .attr('r', 2.5)
      .attr('fill', CHART_COLORS.violet)

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width - 120}, 6)`)
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 3).attr('fill', CHART_COLORS.amber)
    legend.append('text').attr('x', 8).attr('y', 3).attr('fill', CHART_COLORS.textMuted).attr('font-size', '9px').text('Energy')
    legend.append('circle').attr('cx', 55).attr('cy', 0).attr('r', 3).attr('fill', CHART_COLORS.violet)
    legend.append('text').attr('x', 63).attr('y', 3).attr('fill', CHART_COLORS.textMuted).attr('font-size', '9px').text('Mood')

  }, [data, width, height, margin.left, margin.right, margin.top, margin.bottom])

  if (data.length < 2) return null

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  )
}
