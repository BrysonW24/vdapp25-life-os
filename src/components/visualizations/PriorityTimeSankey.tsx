import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Flow {
  priority: string
  priorityRank: number // 1-6
  timePercent: number  // actual time allocation
  color: string
}

interface Props {
  flows?: Flow[]
}

const DEFAULT_FLOWS: Flow[] = [
  { priority: 'Health', priorityRank: 1, timePercent: 8, color: '#22c55e' },
  { priority: 'Work', priorityRank: 2, timePercent: 45, color: '#3b82f6' },
  { priority: 'Family', priorityRank: 3, timePercent: 10, color: '#8b5cf6' },
  { priority: 'Learning', priorityRank: 4, timePercent: 5, color: '#eab308' },
  { priority: 'Wealth', priorityRank: 5, timePercent: 12, color: '#FF6B35' },
  { priority: 'Social', priorityRank: 6, timePercent: 20, color: '#ef4444' },
]

export function PriorityTimeSankey({ flows = DEFAULT_FLOWS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 220

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 200) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('PRIORITY vs TIME', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 32, mb = 8
    const chartH = height - mt - mb
    const colW = 60
    const leftX = ml + 20
    const rightX = width - mr - colW - 20
    const barGap = 4

    // Sort by priority rank for left column
    const byPriority = [...flows].sort((a, b) => a.priorityRank - b.priorityRank)
    // Sort by time allocation for right column
    const byTime = [...flows].sort((a, b) => b.timePercent - a.timePercent)

    const totalTime = flows.reduce((s, f) => s + f.timePercent, 0)

    // Left column — priority order
    let leftY = mt
    const leftPositions: Record<string, { y: number; h: number }> = {}
    const barH = (chartH - (byPriority.length - 1) * barGap) / byPriority.length

    byPriority.forEach((f, i) => {
      const y = mt + i * (barH + barGap)
      leftPositions[f.priority] = { y, h: barH }

      ctx.beginPath()
      ctx.roundRect(leftX, y, colW, barH, 4)
      ctx.fillStyle = `${f.color}20`
      ctx.fill()
      ctx.strokeStyle = `${f.color}40`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = `500 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = f.color
      ctx.textAlign = 'center'
      ctx.fillText(`#${f.priorityRank} ${f.priority}`, leftX + colW / 2, y + barH / 2 + 2)
    })

    // Right column — time order
    let rightY = mt
    const rightPositions: Record<string, { y: number; h: number }> = {}

    byTime.forEach(f => {
      const h = Math.max(12, (f.timePercent / totalTime) * chartH)
      rightPositions[f.priority] = { y: rightY, h }

      ctx.beginPath()
      ctx.roundRect(rightX, rightY, colW, h, 4)
      ctx.fillStyle = `${f.color}20`
      ctx.fill()
      ctx.strokeStyle = `${f.color}40`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = `500 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = f.color
      ctx.textAlign = 'center'
      if (h > 14) ctx.fillText(`${f.timePercent}%`, rightX + colW / 2, rightY + h / 2 + 2)

      rightY += h + barGap
    })

    // Sankey flows
    flows.forEach(f => {
      const left = leftPositions[f.priority]
      const right = rightPositions[f.priority]
      if (!left || !right) return

      const lx = leftX + colW
      const rx = rightX
      const ly = left.y + left.h / 2
      const ry = right.y + right.h / 2
      const cpx = (lx + rx) / 2

      // Mismatch coloring
      const priorityIndex = byPriority.findIndex(bf => bf.priority === f.priority)
      const timeIndex = byTime.findIndex(bf => bf.priority === f.priority)
      const mismatch = Math.abs(priorityIndex - timeIndex)
      const flowAlpha = mismatch >= 2 ? '25' : '12'

      ctx.beginPath()
      ctx.moveTo(lx, ly - 4)
      ctx.bezierCurveTo(cpx, ly - 4, cpx, ry - 4, rx, ry - 4)
      ctx.lineTo(rx, ry + 4)
      ctx.bezierCurveTo(cpx, ry + 4, cpx, ly + 4, lx, ly + 4)
      ctx.closePath()
      ctx.fillStyle = `${f.color}${flowAlpha}`
      ctx.fill()
    })

    // Column headers
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('PRIORITY', leftX + colW / 2, mt - 8)
    ctx.fillText('TIME SPENT', rightX + colW / 2, mt - 8)

  }, [width, flows])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
