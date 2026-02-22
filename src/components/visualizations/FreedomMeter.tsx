import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Freedom Meter — a circular gauge showing how close passive income
 * is to covering lifestyle costs. Glows gold when reached.
 */

interface Props {
  passiveIncome?: number    // monthly passive income
  lifestyleCost?: number    // monthly expenses / lifestyle cost
}

export function FreedomMeter({ passiveIncome = 2400, lifestyleCost = 4200 }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const size = Math.min(width, 280)
  const height = size

  useEffect(() => {
    if (!svgRef.current || size < 100) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 16
    const innerR = outerR - 16
    const pct = Math.min(passiveIncome / lifestyleCost, 1)
    const isFree = pct >= 1

    const goldColor = '#FFD700'
    const fillColor = isFree ? goldColor : CHART_COLORS.brandLight

    const defs = svg.append('defs')

    // Glow filter for freedom state
    if (isFree) {
      const filter = defs.append('filter').attr('id', 'freedom-glow')
      filter.append('feGaussianBlur').attr('stdDeviation', 6).attr('result', 'blur')
      filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over')
    }

    // Background ring
    const bgArc = d3.arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(0)
      .endAngle(Math.PI * 2)

    svg.append('path')
      .attr('d', bgArc({} as any))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', CHART_COLORS.surfaceLight)

    // Fill arc
    const fillArc = d3.arc<unknown>()
      .innerRadius(innerR + 1)
      .outerRadius(outerR - 1)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + Math.PI * 2 * pct)
      .cornerRadius(8)

    svg.append('path')
      .attr('d', fillArc({} as any))
      .attr('transform', `translate(${cx},${cy})`)
      .attr('fill', fillColor)
      .attr('opacity', isFree ? 0.9 : 0.7)
      .style('filter', isFree ? 'url(#freedom-glow)' : '')

    // Inner subtle ring
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR - 8)
      .attr('fill', 'none').attr('stroke', CHART_COLORS.border).attr('stroke-width', 0.5)

    // Center content
    svg.append('text').attr('x', cx).attr('y', cy - 12)
      .attr('text-anchor', 'middle').attr('fill', isFree ? goldColor : CHART_COLORS.textPrimary)
      .attr('font-size', 28).attr('font-weight', 800).attr('font-family', 'var(--font-sans)')
      .text(`${Math.round(pct * 100)}%`)

    svg.append('text').attr('x', cx).attr('y', cy + 6)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 8).attr('font-family', 'var(--font-mono)')
      .text(isFree ? 'FREEDOM ACHIEVED' : 'TO FREEDOM')

    // Income vs Cost labels
    svg.append('text').attr('x', cx).attr('y', cy + 24)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textSecondary)
      .attr('font-size', 10).attr('font-family', 'var(--font-mono)')
      .text(`$${passiveIncome.toLocaleString()} / $${lifestyleCost.toLocaleString()}`)

    // Label at top
    svg.append('text').attr('x', cx).attr('y', 10)
      .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8).attr('font-family', 'var(--font-mono)').attr('letter-spacing', '0.15em')
      .text('FREEDOM METER')

    // Gap remaining at bottom
    if (!isFree) {
      const gap = lifestyleCost - passiveIncome
      svg.append('text').attr('x', cx).attr('y', size - 6)
        .attr('text-anchor', 'middle').attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 9).attr('font-family', 'var(--font-mono)')
        .text(`$${gap.toLocaleString()}/mo gap remaining`)
    }

  }, [size, passiveIncome, lifestyleCost])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 flex justify-center">
      <svg ref={svgRef} width={size} height={height} />
    </div>
  )
}
