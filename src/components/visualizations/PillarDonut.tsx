import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS } from '@/components/visualizations/theme'
import type { PillarAlignment } from '@/lib/gapEngine'

type PillarDonutProps = {
  alignments: PillarAlignment[]
  overallScore: number
}

export function PillarDonut({ alignments, overallScore }: PillarDonutProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const size = Math.min(width, 56)
  const outerR = size / 2
  const innerR = outerR * 0.6

  useEffect(() => {
    if (!svgRef.current || size === 0 || alignments.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`)

    const pie = d3.pie<PillarAlignment>()
      .value(1)
      .sort(null)
      .padAngle(0.04)

    const arc = d3.arc<d3.PieArcDatum<PillarAlignment>>()
      .innerRadius(innerR)
      .outerRadius(outerR - 1)
      .cornerRadius(2)

    const arcs = pie(alignments)

    g.selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.pillarColor)
      .attr('opacity', d => 0.4 + (d.data.score / 100) * 0.6)

    // Center score
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', CHART_COLORS.textPrimary)
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .text(overallScore)

  }, [alignments, overallScore, size, innerR, outerR])

  if (alignments.length === 0) return null

  return (
    <div ref={containerRef} className="w-14 h-14 flex-shrink-0">
      <svg ref={svgRef} width={size} height={size} />
    </div>
  )
}
