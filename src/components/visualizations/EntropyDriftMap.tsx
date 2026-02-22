import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Entropy & Drift Map — horizontal domain strips showing 30-day rolling
 * drift direction, velocity, and volatility per life domain.
 * Each strip has a sparkline, direction arrow, and drift percentage.
 */

interface DomainDrift {
  domain: string
  color: string
  /** 30 days of values 0-10 */
  values: number[]
}

interface Props {
  data?: DomainDrift[]
}

function generateSample(): DomainDrift[] {
  const domains = [
    { domain: 'Sleep',     color: '#8b5cf6' },
    { domain: 'Deep Work', color: '#3b82f6' },
    { domain: 'Social',    color: '#22c55e' },
    { domain: 'Learning',  color: '#eab308' },
    { domain: 'Finance',   color: '#FF6B35' },
    { domain: 'Health',    color: '#ec4899' },
  ]
  return domains.map(d => {
    const base = 4 + Math.random() * 4
    const trend = (Math.random() - 0.5) * 0.12
    return {
      ...d,
      values: Array.from({ length: 30 }, (_, i) =>
        Math.max(0, Math.min(10, base + trend * i + (Math.random() - 0.5) * 2))
      ),
    }
  })
}

export function EntropyDriftMap({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const domains = useMemo(() => data ?? generateSample(), [data])

  const rowH = 36
  const marginTop = 22
  const marginLeft = 68
  const marginRight = 80
  const totalHeight = marginTop + domains.length * rowH + 8

  useEffect(() => {
    if (!svgRef.current || width < 200) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const sparkW = width - marginLeft - marginRight

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('ENTROPY & DRIFT MAP')

    domains.forEach((d, i) => {
      const y = marginTop + i * rowH
      const vals = d.values

      // Stats
      const first7 = vals.slice(0, 7).reduce((s, v) => s + v, 0) / 7
      const last7 = vals.slice(-7).reduce((s, v) => s + v, 0) / 7
      const driftPct = first7 > 0 ? ((last7 - first7) / first7) * 100 : 0
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length
      const volatility = Math.sqrt(variance)

      // Row background
      svg.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', width).attr('height', rowH - 2)
        .attr('rx', 4)
        .attr('fill', i % 2 === 0 ? 'rgba(30,30,53,0.3)' : 'transparent')

      // Domain label
      svg.append('text')
        .attr('x', 12).attr('y', y + rowH / 2 + 3)
        .attr('fill', d.color)
        .attr('font-size', 9).attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .text(d.domain)

      // Sparkline
      const x = d3.scaleLinear().domain([0, vals.length - 1]).range([marginLeft, marginLeft + sparkW])
      const yScale = d3.scaleLinear().domain([0, 10]).range([y + rowH - 6, y + 4])

      const line = d3.line<number>()
        .x((_, idx) => x(idx))
        .y(v => yScale(v))
        .curve(d3.curveMonotoneX)

      // Sparkline area
      const area = d3.area<number>()
        .x((_, idx) => x(idx))
        .y0(y + rowH - 6)
        .y1(v => yScale(v))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(vals)
        .attr('d', area)
        .attr('fill', d.color)
        .attr('opacity', 0.06)

      svg.append('path')
        .datum(vals)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', d.color)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6)

      // Current value dot
      svg.append('circle')
        .attr('cx', x(vals.length - 1))
        .attr('cy', yScale(vals[vals.length - 1]))
        .attr('r', 2.5)
        .attr('fill', d.color)

      // Drift arrow + percentage
      const rightX = width - marginRight + 8
      const arrow = driftPct > 2 ? '↑' : driftPct < -2 ? '↓' : '→'
      const driftColor = driftPct > 2 ? CHART_COLORS.aligned : driftPct < -2 ? CHART_COLORS.avoiding : CHART_COLORS.drifting

      svg.append('text')
        .attr('x', rightX).attr('y', y + 14)
        .attr('fill', driftColor)
        .attr('font-size', 14).attr('font-weight', 700)
        .text(arrow)

      svg.append('text')
        .attr('x', rightX + 16).attr('y', y + 14)
        .attr('fill', driftColor)
        .attr('font-size', 9).attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .text(`${driftPct >= 0 ? '+' : ''}${driftPct.toFixed(0)}%`)

      // Volatility indicator
      const volLabel = volatility > 2.5 ? 'HIGH' : volatility > 1.5 ? 'MED' : 'LOW'
      const volColor = volatility > 2.5 ? CHART_COLORS.avoiding : volatility > 1.5 ? CHART_COLORS.drifting : CHART_COLORS.textDim

      svg.append('text')
        .attr('x', rightX + 8).attr('y', y + 28)
        .attr('fill', volColor)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .attr('opacity', 0.7)
        .text(`VOL: ${volLabel}`)
    })
  }, [width, domains])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
    </div>
  )
}
