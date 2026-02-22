import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Impact Allocation Map
 * Double donut: outer ring = cause areas (% of giving by cause),
 * inner ring = geographic split (Local / National / Global).
 * Annual and lifetime giving callouts.
 */

interface CauseSlice {
  label: string
  color: string
  pct: number
}

const CAUSES: CauseSlice[] = [
  { label: 'Education',  color: '#3b82f6', pct: 28 },
  { label: 'Health',     color: '#22c55e', pct: 22 },
  { label: 'Poverty',    color: '#FF6B35', pct: 20 },
  { label: 'Climate',    color: '#8b5cf6', pct: 18 },
  { label: 'AI Safety',  color: '#eab308', pct: 12 },
]

const GEO: CauseSlice[] = [
  { label: 'Global',    color: '#3b82f680', pct: 55 },
  { label: 'National',  color: '#22c55e80', pct: 30 },
  { label: 'Local',     color: '#FF6B3580', pct: 15 },
]

const ANNUAL_GIVING = 12400   // AUD
const LIFETIME_GIVING = 890000

export function ImpactAllocationMap() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const size = Math.min(Math.max(width - 16, 120), 340)
  const height = size + 60

  useEffect(() => {
    if (!svgRef.current || size < 120) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2 + 24
    const outerR = size / 2 - 10
    const midR = outerR - 28
    const innerR = midR - 6
    const geoR = innerR - 4

    // Title
    svg.append('text')
      .attr('x', cx).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('IMPACT ALLOCATION MAP')

    // Arc generators
    const outerArc = d3.arc<d3.PieArcDatum<CauseSlice>>()
      .innerRadius(midR)
      .outerRadius(outerR)
      .padAngle(0.03)
      .cornerRadius(3)

    const innerArc = d3.arc<d3.PieArcDatum<CauseSlice>>()
      .innerRadius(geoR)
      .outerRadius(innerR)
      .padAngle(0.04)
      .cornerRadius(2)

    const pie = d3.pie<CauseSlice>().value(d => d.pct).sort(null)

    // Outer ring — causes
    const causeArcs = pie(CAUSES)
    causeArcs.forEach(d => {
      svg.append('path')
        .attr('d', outerArc(d) ?? '')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', d.data.color)
        .attr('opacity', 0.85)

      // Label if wide enough
      const [lx, ly] = outerArc.centroid(d)
      if (d.endAngle - d.startAngle > 0.4) {
        svg.append('text')
          .attr('x', cx + lx).attr('y', cy + ly + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', 7).attr('font-weight', 600)
          .attr('font-family', 'var(--font-mono)')
          .text(`${d.data.pct}%`)
      }
    })

    // Inner ring — geography
    const geoArcs = pie(GEO)
    geoArcs.forEach(d => {
      svg.append('path')
        .attr('d', innerArc(d) ?? '')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', d.data.color)
        .attr('opacity', 0.9)
    })

    // Centre readout
    svg.append('text')
      .attr('x', cx).attr('y', cy - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.accent)
      .attr('font-size', 18).attr('font-weight', 800)
      .attr('font-family', 'var(--font-sans)')
      .text(`$${(ANNUAL_GIVING / 1000).toFixed(1)}k`)

    svg.append('text')
      .attr('x', cx).attr('y', cy + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text('/ YEAR')

    // Legend at bottom
    const legY = size + 26
    const cols = size < 240 ? 3 : CAUSES.length
    const colW = size / cols
    CAUSES.forEach((c, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * colW + 4
      const y = legY + row * 14

      svg.append('rect')
        .attr('x', x).attr('y', y - 6).attr('width', 8).attr('height', 6)
        .attr('fill', c.color).attr('rx', 1)

      svg.append('text')
        .attr('x', x + 11).attr('y', y)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
        .text(`${c.label} ${c.pct}%`)
    })

    // Lifetime giving callout
    svg.append('text')
      .attr('x', size - 4).attr('y', size + 26)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.aligned)
      .attr('font-size', 8).attr('font-weight', 700)
      .attr('font-family', 'var(--font-mono)')
      .text(`$${(LIFETIME_GIVING / 1000).toFixed(0)}k`)

    svg.append('text')
      .attr('x', size - 4).attr('y', size + 38)
      .attr('text-anchor', 'end')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .text('LIFETIME TARGET')
  }, [size])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
