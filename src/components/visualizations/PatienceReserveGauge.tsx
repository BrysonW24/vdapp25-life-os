import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Patience Reserve Gauge
 * Composite gauge derived from: sleep, work stress, relationship health, physical health.
 * Displayed as a fuel-tank style vertical gauge with a "reserve" threshold line.
 * Below the threshold = you cannot parent well. Shows which input is most depleting.
 */

interface Input {
  label: string
  score: number    // 0–100
  weight: number   // contribution to overall (sums to 1)
  color: string
}

const INPUTS: Input[] = [
  { label: 'Sleep quality',       score: 62, weight: 0.35, color: '#3b82f6' },
  { label: 'Work stress',         score: 45, weight: 0.25, color: '#ef4444' },  // inverted: lower = more stress
  { label: 'Relationship health', score: 80, weight: 0.25, color: '#8b5cf6' },
  { label: 'Physical health',     score: 74, weight: 0.15, color: '#22c55e' },
]

const RESERVE_THRESHOLD = 55   // below this = depleted state

export function PatienceReserveGauge() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const size = Math.min(Math.max(width - 16, 120), 300)
  const height = size + 60

  useEffect(() => {
    if (!svgRef.current || size < 120) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Composite score
    const composite = Math.round(
      INPUTS.reduce((s, inp) => {
        // Work stress: invert (low stress score = high drain)
        const v = inp.label === 'Work stress' ? inp.score : inp.score
        return s + v * inp.weight
      }, 0)
    )
    const isDepleted = composite < RESERVE_THRESHOLD
    const fillColor = composite >= 70 ? CHART_COLORS.aligned
      : composite >= RESERVE_THRESHOLD ? CHART_COLORS.drifting
      : CHART_COLORS.avoiding

    // Title
    svg.append('text')
      .attr('x', size / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('PATIENCE RESERVE GAUGE')

    // Gauge arc (half-circle, bottom)
    const cx = size / 2
    const cy = size / 2 + 24
    const outerR = size / 2 - 20
    const innerR = outerR - 22

    const startAngle = Math.PI  // left
    const endAngle = 0          // right (full arc = top)

    // Background arc
    const bgArc = d3.arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(4)

    svg.append('path')
      .attr('d', bgArc({} as unknown as undefined))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', CHART_COLORS.surfaceLight)

    // Fill arc
    const fillPct = composite / 100
    const fillEnd = startAngle + (endAngle - startAngle) * fillPct  // note: end-start is negative (π to 0)
    // Arc from left (π) to fill position
    const fillAngle = Math.PI - fillPct * Math.PI

    const fillArc = d3.arc<unknown>()
      .innerRadius(innerR + 1)
      .outerRadius(outerR - 1)
      .startAngle(startAngle)
      .endAngle(fillAngle)
      .cornerRadius(3)

    svg.append('path')
      .attr('d', fillArc({} as unknown as undefined))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', fillColor)
      .attr('opacity', 0.8)

    // Reserve threshold line
    const threshAngle = Math.PI - (RESERVE_THRESHOLD / 100) * Math.PI
    const threshX1 = cx + Math.cos(threshAngle) * (innerR - 4)
    const threshY1 = cy + Math.sin(threshAngle) * (innerR - 4)
    const threshX2 = cx + Math.cos(threshAngle) * (outerR + 4)
    const threshY2 = cy + Math.sin(threshAngle) * (outerR + 4)

    svg.append('line')
      .attr('x1', threshX1).attr('y1', threshY1)
      .attr('x2', threshX2).attr('y2', threshY2)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,2')

    svg.append('text')
      .attr('x', threshX2 + 6).attr('y', threshY2 + 3)
      .attr('fill', '#ef4444')
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .text('RESERVE')

    // Center readout
    svg.append('text')
      .attr('x', cx).attr('y', cy - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', fillColor)
      .attr('font-size', 28).attr('font-weight', 800)
      .attr('font-family', 'var(--font-sans)')
      .text(`${composite}`)

    svg.append('text')
      .attr('x', cx).attr('y', cy + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text(isDepleted ? 'DEPLETED' : 'PATIENCE RESERVE')

    svg.append('text')
      .attr('x', cx).attr('y', cy + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', isDepleted ? '#ef4444' : CHART_COLORS.textMuted)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text(isDepleted ? 'Recharge before engaging' : 'Sufficient to parent well')

    // Scale labels
    const scaleLabels = [['0', Math.PI], ['50', Math.PI / 2], ['100', 0]]
    scaleLabels.forEach(([label, angle]) => {
      const lx = cx + Math.cos(angle as number) * (outerR + 12)
      const ly = cy + Math.sin(angle as number) * (outerR + 12)
      svg.append('text')
        .attr('x', lx).attr('y', ly + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
        .text(label as string)
    })

    // Input breakdown bars below gauge
    const barY0 = cy + outerR + 20
    const barPad = Math.max(8, size * 0.04)
    const barW = size - barPad * 2
    const barH = 10
    const barGap = 18

    INPUTS.forEach((inp, i) => {
      const y = barY0 + i * barGap
      const fill = (inp.score / 100) * barW

      svg.append('text')
        .attr('x', barPad).attr('y', y + barH - 1)
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
        .text(inp.label)

      svg.append('rect')
        .attr('x', barPad).attr('y', y).attr('width', barW).attr('height', barH)
        .attr('fill', CHART_COLORS.gridLine).attr('rx', 2)

      svg.append('rect')
        .attr('x', barPad).attr('y', y).attr('width', fill).attr('height', barH)
        .attr('fill', inp.color).attr('opacity', 0.7).attr('rx', 2)

      svg.append('text')
        .attr('x', barPad + fill + 4).attr('y', y + barH - 1)
        .attr('fill', inp.color)
        .attr('font-size', 7).attr('font-weight', 600).attr('font-family', 'var(--font-mono)')
        .text(`${inp.score}`)
    })
  }, [size])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
