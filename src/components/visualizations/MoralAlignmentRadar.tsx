import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Moral Alignment Radar
 * 7-domain spider chart: Family, Wealth Creation, Health,
 * Community, Philanthropy, Spiritual Depth, Civilisation Impact.
 * Single polygon — honest self-audit (no target).
 * Monthly self-rating 1–10.
 */

interface Domain {
  label: string
  score: number   // 1-10 self-rating
  color: string
}

const DOMAINS: Domain[] = [
  { label: 'Family',           score: 8.2, color: '#FF6B35' },
  { label: 'Wealth\nCreation', score: 7.5, color: '#eab308' },
  { label: 'Health',           score: 7.0, color: '#22c55e' },
  { label: 'Community',        score: 6.5, color: '#3b82f6' },
  { label: 'Philanthropy',     score: 6.8, color: '#8b5cf6' },
  { label: 'Spiritual\nDepth', score: 5.5, color: '#ec4899' },
  { label: 'Civilisation',     score: 6.2, color: '#FF6B35' },
]

export function MoralAlignmentRadar() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const size = Math.min(Math.max(width - 16, 100), 340)
  const height = size + 30

  useEffect(() => {
    if (!svgRef.current || size < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2 + 20
    const maxR = size / 2 - 44
    const n = DOMAINS.length
    const angles = DOMAINS.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2)

    const toPoint = (angle: number, r: number) => ({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    })

    // Title
    svg.append('text')
      .attr('x', cx).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('MORAL ALIGNMENT RADAR')

    // Rings at 2.5, 5, 7.5, 10
    const rings = [2.5, 5, 7.5, 10]
    rings.forEach(val => {
      const r = (val / 10) * maxR
      const points = angles.map(a => toPoint(a, r))
      const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
      svg.append('path')
        .attr('d', path)
        .attr('fill', val === 10 ? `${CHART_COLORS.textDim}08` : 'none')
        .attr('stroke', val === 10 ? CHART_COLORS.border : CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', val === 10 ? 'none' : '2,4')
      if (val < 10) {
        svg.append('text')
          .attr('x', cx + 3)
          .attr('y', cy - r + 3)
          .attr('fill', CHART_COLORS.textDim)
          .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
          .text(`${val}`)
      }
    })

    // Spokes
    angles.forEach(angle => {
      const end = toPoint(angle, maxR)
      svg.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', end.x).attr('y2', end.y)
        .attr('stroke', CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
    })

    // Score polygon
    const scorePoints = DOMAINS.map((d, i) => toPoint(angles[i], (d.score / 10) * maxR))
    const scorePath = scorePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

    svg.append('path')
      .attr('d', scorePath)
      .attr('fill', `${CHART_COLORS.accent}20`)
      .attr('stroke', CHART_COLORS.accent)
      .attr('stroke-width', 2)

    // Dots
    scorePoints.forEach((p, i) => {
      const col = DOMAINS[i].score >= 8 ? CHART_COLORS.aligned
        : DOMAINS[i].score >= 6 ? CHART_COLORS.drifting
        : CHART_COLORS.avoiding

      svg.append('circle')
        .attr('cx', p.x).attr('cy', p.y).attr('r', 4)
        .attr('fill', col)
        .attr('stroke', CHART_COLORS.bg)
        .attr('stroke-width', 1)
    })

    // Domain labels
    DOMAINS.forEach((d, i) => {
      const angle = angles[i]
      const labelR = maxR + 20
      const lx = cx + Math.cos(angle) * labelR
      const ly = cy + Math.sin(angle) * labelR
      const anchor = Math.cos(angle) > 0.1 ? 'start' : Math.cos(angle) < -0.1 ? 'end' : 'middle'

      const lines = d.label.split('\n')
      lines.forEach((line, li) => {
        svg.append('text')
          .attr('x', lx)
          .attr('y', ly + li * 9 - (lines.length - 1) * 4.5)
          .attr('text-anchor', anchor)
          .attr('fill', CHART_COLORS.textSecondary)
          .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
          .text(line)
      })

      const scoreColor = d.score >= 8 ? CHART_COLORS.aligned : d.score >= 6 ? CHART_COLORS.drifting : CHART_COLORS.avoiding
      svg.append('text')
        .attr('x', lx)
        .attr('y', ly + lines.length * 9 - (lines.length - 1) * 4.5)
        .attr('text-anchor', anchor)
        .attr('fill', scoreColor)
        .attr('font-size', 8).attr('font-weight', 700)
        .attr('font-family', 'var(--font-mono)')
        .text(d.score.toFixed(1))
    })

    // Overall average
    const avg = DOMAINS.reduce((s, d) => s + d.score, 0) / DOMAINS.length
    svg.append('text')
      .attr('x', cx).attr('y', cy - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.accent)
      .attr('font-size', 22).attr('font-weight', 800)
      .attr('font-family', 'var(--font-sans)')
      .text(avg.toFixed(1))
    svg.append('text')
      .attr('x', cx).attr('y', cy + 8)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text('/ 10 AVG')
  }, [size])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
