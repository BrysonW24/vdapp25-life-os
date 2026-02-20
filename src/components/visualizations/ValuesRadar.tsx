import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from '@/components/visualizations/useContainerSize'
import { CHART_COLORS } from '@/components/visualizations/theme'

type ValuesRadarProps = {
  values: string[]
}

export function ValuesRadar({ values }: ValuesRadarProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const size = Math.min(width, 260)
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 32

  useEffect(() => {
    if (!svgRef.current || size === 0 || values.length < 3) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const n = values.length
    const angleSlice = (2 * Math.PI) / n
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`)

    // Concentric rings
    for (const level of [0.33, 0.66, 1]) {
      g.append('circle')
        .attr('cx', 0).attr('cy', 0).attr('r', level * maxR)
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', level === 1 ? 1 : 0.5)
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

    // Polygon (all values at 100%)
    const points = values.map((_v, i) => {
      const angle = angleSlice * i - Math.PI / 2
      return [maxR * Math.cos(angle), maxR * Math.sin(angle)] as [number, number]
    })

    const lineGen = d3.line<[number, number]>().x(d => d[0]).y(d => d[1])
    const pathData = lineGen([...points, points[0]])

    g.append('path')
      .attr('d', pathData)
      .attr('fill', CHART_COLORS.violet)
      .attr('fill-opacity', 0.15)
      .attr('stroke', CHART_COLORS.violet)
      .attr('stroke-width', 2)

    // Vertex dots
    points.forEach((pt) => {
      g.append('circle')
        .attr('cx', pt[0]).attr('cy', pt[1])
        .attr('r', 3)
        .attr('fill', CHART_COLORS.violet)
    })

    // Labels
    values.forEach((v, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const labelR = maxR + 14
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
        .text(v)
    })

  }, [values, size, cx, cy, maxR])

  if (values.length < 3) return null

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
    </div>
  )
}
