import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Trajectory Projection — two curves on same chart.
 * Solid line = "if unchanged" 6-month projection based on current trend.
 * Dashed line = "if +5% weekly improvement" alternate trajectory.
 * The gap between curves is the cost of inaction.
 */

interface Props {
  currentScore?: number     // 0-100
  weeklyDelta?: number      // current weekly change rate (e.g. -0.5)
  improvementRate?: number  // weekly improvement in alternate (e.g. 0.05 = 5%)
  weeksToProject?: number
}

export function TrajectoryProjection({
  currentScore = 62,
  weeklyDelta = -0.3,
  improvementRate = 0.05,
  weeksToProject = 26,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const chartH = 160
  const marginTop = 28
  const marginBottom = 36
  const marginLeft = 32
  const marginRight = 12
  const totalHeight = chartH + marginTop + marginBottom

  const projections = useMemo(() => {
    const unchanged: number[] = []
    const improved: number[] = []

    let u = currentScore
    let im = currentScore

    for (let w = 0; w <= weeksToProject; w++) {
      unchanged.push(Math.max(0, Math.min(100, u)))
      improved.push(Math.max(0, Math.min(100, im)))
      u += weeklyDelta
      // Improved: the weekly delta improves by improvementRate each week
      const improvedDelta = weeklyDelta + (improvementRate * (w + 1))
      im += improvedDelta
    }

    return { unchanged, improved }
  }, [currentScore, weeklyDelta, improvementRate, weeksToProject])

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
      .text('TRAJECTORY PROJECTION')

    const x = d3.scaleLinear().domain([0, weeksToProject]).range([0, innerW])
    const y = d3.scaleLinear().domain([0, 100]).range([chartH, 0])

    // Grid
    for (let v = 0; v <= 100; v += 20) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(v)).attr('y2', y(v))
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)

      g.append('text')
        .attr('x', -4).attr('y', y(v) + 3)
        .attr('text-anchor', 'end')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .text(v)
    }

    // "Now" line
    g.append('line')
      .attr('x1', x(0)).attr('y1', 0)
      .attr('x2', x(0)).attr('y2', chartH)
      .attr('stroke', CHART_COLORS.textMuted)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')

    g.append('text')
      .attr('x', x(0) + 4).attr('y', 8)
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .text('NOW')

    // Gap fill between curves
    const areaGen = d3.area<number>()
      .x((_, i) => x(i))
      .y0((_, i) => y(projections.unchanged[i]))
      .y1((_, i) => y(projections.improved[i]))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(projections.improved)
      .attr('d', areaGen)
      .attr('fill', CHART_COLORS.aligned)
      .attr('opacity', 0.06)

    // Unchanged line (red, solid)
    const unchangedLine = d3.line<number>()
      .x((_, i) => x(i))
      .y(v => y(v))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(projections.unchanged)
      .attr('d', unchangedLine)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.avoiding)
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)

    // Improved line (green, dashed)
    g.append('path')
      .datum(projections.improved)
      .attr('d', unchangedLine)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.aligned)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')
      .attr('opacity', 0.8)

    // End labels
    const endU = projections.unchanged[weeksToProject]
    const endI = projections.improved[weeksToProject]

    g.append('circle')
      .attr('cx', x(weeksToProject)).attr('cy', y(endU))
      .attr('r', 3).attr('fill', CHART_COLORS.avoiding)

    g.append('text')
      .attr('x', x(weeksToProject) - 4).attr('y', y(endU) + 14)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.avoiding)
      .attr('font-size', 9).attr('font-weight', 700)
      .attr('font-family', 'var(--font-mono)')
      .text(`${endU.toFixed(0)}`)

    g.append('circle')
      .attr('cx', x(weeksToProject)).attr('cy', y(endI))
      .attr('r', 3).attr('fill', CHART_COLORS.aligned)

    g.append('text')
      .attr('x', x(weeksToProject) - 4).attr('y', y(endI) - 6)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.aligned)
      .attr('font-size', 9).attr('font-weight', 700)
      .attr('font-family', 'var(--font-mono)')
      .text(`${endI.toFixed(0)}`)

    // Delta callout
    const gap = endI - endU
    g.append('text')
      .attr('x', x(weeksToProject / 2)).attr('y', y((endI + endU) / 2))
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.aligned)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .attr('opacity', 0.6)
      .text(`+${gap.toFixed(0)} pts`)

    // X axis
    for (let w = 0; w <= weeksToProject; w += 4) {
      g.append('text')
        .attr('x', x(w)).attr('y', chartH + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .text(`+${w}w`)
    }

  }, [width, projections, weeksToProject])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: CHART_COLORS.avoiding }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>If unchanged</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-b border-dashed" style={{ borderColor: CHART_COLORS.aligned }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>+5%/wk improvement</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {weeksToProject}w projection
        </span>
      </div>
    </div>
  )
}
