import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'
import { useAppStore } from '@/stores/appStore'
import type { LifeSeason } from '@/types'

/**
 * Life Season Dial — a circular dial showing 6 life seasons
 * arranged around a ring. The active season glows, others dim.
 */

const SEASONS: { key: LifeSeason; label: string; short: string; color: string }[] = [
  { key: 'foundation',   label: 'Foundation',   short: 'FND', color: '#3b82f6' },
  { key: 'expansion',    label: 'Expansion',    short: 'EXP', color: '#8b5cf6' },
  { key: 'domination',   label: 'Domination',   short: 'DOM', color: '#FF6B35' },
  { key: 'exploration',  label: 'Exploration',  short: 'XPL', color: '#22c55e' },
  { key: 'recovery',     label: 'Recovery',     short: 'RCV', color: '#06b6d4' },
  { key: 'reinvention',  label: 'Reinvention',  short: 'RNV', color: '#eab308' },
]

export function LifeSeasonDial() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const { currentSeason } = useAppStore()

  const size = Math.min(width, 300)
  const height = size

  useEffect(() => {
    if (!svgRef.current || size < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 24
    const innerR = outerR - 20
    const segGap = 0.02 // radians gap between segments
    const segAngle = (Math.PI * 2) / SEASONS.length

    const defs = svg.append('defs')

    // Glow filter for active season
    const filter = defs.append('filter').attr('id', 'season-glow')
    filter.append('feGaussianBlur').attr('stdDeviation', 5).attr('result', 'blur')
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over')

    // Ambient radial glow
    const radGrad = defs.append('radialGradient')
      .attr('id', 'season-ambient')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%')
    radGrad.append('stop').attr('offset', '0%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0.06)
    radGrad.append('stop').attr('offset', '100%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0)

    svg.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR + 16)
      .attr('fill', 'url(#season-ambient)')

    // Inner reference ring
    svg.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', innerR - 8)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.border)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3)

    // Draw segments
    SEASONS.forEach((season, i) => {
      const start = i * segAngle - Math.PI / 2 + segGap / 2
      const end = (i + 1) * segAngle - Math.PI / 2 - segGap / 2
      const isActive = season.key === currentSeason

      const arc = d3.arc<unknown>()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .startAngle(start)
        .endAngle(end)
        .cornerRadius(4)

      // Glow layer for active
      if (isActive) {
        svg.append('path')
          .attr('d', arc({} as any))
          .attr('transform', `translate(${cx},${cy})`)
          .attr('fill', season.color)
          .attr('opacity', 0.35)
          .attr('filter', 'url(#season-glow)')
      }

      // Segment
      svg.append('path')
        .attr('d', arc({} as any))
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', season.color)
        .attr('opacity', isActive ? 0.9 : 0.15)

      // Label around outside
      const midAngle = (start + end) / 2
      const labelR = outerR + 14
      const lx = cx + Math.cos(midAngle) * labelR
      const ly = cy + Math.sin(midAngle) * labelR

      svg.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isActive ? season.color : CHART_COLORS.textDim)
        .attr('font-size', isActive ? 9 : 7)
        .attr('font-weight', isActive ? 700 : 400)
        .attr('font-family', 'var(--font-mono)')
        .attr('letter-spacing', '0.08em')
        .text(season.short)

      // Active indicator dot inside ring
      if (isActive) {
        const dotR = innerR - 16
        const dx = cx + Math.cos(midAngle) * dotR
        const dy = cy + Math.sin(midAngle) * dotR

        svg.append('circle')
          .attr('cx', dx).attr('cy', dy)
          .attr('r', 3)
          .attr('fill', season.color)
          .style('filter', `drop-shadow(0 0 6px ${season.color})`)
      }
    })

    // Center content
    const activeSeason = SEASONS.find(s => s.key === currentSeason)

    svg.append('text')
      .attr('x', cx).attr('y', cy - 14)
      .attr('text-anchor', 'middle')
      .attr('fill', activeSeason?.color ?? CHART_COLORS.textPrimary)
      .attr('font-size', 22)
      .attr('font-weight', 800)
      .attr('font-family', 'var(--font-display)')
      .attr('font-style', 'italic')
      .text(activeSeason?.label ?? '')

    svg.append('text')
      .attr('x', cx).attr('y', cy + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('CURRENT SEASON')

    // Phase indicator line
    const activeIdx = SEASONS.findIndex(s => s.key === currentSeason)
    const phaseText = `PHASE ${activeIdx + 1} OF ${SEASONS.length}`
    svg.append('text')
      .attr('x', cx).attr('y', cy + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.12em')
      .text(phaseText)

    // Title at top
    svg.append('text')
      .attr('x', cx).attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('LIFE SEASON DIAL')

  }, [size, currentSeason])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
