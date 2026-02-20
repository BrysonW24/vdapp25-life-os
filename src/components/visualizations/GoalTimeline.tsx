import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS } from '@/components/visualizations/theme'
import type { Goal, Milestone, Pillar } from '@/types'

type GoalTimelineProps = {
  goals: Goal[]
  milestones: Milestone[]
  pillars: Pillar[]
}

export function GoalTimeline({ goals, milestones, pillars }: GoalTimelineProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const activeGoals = useMemo(() =>
    goals.filter(g => g.status === 'active' || g.status === 'paused').slice(0, 8),
    [goals],
  )

  const rowH = 28
  const margin = { top: 20, right: 8, bottom: 4, left: 8 }
  const height = margin.top + activeGoals.length * rowH + margin.bottom

  useEffect(() => {
    if (!svgRef.current || width === 0 || activeGoals.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const w = width - margin.left - margin.right
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const now = new Date()

    // Time domain: earliest createdAt → latest targetDate or +3 months from now
    const starts = activeGoals.map(gl => new Date(gl.createdAt))
    const ends = activeGoals.map(gl => gl.targetDate ? new Date(gl.targetDate) : d3.timeMonth.offset(now, 3))
    const earliest = d3.min(starts) ?? now
    const latest = d3.max(ends) ?? d3.timeMonth.offset(now, 3)

    const xScale = d3.scaleTime()
      .domain([earliest, latest > now ? latest : d3.timeMonth.offset(now, 1)])
      .range([0, w])

    // X-axis (top)
    const xAxis = d3.axisTop(xScale).ticks(4).tickFormat(d3.timeFormat('%b %y') as unknown as (d: d3.NumberValue, i: number) => string)
    g.append('g')
      .call(xAxis)
      .call(sel => sel.select('.domain').attr('stroke', CHART_COLORS.axisLine))
      .call(sel => sel.selectAll('.tick line').attr('stroke', CHART_COLORS.gridLine))
      .call(sel => sel.selectAll('.tick text').attr('fill', CHART_COLORS.textDim).attr('font-size', '9px'))

    // Today marker
    const todayX = xScale(now)
    g.append('line')
      .attr('x1', todayX).attr('x2', todayX)
      .attr('y1', 0).attr('y2', activeGoals.length * rowH)
      .attr('stroke', CHART_COLORS.violet)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    // Goal bars
    activeGoals.forEach((goal, i) => {
      const y = i * rowH + 4
      const barH = rowH - 8
      const start = new Date(goal.createdAt)
      const end = goal.targetDate ? new Date(goal.targetDate) : d3.timeMonth.offset(now, 3)
      const x1 = Math.max(0, xScale(start))
      const x2 = Math.min(w, xScale(end))
      const pillar = pillars.find(p => p.id === goal.pillarId)
      const color = pillar?.color ?? CHART_COLORS.violet

      // Bar
      g.append('rect')
        .attr('x', x1)
        .attr('y', y)
        .attr('width', Math.max(4, x2 - x1))
        .attr('height', barH)
        .attr('rx', 4)
        .attr('fill', color)
        .attr('opacity', goal.status === 'paused' ? 0.3 : 0.5)

      // Goal label
      g.append('text')
        .attr('x', x1 + 4)
        .attr('y', y + barH / 2 + 3)
        .attr('fill', CHART_COLORS.textPrimary)
        .attr('font-size', '9px')
        .attr('font-weight', '500')
        .text(goal.title.length > 20 ? goal.title.slice(0, 19) + '…' : goal.title)

      // Milestones
      const goalMs = milestones.filter(m => m.goalId === goal.id)
      goalMs.forEach(ms => {
        if (!ms.completedAt) return
        const msX = xScale(new Date(ms.completedAt))
        if (msX < 0 || msX > w) return

        g.append('rect')
          .attr('x', msX - 3)
          .attr('y', y + barH / 2 - 3)
          .attr('width', 6)
          .attr('height', 6)
          .attr('transform', `rotate(45, ${msX}, ${y + barH / 2})`)
          .attr('fill', ms.completed ? CHART_COLORS.emerald : CHART_COLORS.textDim)
      })
    })

  }, [activeGoals, milestones, pillars, width, margin.left, margin.right, margin.top, rowH])

  if (activeGoals.length === 0) return null

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  )
}
