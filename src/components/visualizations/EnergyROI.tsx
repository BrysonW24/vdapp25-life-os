import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Energy ROI — scatter plot of activities by energy spent vs output gained.
 * Each bubble is an activity type. Size = frequency. Position = leverage.
 * Top-left = high output, low energy = best ROI.
 * Bottom-right = low output, high energy = worst ROI.
 */

interface Activity {
  name: string
  energyCost: number  // 0-10
  outputGain: number  // 0-10
  frequency: number   // times per week
  color: string
}

interface Props {
  activities?: Activity[]
}

const DEFAULT_ACTIVITIES: Activity[] = [
  { name: 'Gym',           energyCost: 3, outputGain: 8, frequency: 5, color: '#22c55e' },
  { name: 'Deep Work',     energyCost: 5, outputGain: 9, frequency: 5, color: '#3b82f6' },
  { name: 'Meetings',      energyCost: 6, outputGain: 3, frequency: 8, color: '#ef4444' },
  { name: 'Reading',       energyCost: 2, outputGain: 6, frequency: 4, color: '#8b5cf6' },
  { name: 'Doom Scroll',   energyCost: 4, outputGain: 0.5, frequency: 7, color: '#6b7280' },
  { name: 'Chinese Study', energyCost: 4, outputGain: 5, frequency: 2, color: '#eab308' },
  { name: 'Walk',          energyCost: 1, outputGain: 5, frequency: 6, color: '#06b6d4' },
  { name: 'Admin',         energyCost: 5, outputGain: 2, frequency: 5, color: '#FF6B35' },
]

export function EnergyROI({ activities = DEFAULT_ACTIVITIES }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)

  const chartH = 200
  const marginTop = 28
  const marginBottom = 28
  const marginLeft = 32
  const marginRight = 16
  const totalHeight = chartH + marginTop + marginBottom

  const bestROI = useMemo(() => {
    return [...activities].sort((a, b) =>
      (b.outputGain / (b.energyCost || 0.1)) - (a.outputGain / (a.energyCost || 0.1))
    )[0]
  }, [activities])

  useEffect(() => {
    if (!svgRef.current || width < 200) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerW = width - marginLeft - marginRight
    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 8)
      .attr('font-family', 'var(--font-mono)')
      .attr('letter-spacing', '0.15em')
      .text('ENERGY ROI')

    const x = d3.scaleLinear().domain([0, 10]).range([0, innerW])
    const y = d3.scaleLinear().domain([0, 10]).range([chartH, 0])
    const rScale = d3.scaleSqrt().domain([0, 10]).range([4, 16])

    // Grid
    for (let v = 0; v <= 10; v += 2) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y(v)).attr('y2', y(v))
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 0.5)

      g.append('line')
        .attr('x1', x(v)).attr('x2', x(v))
        .attr('y1', 0).attr('y2', chartH)
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 0.5)
    }

    // Diagonal ROI reference line (1:1)
    g.append('line')
      .attr('x1', x(0)).attr('y1', y(0))
      .attr('x2', x(10)).attr('y2', y(10))
      .attr('stroke', CHART_COLORS.textDim)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '4,3')
      .attr('opacity', 0.3)

    // Quadrant labels
    g.append('text')
      .attr('x', x(2)).attr('y', y(9))
      .attr('fill', CHART_COLORS.aligned)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .attr('opacity', 0.3)
      .text('HIGH LEVERAGE')

    g.append('text')
      .attr('x', x(7)).attr('y', y(1))
      .attr('fill', CHART_COLORS.avoiding)
      .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
      .attr('opacity', 0.3)
      .text('ENERGY SINK')

    // Bubbles
    activities.forEach(act => {
      const cx = x(act.energyCost)
      const cy = y(act.outputGain)
      const r = rScale(act.frequency)
      const roi = act.outputGain / (act.energyCost || 0.1)

      // Glow
      const grad = g.append('defs').append('radialGradient')
        .attr('id', `roi-${act.name.replace(/\s/g, '')}`)
      grad.append('stop').attr('offset', '0%').attr('stop-color', act.color).attr('stop-opacity', 0.3)
      grad.append('stop').attr('offset', '100%').attr('stop-color', act.color).attr('stop-opacity', 0)

      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r + 6)
        .attr('fill', `url(#roi-${act.name.replace(/\s/g, '')})`)

      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', act.color)
        .attr('opacity', 0.2)
        .attr('stroke', act.color)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)

      // Label
      g.append('text')
        .attr('x', cx).attr('y', cy + r + 10)
        .attr('text-anchor', 'middle')
        .attr('fill', act.color)
        .attr('font-size', 6).attr('font-weight', 500)
        .attr('font-family', 'var(--font-mono)')
        .attr('opacity', 0.7)
        .text(act.name)

      // ROI multiplier inside bubble
      g.append('text')
        .attr('x', cx).attr('y', cy + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', act.color)
        .attr('font-size', 7).attr('font-weight', 700)
        .attr('font-family', 'var(--font-mono)')
        .text(`${roi.toFixed(1)}x`)
    })

    // Axis labels
    svg.append('text')
      .attr('x', width / 2).attr('y', totalHeight - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .text('ENERGY COST →')

    svg.append('text')
      .attr('x', 8).attr('y', marginTop + chartH / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textDim)
      .attr('font-size', 7).attr('font-family', 'var(--font-mono)')
      .attr('transform', `rotate(-90, 8, ${marginTop + chartH / 2})`)
      .text('OUTPUT GAIN →')

  }, [width, activities])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
          Bubble size = frequency · Position = leverage
        </span>
        {bestROI && (
          <span className="text-[8px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: bestROI.color }}>
            Best: {bestROI.name} ({(bestROI.outputGain / (bestROI.energyCost || 0.1)).toFixed(1)}x)
          </span>
        )}
      </div>
    </div>
  )
}
