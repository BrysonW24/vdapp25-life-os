import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'
import { useCompoundingIndex } from '@/hooks/useCompoundingIndex'
import { useAlignments } from '@/hooks/useIntelligence'
import { useAppStore } from '@/stores/appStore'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import type { CompassMapping } from '@/types'

const SEASON_LABELS: Record<string, string> = {
  foundation: 'FOUNDATION',
  expansion: 'EXPANSION',
  domination: 'DOMINATION',
  exploration: 'EXPLORATION',
  recovery: 'RECOVERY',
  reinvention: 'REINVENTION',
}

export function CompoundingIndex() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const { score, trend } = useCompoundingIndex()
  const alignments = useAlignments()
  const { currentSeason, compassMappings } = useAppStore()

  const size = Math.min(width, 280)
  const height = size + 40

  useEffect(() => {
    if (!svgRef.current || size === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 32
    const strokeW = 4

    const g = svg.append('g')

    // Subtle radial glow behind ring
    const defs = svg.append('defs')
    const radGrad = defs.append('radialGradient')
      .attr('id', 'hero-glow')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%')
    radGrad.append('stop').attr('offset', '0%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0.04)
    radGrad.append('stop').attr('offset', '100%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0)

    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR + 20)
      .attr('fill', 'url(#hero-glow)')

    // Background ring — full circle
    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.border)
      .attr('stroke-width', 1)

    // Score arc — sweeps from 12 o'clock clockwise
    const arcLen = (score / 100) * 2 * Math.PI
    const arc = d3.arc<void>()
      .innerRadius(outerR - strokeW / 2)
      .outerRadius(outerR + strokeW / 2)
      .startAngle(0)
      .endAngle(arcLen)
      .cornerRadius(strokeW / 2)

    const arcPath = g.append('path')
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', CHART_COLORS.brand)
      .attr('opacity', 0)

    // Animate the arc sweep
    arcPath.transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attrTween('d', () => {
        const interp = d3.interpolate(0, arcLen)
        return (t: number) => {
          const a = d3.arc<void>()
            .innerRadius(outerR - strokeW / 2)
            .outerRadius(outerR + strokeW / 2)
            .startAngle(0)
            .endAngle(interp(t))
            .cornerRadius(strokeW / 2)
          return a() || ''
        }
      })
      .attr('opacity', 1)

    // Inner tick marks at 25, 50, 75
    ;[0.25, 0.5, 0.75].forEach(pct => {
      const angle = pct * 2 * Math.PI - Math.PI / 2
      const x1 = cx + Math.cos(angle) * (outerR - 6)
      const y1 = cy + Math.sin(angle) * (outerR - 6)
      const x2 = cx + Math.cos(angle) * (outerR + 6)
      const y2 = cy + Math.sin(angle) * (outerR + 6)
      g.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.4)
    })

    // Center score — Playfair Display italic
    g.append('text')
      .attr('x', cx).attr('y', cy - 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', CHART_COLORS.textPrimary)
      .attr('font-size', 56)
      .attr('font-weight', 400)
      .attr('font-family', 'var(--font-display)')
      .attr('font-style', 'italic')
      .attr('opacity', 0)
      .text(score)
      .transition()
      .delay(400)
      .duration(600)
      .attr('opacity', 1)

    // "COMPOUNDING INDEX" label below score
    g.append('text')
      .attr('x', cx).attr('y', cy + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.18em')
      .text('COMPOUNDING INDEX')

    // B.E.S.W. Satellite indicators
    if (compassMappings.length === 4) {
      const axisAngles: Record<string, number> = {
        B: -Math.PI / 2,   // North
        E: 0,              // East
        S: Math.PI / 2,    // South
        W: Math.PI,        // West
      }

      const satR = outerR + 22

      compassMappings.forEach((m: CompassMapping) => {
        const angle = axisAngles[m.axis]
        if (angle === undefined) return

        const sx = cx + Math.cos(angle) * satR
        const sy = cy + Math.sin(angle) * satR

        // Calculate axis score from alignments
        const mapped = alignments.filter(a => m.pillarIds.includes(a.pillarId))
        const axisScore = mapped.length > 0
          ? Math.round(mapped.reduce((s, a) => s + a.score, 0) / mapped.length)
          : 0

        // Score indicator square
        const indicatorColor = axisScore > 70 ? CHART_COLORS.brand
          : axisScore > 40 ? CHART_COLORS.drifting
          : CHART_COLORS.avoiding

        g.append('rect')
          .attr('x', sx - 3).attr('y', sy - 3)
          .attr('width', 6).attr('height', 6)
          .attr('fill', indicatorColor)

        // Axis letter — Playfair italic
        const labelOffset = 14
        const lx = cx + Math.cos(angle) * (satR + labelOffset)
        const ly = cy + Math.sin(angle) * (satR + labelOffset)

        g.append('text')
          .attr('x', lx).attr('y', ly)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', CHART_COLORS.brand)
          .attr('font-size', 12)
          .attr('font-weight', 700)
          .attr('font-family', 'var(--font-display)')
          .attr('font-style', 'italic')
          .text(m.axis)

        // Score below letter
        const scoreY = ly + 12
        g.append('text')
          .attr('x', lx).attr('y', scoreY)
          .attr('text-anchor', 'middle')
          .attr('fill', CHART_COLORS.textMuted)
          .attr('font-size', 8)
          .attr('font-family', 'var(--font-mono)')
          .text(`${axisScore}`)
      })
    }

  }, [size, score, alignments, compassMappings])

  const trendColor = trend === 'up' ? CHART_COLORS.aligned
    : trend === 'down' ? CHART_COLORS.brand
    : CHART_COLORS.textMuted

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <div className="relative">
      {/* Season label — top right */}
      <div className="absolute top-0 right-0">
        <span className="text-[9px] font-medium tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textDim }}>
          {SEASON_LABELS[currentSeason]}
        </span>
      </div>

      {/* Trend indicator — top left */}
      <div className="absolute top-0 left-0 flex items-center gap-1" style={{ color: trendColor }}>
        <TrendIcon size={12} strokeWidth={2} />
        <span className="text-[9px] font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
        </span>
      </div>

      <div ref={containerRef} className="w-full flex justify-center pt-4">
        <svg ref={svgRef} width={size} height={height} className="overflow-visible" />
      </div>
    </div>
  )
}
