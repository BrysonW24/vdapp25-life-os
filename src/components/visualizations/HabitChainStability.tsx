import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Habit Chain Stability — waveform-style graph showing consistency
 * of habit execution. High oscillation = unstable discipline.
 * Stable rhythm = compounding engine. Measures chain density,
 * recovery speed after breaks, and volatility.
 */

interface Props {
  /** 90 days of habit adherence 0-1 (rolling 3-day average) */
  data?: number[]
  habitName?: string
}

function generateSample(): number[] {
  const days: number[] = []
  let val = 0.7
  for (let i = 0; i < 90; i++) {
    // Simulate consistency with occasional breaks
    const isBreak = Math.random() < 0.08
    if (isBreak) val = Math.max(0, val - 0.3 - Math.random() * 0.3)
    else val = Math.min(1, val + (Math.random() - 0.4) * 0.15)
    days.push(val)
  }
  // Rolling 3-day average
  return days.map((_, i) => {
    const slice = days.slice(Math.max(0, i - 2), i + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

export function HabitChainStability({ data, habitName = 'Habit Chain' }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const values = useMemo(() => data ?? generateSample(), [data])

  const chartH = 100
  const marginTop = 24
  const marginBottom = 32
  const marginLeft = 8
  const marginRight = 8
  const totalHeight = chartH + marginTop + marginBottom

  const stats = useMemo(() => {
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
    const volatility = Math.sqrt(variance)

    // Recovery speed: average days to get back above 0.6 after dropping below 0.4
    let recoveryDays: number[] = []
    let inDip = false
    let dipStart = 0
    values.forEach((v, i) => {
      if (!inDip && v < 0.4) { inDip = true; dipStart = i }
      if (inDip && v > 0.6) { recoveryDays.push(i - dipStart); inDip = false }
    })
    const avgRecovery = recoveryDays.length > 0
      ? recoveryDays.reduce((s, d) => s + d, 0) / recoveryDays.length
      : 0

    // Chain density: % of days above 0.5
    const density = values.filter(v => v > 0.5).length / values.length

    return { volatility, avgRecovery, density }
  }, [values])

  useEffect(() => {
    if (!svgRef.current || width < 200) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerW = width - marginLeft - marginRight

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('HABIT CHAIN STABILITY')

    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)

    const x = d3.scaleLinear().domain([0, values.length - 1]).range([0, innerW])
    const y = d3.scaleLinear().domain([0, 1]).range([chartH, 0])

    // Stability threshold zone (0.5-0.8 = healthy zone)
    g.append('rect')
      .attr('x', 0).attr('y', y(0.8))
      .attr('width', innerW).attr('height', y(0.5) - y(0.8))
      .attr('fill', CHART_COLORS.aligned)
      .attr('opacity', 0.03)

    // Threshold lines
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0.5)).attr('y2', y(0.5))
      .attr('stroke', CHART_COLORS.drifting)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.3)

    // Waveform area
    const area = d3.area<number>()
      .x((_, i) => x(i))
      .y0(chartH)
      .y1(v => y(v))
      .curve(d3.curveBasis)

    // Color gradient for area
    const defs = svg.append('defs')
    const gradId = 'habit-chain-grad'
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    grad.append('stop').attr('offset', '0%').attr('stop-color', CHART_COLORS.aligned).attr('stop-opacity', 0.2)
    grad.append('stop').attr('offset', '50%').attr('stop-color', CHART_COLORS.drifting).attr('stop-opacity', 0.1)
    grad.append('stop').attr('offset', '100%').attr('stop-color', CHART_COLORS.avoiding).attr('stop-opacity', 0.05)

    g.append('path')
      .datum(values)
      .attr('d', area)
      .attr('fill', `url(#${gradId})`)

    // Waveform line
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(v => y(v))
      .curve(d3.curveBasis)

    g.append('path')
      .datum(values)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.aligned)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.7)

    // Highlight dips (below 0.4)
    values.forEach((v, i) => {
      if (v < 0.4) {
        g.append('circle')
          .attr('cx', x(i)).attr('cy', y(v))
          .attr('r', 2)
          .attr('fill', CHART_COLORS.avoiding)
          .attr('opacity', 0.5)
      }
    })

    // Current value dot
    const lastV = values[values.length - 1]
    g.append('circle')
      .attr('cx', x(values.length - 1)).attr('cy', y(lastV))
      .attr('r', 3.5)
      .attr('fill', lastV > 0.6 ? CHART_COLORS.aligned : lastV > 0.4 ? CHART_COLORS.drifting : CHART_COLORS.avoiding)
      .style('filter', `drop-shadow(0 0 4px ${lastV > 0.6 ? CHART_COLORS.aligned : CHART_COLORS.avoiding})`)

    // X axis labels
    g.append('text')
      .attr('x', 0).attr('y', chartH + 14)
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .text('90d ago')

    g.append('text')
      .attr('x', innerW).attr('y', chartH + 14)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .text('today')

  }, [width, values])

  const stabilityLabel = stats.volatility < 0.12 ? 'STABLE' : stats.volatility < 0.2 ? 'OSCILLATING' : 'UNSTABLE'
  const stabilityColor = stats.volatility < 0.12 ? CHART_COLORS.aligned : stats.volatility < 0.2 ? CHART_COLORS.drifting : CHART_COLORS.avoiding

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: stabilityColor }} />
            <span className="text-[8px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: stabilityColor }}>
              {stabilityLabel}
            </span>
          </div>
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
            density {(stats.density * 100).toFixed(0)}%
          </span>
          {stats.avgRecovery > 0 && (
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
              recovery {stats.avgRecovery.toFixed(1)}d
            </span>
          )}
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {habitName}
        </span>
      </div>
    </div>
  )
}
