import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS } from '@/components/visualizations/theme'
import type { PillarAlignment } from '@/lib/gapEngine'

type IntelligenceSpiderProps = {
  alignments: PillarAlignment[]
  overallScore: number
}

export function IntelligenceSpider({ alignments, overallScore }: IntelligenceSpiderProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const size = Math.min(width, 320)
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 36

  useEffect(() => {
    if (!svgRef.current || size === 0 || alignments.length < 2) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const n = alignments.length
    const angleSlice = (2 * Math.PI) / n

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)

    // Concentric rings
    for (const level of [25, 50, 75, 100]) {
      const r = (level / 100) * maxR
      g.append('circle')
        .attr('cx', 0).attr('cy', 0).attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', level === 100 ? 1 : 0.5)
    }

    // Ring labels
    for (const level of [25, 50, 75]) {
      g.append('text')
        .attr('x', 3)
        .attr('y', -(level / 100) * maxR + 3)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', '8px')
        .text(level)
    }

    // Axis lines
    for (let i = 0; i < n; i++) {
      const angle = angleSlice * i - Math.PI / 2
      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', maxR * Math.cos(angle))
        .attr('y2', maxR * Math.sin(angle))
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
    }

    // Data polygon
    const points = alignments.map((a, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const r = (a.score / 100) * maxR
      return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number]
    })

    const lineGen = d3.line<[number, number]>().x(d => d[0]).y(d => d[1])
    const pathData = lineGen([...points, points[0]])

    g.append('path')
      .attr('d', pathData)
      .attr('fill', '#7c3aed')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 2)

    // Vertex dots
    points.forEach((pt, i) => {
      g.append('circle')
        .attr('cx', pt[0]).attr('cy', pt[1])
        .attr('r', 3.5)
        .attr('fill', alignments[i].pillarColor)
        .attr('stroke', CHART_COLORS.surface)
        .attr('stroke-width', 1.5)
    })

    // Labels
    alignments.forEach((a, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const labelR = maxR + 16
      const x = labelR * Math.cos(angle)
      const y = labelR * Math.sin(angle)

      const anchor = Math.abs(Math.cos(angle)) < 0.1
        ? 'middle'
        : Math.cos(angle) > 0 ? 'start' : 'end'

      g.append('text')
        .attr('x', x)
        .attr('y', y + 4)
        .attr('text-anchor', anchor)
        .attr('fill', CHART_COLORS.textSecondary)
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(a.pillarName.length > 12 ? a.pillarName.slice(0, 11) + '…' : a.pillarName)
    })

    // Center score
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', CHART_COLORS.textPrimary)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text(overallScore)

  }, [alignments, overallScore, size, cx, cy, maxR])

  if (alignments.length < 2) return null

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
    </div>
  )
}
