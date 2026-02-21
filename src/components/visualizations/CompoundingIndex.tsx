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
  const height = size + 48

  useEffect(() => {
    if (!svgRef.current || size === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 36
    const strokeW = 6

    const defs = svg.append('defs')
    const g = svg.append('g')

    // === GLOW FILTER ===
    const glowFilter = defs.append('filter')
      .attr('id', 'arc-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%')
    glowFilter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '4')
      .attr('result', 'blur')
    glowFilter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', (d: string) => d)

    // === GRADIENT for arc (violet → orange) ===
    const arcGrad = defs.append('linearGradient')
      .attr('id', 'arc-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', cx).attr('y1', cy - outerR)
      .attr('x2', cx + outerR).attr('y2', cy + outerR)
    arcGrad.append('stop').attr('offset', '0%').attr('stop-color', CHART_COLORS.brand)
    arcGrad.append('stop').attr('offset', '100%').attr('stop-color', CHART_COLORS.accent)

    // === RADIAL GLOW BACKGROUND ===
    const radGrad = defs.append('radialGradient')
      .attr('id', 'hero-glow')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%')
    radGrad.append('stop').attr('offset', '0%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0.08)
    radGrad.append('stop').attr('offset', '60%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0.03)
    radGrad.append('stop').attr('offset', '100%').attr('stop-color', CHART_COLORS.brand).attr('stop-opacity', 0)

    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR + 30)
      .attr('fill', 'url(#hero-glow)')

    // === OUTER GHOST RING (ambient glow) ===
    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR + 8)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.brand)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.08)

    // === BACKGROUND RING ===
    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.border)
      .attr('stroke-width', 1.5)

    // === INNER REFERENCE RING ===
    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', outerR - 12)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.border)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3)

    // === TICK MARKS at 25, 50, 75 ===
    ;[0.25, 0.5, 0.75].forEach(pct => {
      const angle = pct * 2 * Math.PI - Math.PI / 2
      const x1 = cx + Math.cos(angle) * (outerR - 8)
      const y1 = cy + Math.sin(angle) * (outerR - 8)
      const x2 = cx + Math.cos(angle) * (outerR + 8)
      const y2 = cy + Math.sin(angle) * (outerR + 8)
      g.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5)
    })

    // === SCORE ARC with glow ===
    const arcLen = (score / 100) * 2 * Math.PI

    // Glow layer (behind main arc)
    const glowArc = g.append('path')
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', CHART_COLORS.brand)
      .attr('opacity', 0)
      .attr('filter', 'url(#arc-glow)')

    // Main arc
    const mainArc = g.append('path')
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', 'url(#arc-gradient)')
      .attr('opacity', 0)

    // Animate both arcs
    const animateArc = (path: d3.Selection<SVGPathElement, unknown, null, undefined>, targetOpacity: number) => {
      path.transition()
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
        .attr('opacity', targetOpacity)
    }

    animateArc(glowArc, 0.4)
    animateArc(mainArc, 1)

    // === END-POINT PULSE DOT ===
    if (score > 0) {
      const endAngle = arcLen - Math.PI / 2
      const endX = cx + Math.cos(endAngle) * outerR
      const endY = cy + Math.sin(endAngle) * outerR

      // Pulse ring
      const pulseRing = g.append('circle')
        .attr('cx', endX).attr('cy', endY)
        .attr('r', 6)
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS.accent)
        .attr('stroke-width', 1)
        .attr('opacity', 0)

      pulseRing.transition()
        .delay(1200)
        .duration(0)
        .attr('opacity', 0.3)

      // Dot
      g.append('circle')
        .attr('cx', endX).attr('cy', endY)
        .attr('r', 3)
        .attr('fill', CHART_COLORS.accent)
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(300)
        .attr('opacity', 1)
    }

    // === CENTER SCORE — Playfair Display italic ===
    g.append('text')
      .attr('x', cx).attr('y', cy - 4)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', CHART_COLORS.textPrimary)
      .attr('font-size', 58)
      .attr('font-weight', 400)
      .attr('font-family', 'var(--font-display)')
      .attr('font-style', 'italic')
      .attr('opacity', 0)
      .text(score)
      .transition()
      .delay(400)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('opacity', 1)

    // === "COMPOUNDING INDEX" label ===
    g.append('text')
      .attr('x', cx).attr('y', cy + 26)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.18em')
      .text('COMPOUNDING INDEX')

    // === B.E.S.W. SATELLITES ===
    if (compassMappings.length === 4) {
      const axisAngles: Record<string, number> = {
        B: -Math.PI / 2,
        E: 0,
        S: Math.PI / 2,
        W: Math.PI,
      }

      const satR = outerR + 26

      compassMappings.forEach((m: CompassMapping) => {
        const angle = axisAngles[m.axis]
        if (angle === undefined) return

        const sx = cx + Math.cos(angle) * satR
        const sy = cy + Math.sin(angle) * satR

        const mapped = alignments.filter(a => m.pillarIds.includes(a.pillarId))
        const axisScore = mapped.length > 0
          ? Math.round(mapped.reduce((s, a) => s + a.score, 0) / mapped.length)
          : 0

        const indicatorColor = axisScore > 70 ? CHART_COLORS.aligned
          : axisScore > 40 ? CHART_COLORS.drifting
          : CHART_COLORS.avoiding

        // Satellite glow
        g.append('circle')
          .attr('cx', sx).attr('cy', sy)
          .attr('r', 8)
          .attr('fill', indicatorColor)
          .attr('opacity', 0.12)

        // Satellite dot
        g.append('circle')
          .attr('cx', sx).attr('cy', sy)
          .attr('r', 3.5)
          .attr('fill', indicatorColor)

        // Axis letter — Playfair italic
        const labelR = satR + 16
        const lx = cx + Math.cos(angle) * labelR
        const ly = cy + Math.sin(angle) * labelR

        g.append('text')
          .attr('x', lx).attr('y', ly)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', CHART_COLORS.brandLight)
          .attr('font-size', 13)
          .attr('font-weight', 700)
          .attr('font-family', 'var(--font-display)')
          .attr('font-style', 'italic')
          .text(m.axis)

        // Score
        g.append('text')
          .attr('x', lx).attr('y', ly + 13)
          .attr('text-anchor', 'middle')
          .attr('fill', CHART_COLORS.textSecondary)
          .attr('font-size', 9)
          .attr('font-family', 'var(--font-mono)')
          .text(`${axisScore}`)
      })
    }

  }, [size, score, alignments, compassMappings])

  const trendColor = trend === 'up' ? CHART_COLORS.aligned
    : trend === 'down' ? CHART_COLORS.accent
    : CHART_COLORS.textMuted

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <div className="relative rounded-xl bg-[#16162a] border border-[#2d2d4e] p-5">
      {/* Season label — top right */}
      <div className="absolute top-4 right-5">
        <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          {SEASON_LABELS[currentSeason]}
        </span>
      </div>

      {/* Trend indicator — top left */}
      <div className="absolute top-4 left-5 flex items-center gap-1" style={{ color: trendColor }}>
        <TrendIcon size={14} strokeWidth={2} />
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
        </span>
      </div>

      <div ref={containerRef} className="w-full flex justify-center pt-4">
        <svg ref={svgRef} width={size} height={height} className="overflow-visible" />
      </div>
    </div>
  )
}
