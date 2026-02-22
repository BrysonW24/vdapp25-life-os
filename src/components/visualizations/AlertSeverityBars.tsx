import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS, chartFontSize } from '@/components/visualizations/theme'
import { startOfWeek, subWeeks, format } from 'date-fns'
import type { AdvisoryAlert } from '@/types'

type AlertSeverityBarsProps = {
  alerts: AdvisoryAlert[]
}

const SEVERITY_KEYS = ['challenge', 'warning', 'opportunity', 'insight'] as const
const SEVERITY_LABELS: Record<string, string> = {
  challenge: 'Challenge',
  warning: 'Warning',
  opportunity: 'Opportunity',
  insight: 'Insight',
}
const SEVERITY_COLORS: Record<string, string> = {
  challenge: CHART_COLORS.challenge,
  warning: CHART_COLORS.warning,
  opportunity: CHART_COLORS.opportunity,
  insight: CHART_COLORS.insight,
}

type WeekBucket = {
  week: string
  challenge: number
  warning: number
  opportunity: number
  insight: number
}

export function AlertSeverityBars({ alerts }: AlertSeverityBarsProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const buckets = useMemo(() => {
    const now = new Date()
    const weeks: WeekBucket[] = []

    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
      const weekLabel = format(weekStart, 'd MMM')
      const bucket: WeekBucket = { week: weekLabel, challenge: 0, warning: 0, opportunity: 0, insight: 0 }

      for (const alert of alerts) {
        const alertWeek = startOfWeek(new Date(alert.createdAt), { weekStartsOn: 1 })
        if (format(alertWeek, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')) {
          bucket[alert.severity as keyof Omit<WeekBucket, 'week'>] += 1
        }
      }
      weeks.push(bucket)
    }
    return weeks
  }, [alerts])

  const height = 140
  const margin = { top: 8, right: 8, bottom: 40, left: 24 }

  useEffect(() => {
    if (!svgRef.current || width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleBand()
      .domain(buckets.map(b => b.week))
      .range([0, w])
      .padding(0.35)

    const maxTotal = d3.max(buckets, b => b.challenge + b.warning + b.opportunity + b.insight) ?? 1
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(maxTotal, 1)])
      .range([h, 0])

    const stack = d3.stack<WeekBucket>()
      .keys(SEVERITY_KEYS as unknown as string[])

    const series = stack(buckets)

    series.forEach(s => {
      g.selectAll(`.bar-${s.key}`)
        .data(s)
        .join('rect')
        .attr('x', d => xScale(d.data.week)!)
        .attr('y', d => yScale(d[1]))
        .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])))
        .attr('width', xScale.bandwidth())
        .attr('rx', 3)
        .attr('fill', SEVERITY_COLORS[s.key])
        .attr('opacity', 0.8)
    })

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(sel => sel.select('.domain').attr('stroke', CHART_COLORS.axisLine))
      .call(sel => sel.selectAll('.tick text').attr('fill', CHART_COLORS.textDim).attr('font-size', '9px').attr('dy', 8))

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${margin.left}, ${height - 10})`)
    SEVERITY_KEYS.forEach((key, i) => {
      const lx = i * (w / 4)
      legend.append('rect').attr('x', lx).attr('y', 0).attr('width', 6).attr('height', 6).attr('rx', 1).attr('fill', SEVERITY_COLORS[key])
      legend.append('text').attr('x', lx + 10).attr('y', 6).attr('fill', CHART_COLORS.textDim).attr('font-size', '8px').text(SEVERITY_LABELS[key])
    })

  }, [buckets, width, height, margin.left, margin.right, margin.top, margin.bottom])

  const totalAlerts = buckets.reduce((sum, b) => sum + b.challenge + b.warning + b.opportunity + b.insight, 0)
  if (totalAlerts === 0) return null

  return (
    <div ref={containerRef} className="w-full">
      <p className="text-[10px] text-[#606080] mb-1.5">Alert Trend — Last 4 Weeks</p>
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  )
}
