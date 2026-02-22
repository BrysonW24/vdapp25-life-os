import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Time Bleed Analysis — stacked weekly bars categorizing time into:
 * Intentional, Maintenance, Reactive, Escapism, Investment.
 * Shows leakage percentage and annualized opportunity cost.
 */

interface WeekTime {
  week: string
  intentional: number  // hours
  maintenance: number
  reactive: number
  escapism: number
  investment: number
}

interface Props {
  data?: WeekTime[]
}

const CATEGORIES = [
  { key: 'intentional', label: 'Intentional', color: '#22c55e' },
  { key: 'investment',  label: 'Investment',  color: '#3b82f6' },
  { key: 'maintenance', label: 'Maintenance', color: '#eab308' },
  { key: 'reactive',    label: 'Reactive',    color: '#FF6B35' },
  { key: 'escapism',    label: 'Escapism',    color: '#ef4444' },
] as const

function generateSample(): WeekTime[] {
  return Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    intentional: 30 + Math.random() * 20,
    maintenance: 20 + Math.random() * 10,
    reactive: 10 + Math.random() * 15,
    escapism: 5 + Math.random() * 12,
    investment: 8 + Math.random() * 10,
  }))
}

export function TimeBleedAnalysis({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const weeks = useMemo(() => data ?? generateSample(), [data])

  const chartH = 140
  const marginTop = 28
  const marginBottom = 50
  const marginLeft = 28
  const marginRight = 8
  const totalHeight = chartH + marginTop + marginBottom

  const stats = useMemo(() => {
    const totals = weeks.map(w => w.intentional + w.maintenance + w.reactive + w.escapism + w.investment)
    const avgReactive = weeks.reduce((s, w) => s + w.reactive, 0) / weeks.length
    const avgEscapism = weeks.reduce((s, w) => s + w.escapism, 0) / weeks.length
    const avgTotal = totals.reduce((s, t) => s + t, 0) / totals.length
    const bleedPct = avgTotal > 0 ? ((avgReactive + avgEscapism) / avgTotal) * 100 : 0
    const annualBleed = (avgReactive + avgEscapism) * 52
    return { bleedPct, annualBleed, avgReactive, avgEscapism }
  }, [weeks])

  useEffect(() => {
    if (!svgRef.current || width < 200) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerW = width - marginLeft - marginRight
    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('TIME BLEED ANALYSIS')

    const stackKeys = CATEGORIES.map(c => c.key)
    const maxTotal = d3.max(weeks, w =>
      stackKeys.reduce((s, k) => s + (w as any)[k], 0)
    ) ?? 168

    const x = d3.scaleBand()
      .domain(weeks.map(w => w.week))
      .range([0, innerW])
      .padding(0.25)

    const y = d3.scaleLinear()
      .domain([0, maxTotal])
      .range([chartH, 0])

    // Gridlines
    for (let h = 0; h <= maxTotal; h += 20) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(h)).attr('y2', y(h))
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
    }

    // 168hr reference line
    if (maxTotal >= 160) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(168)).attr('y2', y(168))
        .attr('stroke', CHART_COLORS.textDim)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '4,3')

      g.append('text')
        .attr('x', innerW + 2).attr('y', y(168) + 3)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .text('168h')
    }

    // Stacked bars
    weeks.forEach(w => {
      const bx = x(w.week)!
      const bw = x.bandwidth()
      let cumY = 0

      CATEGORIES.forEach(cat => {
        const val = (w as any)[cat.key] as number
        const barY = y(cumY + val)
        const barH = y(cumY) - barY

        g.append('rect')
          .attr('x', bx).attr('y', barY)
          .attr('width', bw).attr('height', barH)
          .attr('rx', 1.5)
          .attr('fill', cat.color)
          .attr('opacity', cat.key === 'escapism' || cat.key === 'reactive' ? 0.7 : 0.5)

        cumY += val
      })

      // X label
      g.append('text')
        .attr('x', bx + bw / 2).attr('y', chartH + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .text(w.week)
    })

    // Opportunity cost callout
    const ocY = chartH + 28
    svg.append('text')
      .attr('x', width / 2).attr('y', marginTop + ocY)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.avoiding)
      .attr('font-size', 9).attr('font-weight', 600)
      .attr('font-family', 'var(--font-mono)')
      .text(`${stats.annualBleed.toFixed(0)} hrs/year lost to reactive + escapism`)

  }, [width, weeks, stats])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <div key={c.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: c.color, opacity: 0.7 }} />
              <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{c.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[8px] text-[#ef4444] font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
          {stats.bleedPct.toFixed(0)}% bleed
        </span>
      </div>
    </div>
  )
}
