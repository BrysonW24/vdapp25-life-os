import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Lifestyle Drift Meter — a gauge showing the gap between
 * baseline lifestyle and current lifestyle, detecting creep.
 * Rendered as a semi-circular dial with a needle.
 */

interface Props {
  baseline?: number   // declared baseline spending/commitment level (0-100)
  current?: number    // current observed level (0-100)
  label?: string
}

export function LifestyleDriftMeter({ baseline = 50, current = 68, label = 'Lifestyle Drift' }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const height = Math.min(width * 0.6, 200)

  useEffect(() => {
    if (!svgRef.current || width < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = width / 2
    const cy = height - 20
    const outerR = Math.min(cx - 20, cy - 10)
    const innerR = outerR - 14

    const startAngle = -Math.PI * 0.8
    const endAngle = Math.PI * 0.8
    const range = endAngle - startAngle

    // Background arc
    const bgArc = d3.arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(7)

    svg.append('path')
      .attr('d', bgArc({} as any))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', CHART_COLORS.surfaceLight)

    // Color arc segments: green → amber → red
    const stops = [
      { pct: 0,   color: CHART_COLORS.aligned },
      { pct: 0.4, color: CHART_COLORS.aligned },
      { pct: 0.6, color: CHART_COLORS.drifting },
      { pct: 0.8, color: CHART_COLORS.avoiding },
      { pct: 1,   color: CHART_COLORS.avoiding },
    ]

    const defs = svg.append('defs')
    const gradId = 'drift-gauge-grad'
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%')
    stops.forEach(s => grad.append('stop').attr('offset', `${s.pct * 100}%`).attr('stop-color', s.color))

    const colorArc = d3.arc<unknown>()
      .innerRadius(innerR + 1)
      .outerRadius(outerR - 1)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(6)

    svg.append('path')
      .attr('d', colorArc({} as any))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', `url(#${gradId})`)
      .attr('opacity', 0.25)

    // Baseline marker
    const baselineAngle = startAngle + (baseline / 100) * range
    const bx1 = cx + Math.cos(baselineAngle - Math.PI / 2) * (innerR - 4)
    const by1 = cy + Math.sin(baselineAngle - Math.PI / 2) * (innerR - 4)
    const bx2 = cx + Math.cos(baselineAngle - Math.PI / 2) * (outerR + 4)
    const by2 = cy + Math.sin(baselineAngle - Math.PI / 2) * (outerR + 4)
    svg.append('line').attr('x1', bx1).attr('y1', by1).attr('x2', bx2).attr('y2', by2)
      .attr('stroke', CHART_COLORS.textMuted).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,2')

    // Current needle
    const currentAngle = startAngle + (current / 100) * range
    const needleLen = outerR + 8
    const nx = cx + Math.cos(currentAngle - Math.PI / 2) * needleLen
    const ny = cy + Math.sin(currentAngle - Math.PI / 2) * needleLen

    const driftPct = Math.abs(current - baseline)
    const needleColor = driftPct > 30 ? CHART_COLORS.avoiding : driftPct > 15 ? CHART_COLORS.drifting : CHART_COLORS.aligned

    svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', nx).attr('y2', ny)
      .attr('stroke', needleColor).attr('stroke-width', 2).attr('stroke-linecap', 'round')

    // Center dot
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 4)
      .attr('fill', needleColor)
      .style('filter', `drop-shadow(0 0 6px ${needleColor})`)

    // Labels
    svg.append('text').attr('x', cx).attr('y', cy - outerR - 12)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textSecondary)
      .attr('font-size', 10).attr('font-family', 'var(--font-mono)')
      .text(label.toUpperCase())

    // Delta value
    const sign = current > baseline ? '+' : ''
    svg.append('text').attr('x', cx).attr('y', cy - 22)
      .attr('text-anchor', 'middle').attr('fill', needleColor)
      .attr('font-size', 22).attr('font-weight', 700).attr('font-family', 'var(--font-sans)')
      .text(`${sign}${(current - baseline).toFixed(0)}%`)

    svg.append('text').attr('x', cx).attr('y', cy - 8)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8).attr('font-family', 'var(--font-mono)')
      .text('FROM BASELINE')

    // Min / Max labels
    svg.append('text')
      .attr('x', cx + Math.cos(startAngle - Math.PI / 2) * (outerR + 14))
      .attr('y', cy + Math.sin(startAngle - Math.PI / 2) * (outerR + 14) + 4)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8).attr('font-family', 'var(--font-mono)').text('MIN')

    svg.append('text')
      .attr('x', cx + Math.cos(endAngle - Math.PI / 2) * (outerR + 14))
      .attr('y', cy + Math.sin(endAngle - Math.PI / 2) * (outerR + 14) + 4)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8).attr('font-family', 'var(--font-mono)').text('MAX')

  }, [width, height, baseline, current, label])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  )
}
