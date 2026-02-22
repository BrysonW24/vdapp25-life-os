import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Goal Erosion Timeline — shows how a declared goal erodes under specific
 * conditions. Overlays goal activity against disruption factors to reveal
 * the exact pattern of abandonment.
 *
 * "The system builds your Goal Erosion Pattern — the exact conditions
 *  under which you abandon study."
 */

interface WeekData {
  week: string        // label e.g. "W1", "W2"
  goalSessions: number // sessions this week (0-7)
  workIntensity: number // 0-10
  sleepQuality: number  // 0-10
  newProjects: number   // projects started this week
}

interface Props {
  goalName?: string
  data?: WeekData[]
}

function generateSampleData(): WeekData[] {
  const weeks: WeekData[] = []
  for (let i = 0; i < 12; i++) {
    const isHighWork = i >= 3 && i <= 5 || i >= 9
    const isChaos = i === 4 || i === 10
    weeks.push({
      week: `W${i + 1}`,
      goalSessions: isHighWork
        ? Math.max(0, Math.round(1 + Math.random() * 1.5))
        : Math.round(3 + Math.random() * 3),
      workIntensity: isHighWork ? 6 + Math.random() * 4 : 2 + Math.random() * 4,
      sleepQuality: isHighWork ? 3 + Math.random() * 3 : 6 + Math.random() * 3,
      newProjects: isChaos ? Math.round(1 + Math.random() * 2) : Math.random() > 0.8 ? 1 : 0,
    })
  }
  return weeks
}

export function GoalErosionTimeline({ goalName = 'Chinese Study', data }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const weeks = useMemo(() => data ?? generateSampleData(), [data])

  const chartH = 140
  const marginTop = 32
  const marginBottom = 40
  const marginLeft = 28
  const marginRight = 12
  const totalHeight = chartH + marginTop + marginBottom

  useEffect(() => {
    if (!svgRef.current || width < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerW = width - marginLeft - marginRight
    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)

    const x = d3.scaleBand()
      .domain(weeks.map(w => w.week))
      .range([0, innerW])
      .padding(0.2)

    const yGoal = d3.scaleLinear()
      .domain([0, 7])
      .range([chartH, 0])

    const yWork = d3.scaleLinear()
      .domain([0, 10])
      .range([chartH, 0])

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('GOAL EROSION TIMELINE')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .text(goalName)

    // Gridlines
    for (let i = 0; i <= 7; i++) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', yGoal(i)).attr('y2', yGoal(i))
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
    }

    // Goal session bars
    weeks.forEach(w => {
      const barX = x(w.week)!
      const barW = x.bandwidth()

      // Goal sessions bar
      const barH = chartH - yGoal(w.goalSessions)
      const barColor = w.goalSessions >= 4 ? CHART_COLORS.aligned
        : w.goalSessions >= 2 ? CHART_COLORS.drifting
        : CHART_COLORS.avoiding

      g.append('rect')
        .attr('x', barX)
        .attr('y', yGoal(w.goalSessions))
        .attr('width', barW)
        .attr('height', barH)
        .attr('rx', 2)
        .attr('fill', barColor)
        .attr('opacity', 0.6)

      // Session count label
      g.append('text')
        .attr('x', barX + barW / 2)
        .attr('y', yGoal(w.goalSessions) - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', barColor)
        .attr('font-size', 7)
        .attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .text(w.goalSessions)

      // New project markers (red dots at top)
      if (w.newProjects > 0) {
        for (let p = 0; p < w.newProjects; p++) {
          g.append('circle')
            .attr('cx', barX + barW / 2 + (p - (w.newProjects - 1) / 2) * 6)
            .attr('cy', -6)
            .attr('r', 3)
            .attr('fill', '#ef4444')
            .attr('opacity', 0.7)
        }
        g.append('text')
          .attr('x', barX + barW / 2)
          .attr('y', -14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', 5)
          .attr('font-family', 'var(--font-mono)')
          .attr('opacity', 0.7)
          .text('NEW')
      }
    })

    // Work intensity line overlay
    const workLine = d3.line<WeekData>()
      .x(d => x(d.week)! + x.bandwidth() / 2)
      .y(d => yWork(d.workIntensity))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(weeks)
      .attr('d', workLine)
      .attr('fill', 'none')
      .attr('stroke', '#FF6B35')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0.5)

    // Sleep quality line overlay
    const sleepLine = d3.line<WeekData>()
      .x(d => x(d.week)! + x.bandwidth() / 2)
      .y(d => yWork(d.sleepQuality))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(weeks)
      .attr('d', sleepLine)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.4)

    // X axis labels
    weeks.forEach(w => {
      g.append('text')
        .attr('x', x(w.week)! + x.bandwidth() / 2)
        .attr('y', chartH + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6)
        .attr('font-family', 'var(--font-mono)')
        .text(w.week)
    })

    // Erosion zones — highlight weeks where goal dropped to 0-1
    weeks.forEach(w => {
      if (w.goalSessions <= 1) {
        const barX = x(w.week)!
        g.append('rect')
          .attr('x', barX - 2)
          .attr('y', -10)
          .attr('width', x.bandwidth() + 4)
          .attr('height', chartH + 10)
          .attr('rx', 3)
          .attr('fill', 'rgba(239, 68, 68, 0.04)')
          .attr('stroke', 'rgba(239, 68, 68, 0.1)')
          .attr('stroke-width', 0.5)
      }
    })

    // Y-axis labels
    g.append('text')
      .attr('x', -4)
      .attr('y', yGoal(7) + 3)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 6)
      .attr('font-family', 'var(--font-mono)')
      .text('7')

    g.append('text')
      .attr('x', -4)
      .attr('y', yGoal(0) + 3)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 6)
      .attr('font-family', 'var(--font-mono)')
      .text('0')

  }, [width, weeks, goalName])

  // Stats
  const avgSessions = (weeks.reduce((s, w) => s + w.goalSessions, 0) / weeks.length).toFixed(1)
  const erosionWeeks = weeks.filter(w => w.goalSessions <= 1).length

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ background: CHART_COLORS.aligned, opacity: 0.6 }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: '#FF6B35' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Work</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: '#3b82f6' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Sleep</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>New project</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-[#808090]" style={{ fontFamily: 'var(--font-mono)' }}>
            avg {avgSessions}/wk
          </span>
          <span className="text-[8px] text-[#ef4444]" style={{ fontFamily: 'var(--font-mono)' }}>
            {erosionWeeks} erosion wks
          </span>
        </div>
      </div>
    </div>
  )
}
