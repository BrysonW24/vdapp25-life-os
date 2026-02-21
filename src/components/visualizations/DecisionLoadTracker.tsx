import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Decision Load Tracker — plots decision density (count & complexity)
 * against output quality per day. Reveals the point where decision
 * fatigue degrades performance.
 */

interface DayDecisions {
  day: string
  decisionCount: number    // total decisions
  avgComplexity: number    // 1-5
  outputQuality: number    // 0-10
  mentalFatigue: number    // 0-10
}

interface Props {
  data?: DayDecisions[]
}

function generateSample(): DayDecisions[] {
  return Array.from({ length: 14 }, (_, i) => {
    const decisions = Math.round(5 + Math.random() * 25)
    const complexity = 1 + Math.random() * 4
    const load = decisions * complexity
    // Output degrades as load increases
    const output = Math.max(0, Math.min(10, 9 - (load / 40) + (Math.random() - 0.5) * 2))
    const fatigue = Math.min(10, (load / 15) + (Math.random() - 0.5) * 2)
    return {
      day: `D${i + 1}`,
      decisionCount: decisions,
      avgComplexity: Math.round(complexity * 10) / 10,
      outputQuality: Math.round(output * 10) / 10,
      mentalFatigue: Math.round(Math.max(0, fatigue) * 10) / 10,
    }
  })
}

export function DecisionLoadTracker({ data }: Props) {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const days = useMemo(() => data ?? generateSample(), [data])

  const chartH = 140
  const marginTop = 28
  const marginBottom = 32
  const marginLeft = 28
  const marginRight = 12
  const totalHeight = chartH + marginTop + marginBottom

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
      .text('DECISION LOAD TRACKER')

    const x = d3.scaleBand()
      .domain(days.map(d => d.day))
      .range([0, innerW])
      .padding(0.2)

    const yOutput = d3.scaleLinear().domain([0, 10]).range([chartH, 0])
    const yLoad = d3.scaleLinear()
      .domain([0, d3.max(days, d => d.decisionCount * d.avgComplexity) ?? 100])
      .range([chartH, 0])

    // Grid
    for (let v = 0; v <= 10; v += 2) {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', yOutput(v)).attr('y2', yOutput(v))
        .attr('stroke', CHART_COLORS.gridLine).attr('stroke-width', 0.5)
    }

    // Decision load bars (background)
    days.forEach(d => {
      const bx = x(d.day)!
      const bw = x.bandwidth()
      const load = d.decisionCount * d.avgComplexity
      const barH = chartH - yLoad(load)

      g.append('rect')
        .attr('x', bx).attr('y', yLoad(load))
        .attr('width', bw).attr('height', barH)
        .attr('rx', 2)
        .attr('fill', CHART_COLORS.avoiding)
        .attr('opacity', 0.08 + (load / 150) * 0.15)

      // Decision count label at top of bar
      g.append('text')
        .attr('x', bx + bw / 2).attr('y', yLoad(load) - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 6).attr('font-family', 'var(--font-mono)')
        .text(d.decisionCount)
    })

    // Output quality line
    const outputLine = d3.line<DayDecisions>()
      .x(d => x(d.day)! + x.bandwidth() / 2)
      .y(d => yOutput(d.outputQuality))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(days)
      .attr('d', outputLine)
      .attr('fill', 'none')
      .attr('stroke', CHART_COLORS.aligned)
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)

    // Output dots
    days.forEach(d => {
      g.append('circle')
        .attr('cx', x(d.day)! + x.bandwidth() / 2)
        .attr('cy', yOutput(d.outputQuality))
        .attr('r', 2.5)
        .attr('fill', d.outputQuality > 6 ? CHART_COLORS.aligned : d.outputQuality > 4 ? CHART_COLORS.drifting : CHART_COLORS.avoiding)
    })

    // Fatigue line (dashed overlay)
    const fatigueLine = d3.line<DayDecisions>()
      .x(d => x(d.day)! + x.bandwidth() / 2)
      .y(d => yOutput(d.mentalFatigue))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(days)
      .attr('d', fatigueLine)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,2')
      .attr('opacity', 0.4)

    // X axis
    days.forEach(d => {
      g.append('text')
        .attr('x', x(d.day)! + x.bandwidth() / 2)
        .attr('y', chartH + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.textDim)
        .attr('font-size', 5).attr('font-family', 'var(--font-mono)')
        .text(d.day)
    })

  }, [width, days])

  const avgOutput = (days.reduce((s, d) => s + d.outputQuality, 0) / days.length).toFixed(1)
  const avgDecisions = Math.round(days.reduce((s, d) => s + d.decisionCount, 0) / days.length)

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <svg ref={svgRef} width={width} height={totalHeight} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ background: CHART_COLORS.avoiding, opacity: 0.2 }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Decision load</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ background: CHART_COLORS.aligned }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Output</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-b border-dashed" style={{ borderColor: '#ef4444' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Fatigue</span>
          </div>
        </div>
        <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
          avg {avgDecisions} decisions · {avgOutput} output
        </span>
      </div>
    </div>
  )
}
