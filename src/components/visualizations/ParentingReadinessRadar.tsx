import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Parenting Readiness Radar
 * Spider chart across 7 domains:
 * Financial runway, Time availability, Emotional bandwidth,
 * Relationship stability, Environment / space, Support network, Health baseline
 * Two polygons: current state vs target readiness.
 */

interface ReadinessDomain {
  label: string
  current: number   // 0–100
  target: number    // 0–100
  note: string
}

const DOMAINS: ReadinessDomain[] = [
  { label: 'Financial\nRunway',      current: 72, target: 85, note: '18mo expenses saved' },
  { label: 'Time\nAvailability',     current: 55, target: 75, note: '~35 hrs/wk protected' },
  { label: 'Emotional\nBandwidth',   current: 68, target: 80, note: 'Stress mgmt systems' },
  { label: 'Relationship\nStability',current: 82, target: 90, note: 'Communication strong' },
  { label: 'Environment\n& Space',   current: 65, target: 80, note: 'Space ready' },
  { label: 'Support\nNetwork',       current: 60, target: 75, note: 'Family proximity' },
  { label: 'Health\nBaseline',       current: 78, target: 85, note: 'Both partners fit' },
]

export function ParentingReadinessRadar() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const size = Math.min(Math.max(width - 16, 100), 320)
  const height = size + 40

  useEffect(() => {
    if (!svgRef.current || size < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2 + 16
    const maxR = size / 2 - 40
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
      .text('PARENTING READINESS RADAR')

    // Grid rings
    const rings = [25, 50, 75, 100]
    rings.forEach(pct => {
      const r = (pct / 100) * maxR
      const points = angles.map(a => toPoint(a, r))
      const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
      svg.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', pct === 100 ? CHART_COLORS.border : CHART_COLORS.gridLine)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', pct === 100 ? 'none' : '2,4')

      // Ring label
      svg.append('text')
        .attr('x', cx + 4)
        .attr('y', cy - r + 3)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6)
        .attr('font-family', 'var(--font-mono)')
        .text(`${pct}`)
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

    // Target polygon
    const targetPoints = DOMAINS.map((d, i) => toPoint(angles[i], (d.target / 100) * maxR))
    const targetPath = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
    svg.append('path')
      .attr('d', targetPath)
      .attr('fill', `${CHART_COLORS.brand}15`)
      .attr('stroke', CHART_COLORS.brand)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3')

    // Current polygon
    const currentPoints = DOMAINS.map((d, i) => toPoint(angles[i], (d.current / 100) * maxR))
    const currentPath = currentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
    svg.append('path')
      .attr('d', currentPath)
      .attr('fill', `${CHART_COLORS.accent}20`)
      .attr('stroke', CHART_COLORS.accent)
      .attr('stroke-width', 2)

    // Domain dots on current polygon
    currentPoints.forEach((p, i) => {
      const gap = DOMAINS[i].target - DOMAINS[i].current
      const dotColor = gap <= 5 ? CHART_COLORS.aligned
        : gap <= 20 ? CHART_COLORS.drifting
        : CHART_COLORS.avoiding

      svg.append('circle')
        .attr('cx', p.x).attr('cy', p.y).attr('r', 3)
        .attr('fill', dotColor)
        .attr('stroke', CHART_COLORS.bg)
        .attr('stroke-width', 1)
    })

    // Domain labels
    DOMAINS.forEach((d, i) => {
      const angle = angles[i]
      const labelR = maxR + 24
      const lx = cx + Math.cos(angle) * labelR
      const ly = cy + Math.sin(angle) * labelR

      const lines = d.label.split('\n')
      const anchor = Math.cos(angle) > 0.1 ? 'start' : Math.cos(angle) < -0.1 ? 'end' : 'middle'

      lines.forEach((line, li) => {
        svg.append('text')
          .attr('x', lx)
          .attr('y', ly + li * 10 - (lines.length - 1) * 5)
          .attr('text-anchor', anchor)
          .attr('fill', CHART_COLORS.textSecondary)
          .attr('font-size', 7)
          .attr('font-family', 'var(--font-mono)')
          .text(line)
      })

      // Score
      const gap = d.target - d.current
      const scoreColor = gap <= 5 ? CHART_COLORS.aligned : gap <= 20 ? CHART_COLORS.drifting : CHART_COLORS.avoiding
      svg.append('text')
        .attr('x', lx)
        .attr('y', ly + lines.length * 10 - (lines.length - 1) * 5)
        .attr('text-anchor', anchor)
        .attr('fill', scoreColor)
        .attr('font-size', 8)
        .attr('font-weight', 600)
        .attr('font-family', 'var(--font-mono)')
        .text(`${d.current}`)
    })

    // Overall readiness score
    const avgCurrent = DOMAINS.reduce((s, d) => s + d.current, 0) / DOMAINS.length
    const avgTarget = DOMAINS.reduce((s, d) => s + d.target, 0) / DOMAINS.length
    const readinessPct = Math.round((avgCurrent / avgTarget) * 100)

    svg.append('text')
      .attr('x', cx).attr('y', cy - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.accent)
      .attr('font-size', 22).attr('font-weight', 800)
      .attr('font-family', 'var(--font-sans)')
      .text(`${readinessPct}%`)

    svg.append('text')
      .attr('x', cx).attr('y', cy + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .text('READY')

    // Legend — proportional positioning
    const legY = size + 28
    const legMid = size / 2
    svg.append('line')
      .attr('x1', 4).attr('y1', legY - 3)
      .attr('x2', 18).attr('y2', legY - 3)
      .attr('stroke', CHART_COLORS.accent)
      .attr('stroke-width', 2)
    svg.append('text')
      .attr('x', 22).attr('y', legY)
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text('Current')

    svg.append('line')
      .attr('x1', legMid).attr('y1', legY - 3)
      .attr('x2', legMid + 14).attr('y2', legY - 3)
      .attr('stroke', CHART_COLORS.brand)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3')
    svg.append('text')
      .attr('x', legMid + 18).attr('y', legY)
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text('Target')
  }, [size])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
