import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'
import { useAlignments } from '@/hooks/useIntelligence'
import { useAppStore } from '@/stores/appStore'
import type { CompassMapping } from '@/types'
import { Settings2 } from 'lucide-react'

interface AlignmentCompassProps {
  onEditMappings?: () => void
}

export function AlignmentCompass({ onEditMappings }: AlignmentCompassProps) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const alignments = useAlignments()
  const { compassMappings } = useAppStore()
  const size = Math.min(width, 240)
  const height = size

  useEffect(() => {
    if (!svgRef.current || size === 0 || compassMappings.length !== 4) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2
    const maxR = size / 2 - 28

    const defs = svg.append('defs')
    const g = svg.append('g')

    // Glow filter for polygon
    const glowFilter = defs.append('filter')
      .attr('id', 'compass-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%')
    glowFilter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '3')
      .attr('result', 'blur')
    glowFilter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', (d: string) => d)

    const axisOrder: Array<'B' | 'E' | 'S' | 'W'> = ['B', 'E', 'S', 'W']
    const angles: Record<string, number> = { B: -Math.PI / 2, E: Math.PI, S: 0, W: Math.PI / 2 }

    const axisScores: Record<string, number> = {}
    const axisLabels: Record<string, string> = {}

    compassMappings.forEach((m: CompassMapping) => {
      const mapped = alignments.filter(a => m.pillarIds.includes(a.pillarId))
      axisScores[m.axis] = mapped.length > 0
        ? mapped.reduce((s, a) => s + a.score, 0) / mapped.length
        : 0
      axisLabels[m.axis] = m.label
    })

    // Diamond grid lines
    ;[25, 50, 75, 100].forEach((pct, i) => {
      const r = maxR * pct / 100
      const points = axisOrder.map(axis => {
        const angle = angles[axis]
        return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]
      })
      g.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', i === 3 ? 1 : 0.5)
        .attr('stroke-dasharray', i === 3 ? '2,4' : 'none')
        .attr('opacity', i === 3 ? 0.8 : 0.3)
    })

    // Cross lines
    axisOrder.forEach(axis => {
      const angle = angles[axis]
      const ex = cx + Math.cos(angle) * maxR
      const ey = cy + Math.sin(angle) * maxR
      g.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', ex).attr('y2', ey)
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 0.5)
    })

    // Score polygon with glow
    const points = axisOrder.map(axis => {
      const angle = angles[axis]
      const r = maxR * (axisScores[axis] / 100)
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as [number, number]
    })

    // Glow layer
    g.append('polygon')
      .attr('points', points.map(p => p.join(',')).join(' '))
      .attr('fill', CHART_COLORS.brand)
      .attr('fill-opacity', 0.15)
      .attr('stroke', CHART_COLORS.brand)
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#compass-glow)')
      .attr('opacity', 0.5)

    // Main polygon
    g.append('polygon')
      .attr('points', points.map(p => p.join(',')).join(' '))
      .attr('fill', CHART_COLORS.brand)
      .attr('fill-opacity', 0.08)
      .attr('stroke', CHART_COLORS.brand)
      .attr('stroke-width', 1)

    // Score dots
    axisOrder.forEach(axis => {
      const angle = angles[axis]
      const r = maxR * (axisScores[axis] / 100)
      const dx = cx + Math.cos(angle) * r
      const dy = cy + Math.sin(angle) * r

      // Glow
      g.append('circle')
        .attr('cx', dx).attr('cy', dy)
        .attr('r', 6)
        .attr('fill', CHART_COLORS.brand)
        .attr('opacity', 0.15)

      // Dot
      g.append('circle')
        .attr('cx', dx).attr('cy', dy)
        .attr('r', 3)
        .attr('fill', CHART_COLORS.brand)
    })

    // Center dot — orange accent
    const avgX = points.reduce((s, p) => s + p[0], 0) / 4
    const avgY = points.reduce((s, p) => s + p[1], 0) / 4
    g.append('circle')
      .attr('cx', avgX).attr('cy', avgY)
      .attr('r', 3)
      .attr('fill', CHART_COLORS.accent)

    // Axis labels
    const labelOffset = 16
    const labelPositions: Record<string, { x: number; y: number; anchor: string }> = {
      B: { x: cx, y: cy - maxR - labelOffset + 4, anchor: 'middle' },
      E: { x: cx - maxR - labelOffset + 2, y: cy + 1, anchor: 'end' },
      S: { x: cx + maxR + labelOffset - 2, y: cy + 1, anchor: 'start' },
      W: { x: cx, y: cy + maxR + labelOffset, anchor: 'middle' },
    }

    axisOrder.forEach(axis => {
      const pos = labelPositions[axis]

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y - 5)
        .attr('text-anchor', pos.anchor)
        .attr('fill', CHART_COLORS.brandLight)
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('font-family', 'var(--font-display)')
        .attr('font-style', 'italic')
        .text(axis)

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 6)
        .attr('text-anchor', pos.anchor)
        .attr('fill', CHART_COLORS.textMuted)
        .attr('font-size', 7)
        .attr('font-family', 'var(--font-mono)')
        .text(axisLabels[axis].toUpperCase())

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 15)
        .attr('text-anchor', pos.anchor)
        .attr('fill', CHART_COLORS.textSecondary)
        .attr('font-size', 8)
        .attr('font-family', 'var(--font-mono)')
        .text(`${Math.round(axisScores[axis])}`)
    })

  }, [size, alignments, compassMappings])

  if (compassMappings.length !== 4) {
    return (
      <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
        <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          B.E.S.W. Compass
        </p>
        <p className="text-xs text-[#606080] mt-2">Map your pillars to activate.</p>
        {onEditMappings && (
          <button
            onClick={onEditMappings}
            className="mt-3 text-[10px] font-medium text-violet-500 hover:text-violet-400 transition-colors duration-200"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Configure compass &rarr;
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          B.E.S.W. Compass
        </p>
        {onEditMappings && (
          <button onClick={onEditMappings} className="p-1 text-[#606080] hover:text-[#808090] transition-colors duration-200">
            <Settings2 size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>
      <div ref={containerRef} className="w-full flex justify-center">
        <svg ref={svgRef} width={size} height={height} className="overflow-visible" />
      </div>
    </div>
  )
}
