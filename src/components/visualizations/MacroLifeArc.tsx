import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Macro Life Arc — age 20-80 timeline showing projected curves for
 * wealth, skill depth, health, and social capital. Current position
 * marked with a vertical "you are here" line.
 */

interface LifeCurve {
  label: string
  color: string
  /** Values from age 20 to 80 (61 data points) */
  values: number[]
}

interface Props {
  currentAge?: number
  curves?: LifeCurve[]
}

function generateDefaultCurves(): LifeCurve[] {
  const ages = Array.from({ length: 61 }, (_, i) => i + 20)

  return [
    {
      label: 'Wealth',
      color: '#FF6B35',
      values: ages.map(a => {
        // Slow build 20-35, acceleration 35-55, plateau 55+
        if (a < 35) return ((a - 20) / 15) * 30
        if (a < 55) return 30 + ((a - 35) / 20) * 55
        return 85 + ((a - 55) / 25) * 10
      }),
    },
    {
      label: 'Skill Depth',
      color: '#3b82f6',
      values: ages.map(a => {
        // Steep early learning, gradual mastery
        if (a < 30) return ((a - 20) / 10) * 40
        if (a < 50) return 40 + ((a - 30) / 20) * 45
        return 85 + ((a - 50) / 30) * 10
      }),
    },
    {
      label: 'Health',
      color: '#22c55e',
      values: ages.map(a => {
        // Peak ~30, gradual decline, steeper after 60
        if (a < 30) return 70 + ((a - 20) / 10) * 25
        if (a < 60) return 95 - ((a - 30) / 30) * 20
        return 75 - ((a - 60) / 20) * 30
      }),
    },
    {
      label: 'Social Capital',
      color: '#8b5cf6',
      values: ages.map(a => {
        // Low 20s, builds through 30-50, plateaus
        if (a < 25) return 15 + ((a - 20) / 5) * 10
        if (a < 45) return 25 + ((a - 25) / 20) * 50
        if (a < 65) return 75 - ((a - 45) / 20) * 10
        return 65 - ((a - 65) / 15) * 15
      }),
    },
  ]
}

export function MacroLifeArc({ currentAge = 30, curves }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const lifeCurves = useMemo(() => curves ?? generateDefaultCurves(), [curves])

  const chartH = 160
  const marginTop = 28
  const marginBottom = 36
  const marginLeft = 24
  const marginRight = 12
  const totalHeight = chartH + marginTop + marginBottom

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
      .text('MACRO LIFE ARC')

    const x = d3.scaleLinear().domain([20, 80]).range([0, innerW])
    const y = d3.scaleLinear().domain([0, 100]).range([chartH, 0])

    // Grid
    for (let v = 0; v <= 100; v += 25) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(v)).attr('y2', y(v))
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 0.5)
    }

    // Decade markers
    for (let age = 20; age <= 80; age += 10) {
      g.append('line')
        .attr('x1', x(age)).attr('x2', x(age))
        .attr('y1', 0).attr('y2', chartH)
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 0.5)

      g.append('text')
        .attr('x', x(age)).attr('y', chartH + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
        .text(age)
    }

    // Draw curves
    lifeCurves.forEach(curve => {
      const line = d3.line<number>()
        .x((_, i) => x(i + 20))
        .y(v => y(v))
        .curve(d3.curveBasis)

      // Area under curve (subtle)
      const area = d3.area<number>()
        .x((_, i) => x(i + 20))
        .y0(chartH)
        .y1(v => y(v))
        .curve(d3.curveBasis)

      g.append('path')
        .datum(curve.values)
        .attr('d', area)
        .attr('fill', curve.color)
        .attr('opacity', 0.03)

      // Split line into lived (solid) and future (dashed)
      const livedIdx = Math.min(currentAge - 20, 60)

      // Lived portion
      if (livedIdx > 0) {
        g.append('path')
          .datum(curve.values.slice(0, livedIdx + 1))
          .attr('d', d3.line<number>()
            .x((_, i) => x(i + 20))
            .y(v => y(v))
            .curve(d3.curveBasis))
          .attr('fill', 'none')
          .attr('stroke', curve.color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.7)
      }

      // Future portion (dashed)
      if (livedIdx < 60) {
        g.append('path')
          .datum(curve.values.slice(livedIdx))
          .attr('d', d3.line<number>()
            .x((_, i) => x(i + livedIdx + 20))
            .y(v => y(v))
            .curve(d3.curveBasis))
          .attr('fill', 'none')
          .attr('stroke', curve.color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3')
          .attr('opacity', 0.35)
      }

      // Label at end
      const endVal = curve.values[curve.values.length - 1]
      g.append('text')
        .attr('x', innerW + 4).attr('y', y(endVal) + 3)
        .attr('fill', curve.color)
        .attr('font-size', 6).attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .attr('opacity', 0.5)
        .text(curve.label)
    })

    // "You Are Here" line
    g.append('line')
      .attr('x1', x(currentAge)).attr('x2', x(currentAge))
      .attr('y1', -6).attr('y2', chartH)
      .attr('stroke', CHART_COLORS.textSecondary)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2')

    g.append('text')
      .attr('x', x(currentAge)).attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textSecondary)
      .attr('font-size', 7).attr('font-weight', 700)
      .attr('font-family', 'var(--font-mono)')
      .text(`YOU (${currentAge})`)

    // Current value dots
    lifeCurves.forEach(curve => {
      const idx = Math.min(currentAge - 20, 60)
      const val = curve.values[idx]
      g.append('circle')
        .attr('cx', x(currentAge)).attr('cy', y(val))
        .attr('r', 3)
        .attr('fill', curve.color)
        .style('filter', `drop-shadow(0 0 4px ${curve.color})`)
    })

  }, [width, lifeCurves, currentAge])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {lifeCurves.map(c => (
            <div key={c.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
              <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{c.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          solid = lived · dashed = projected
        </span>
      </div>
    </div>
  )
}
