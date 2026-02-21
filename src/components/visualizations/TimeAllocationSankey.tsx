import { useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'
import { useAllHabitLogs, useActiveHabits } from '@/hooks/useHabits'
import { usePillars, useIdentity } from '@/hooks/useIdentity'
import { subDays, format } from 'date-fns'

const MINUTES_PER_HABIT = 30

export function TimeAllocationSankey() {
  const { containerRef, width } = useContainerSize()
  const svgRef = useRef<SVGSVGElement>(null)
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const activeHabits = useActiveHabits()
  const allLogs = useAllHabitLogs()

  const data = useMemo(() => {
    const today = new Date()
    const weekStart = format(subDays(today, 6), 'yyyy-MM-dd')
    const weekEnd = format(today, 'yyyy-MM-dd')

    const weekLogs = allLogs.filter(l => l.completed && l.date >= weekStart && l.date <= weekEnd)

    const pillarHours: { pillarId: number; name: string; color: string; hours: number }[] = []

    pillars.forEach(p => {
      const pillarHabitIds = activeHabits.filter(h => h.pillarId === p.id).map(h => h.id)
      const logCount = weekLogs.filter(l => pillarHabitIds.includes(l.habitId)).length
      const hours = Math.round((logCount * MINUTES_PER_HABIT / 60) * 10) / 10
      if (hours > 0) {
        pillarHours.push({ pillarId: p.id, name: p.name, color: p.color, hours })
      }
    })

    const unassignedHabitIds = activeHabits.filter(h => h.pillarId === null).map(h => h.id)
    const unassignedCount = weekLogs.filter(l => unassignedHabitIds.includes(l.habitId)).length
    const unassignedHours = Math.round((unassignedCount * MINUTES_PER_HABIT / 60) * 10) / 10

    const totalTracked = pillarHours.reduce((s, p) => s + p.hours, 0) + unassignedHours
    const totalWeekHours = 168
    const driftHours = Math.max(0, Math.round((totalWeekHours - totalTracked) * 10) / 10)

    return { pillarHours, unassignedHours, driftHours, totalTracked, totalWeekHours }
  }, [allLogs, activeHabits, pillars])

  const height = 180

  useEffect(() => {
    if (!svgRef.current || width === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 8, right: 8, bottom: 8, left: 8 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const leftX = 0
    const leftW = 32
    const rightX = innerW - 72
    const rightW = 72
    const ribbonStartX = leftX + leftW
    const ribbonEndX = rightX

    // Right-side nodes
    const rightNodes: { label: string; hours: number; color: string }[] = []
    data.pillarHours.forEach(p => rightNodes.push({ label: p.name, hours: p.hours, color: p.color }))
    if (data.unassignedHours > 0) {
      rightNodes.push({ label: 'Other', hours: data.unassignedHours, color: CHART_COLORS.textMuted })
    }
    rightNodes.push({ label: 'Drift', hours: data.driftHours, color: CHART_COLORS.textDim })

    const totalHours = data.totalWeekHours
    const nodeGap = 2

    // Left node — sharp rect, no radius
    g.append('rect')
      .attr('x', leftX).attr('y', 0)
      .attr('width', leftW).attr('height', innerH)
      .attr('fill', CHART_COLORS.surfaceLight)

    g.append('text')
      .attr('x', leftX + leftW / 2).attr('y', innerH / 2 - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textPrimary)
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('font-family', 'var(--font-mono)')
      .text(`${totalHours}h`)

    g.append('text')
      .attr('x', leftX + leftW / 2).attr('y', innerH / 2 + 7)
      .attr('text-anchor', 'middle')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .text('WEEK')

    // Right nodes
    const totalGaps = (rightNodes.length - 1) * nodeGap
    const availH = innerH - totalGaps
    let yOffset = 0

    rightNodes.forEach((node) => {
      const nodeH = Math.max(10, (node.hours / totalHours) * availH)
      const nodeY = yOffset

      // Sharp rects — no border-radius
      g.append('rect')
        .attr('x', rightX).attr('y', nodeY)
        .attr('width', rightW).attr('height', nodeH)
        .attr('fill', node.label === 'Drift' ? CHART_COLORS.surface : node.color)
        .attr('opacity', node.label === 'Drift' ? 0.3 : 0.6)

      // Ribbon — 8% opacity
      const leftY0 = yOffset
      const leftY1 = yOffset + nodeH

      const path = d3.path()
      const cpx = (ribbonStartX + ribbonEndX) / 2
      path.moveTo(ribbonStartX, leftY0)
      path.bezierCurveTo(cpx, leftY0, cpx, nodeY, ribbonEndX, nodeY)
      path.lineTo(ribbonEndX, nodeY + nodeH)
      path.bezierCurveTo(cpx, nodeY + nodeH, cpx, leftY1, ribbonStartX, leftY1)
      path.closePath()

      g.append('path')
        .attr('d', path.toString())
        .attr('fill', node.label === 'Drift' ? CHART_COLORS.textDim : node.color)
        .attr('opacity', node.label === 'Drift' ? 0.03 : 0.08)

      // Label
      if (nodeH > 12) {
        g.append('text')
          .attr('x', rightX + 5).attr('y', nodeY + nodeH / 2 + 1)
          .attr('dominant-baseline', 'middle')
          .attr('fill', node.label === 'Drift' ? CHART_COLORS.textDim : CHART_COLORS.textPrimary)
          .attr('font-size', 7)
          .attr('font-weight', 600)
          .attr('font-family', 'var(--font-mono)')
          .text(node.label.length > 8 ? node.label.slice(0, 7) + '.' : node.label)

        g.append('text')
          .attr('x', rightX + rightW - 5).attr('y', nodeY + nodeH / 2 + 1)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('fill', node.label === 'Drift' ? CHART_COLORS.textDim : CHART_COLORS.textSecondary)
          .attr('font-size', 7)
          .attr('font-family', 'var(--font-mono)')
          .attr('opacity', 0.6)
          .text(`${node.hours}h`)
      }

      yOffset += nodeH + nodeGap
    })

  }, [width, data])

  if (data.totalTracked === 0) {
    return (
      <div className="border border-[#252525] bg-[#141414] p-4 rounded-sm">
        <p className="text-[9px] font-medium tracking-[0.15em] text-[#4A4640] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Time Allocation
        </p>
        <p className="text-xs mt-2" style={{ color: CHART_COLORS.textMuted }}>Log habits this week to see your time flow.</p>
      </div>
    )
  }

  return (
    <div className="border border-[#252525] bg-[#141414] p-4 rounded-sm">
      <div className="mb-2">
        <p className="text-[9px] font-medium tracking-[0.15em] text-[#4A4640] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Time Allocation
        </p>
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      </div>
    </div>
  )
}
