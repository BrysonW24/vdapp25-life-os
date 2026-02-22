import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface KnowledgeItem {
  label: string
  daysSinceReview: number
  strength: number // 0-100, decays over time
  color: string
}

interface Props {
  items?: KnowledgeItem[]
}

const DEFAULT_ITEMS: KnowledgeItem[] = [
  { label: 'React Patterns', daysSinceReview: 2, strength: 95, color: '#3b82f6' },
  { label: 'SQL Joins', daysSinceReview: 14, strength: 72, color: '#8b5cf6' },
  { label: 'Chinese Tones', daysSinceReview: 5, strength: 60, color: '#22c55e' },
  { label: 'Stats Basics', daysSinceReview: 30, strength: 45, color: '#eab308' },
  { label: 'Piano Chords', daysSinceReview: 60, strength: 25, color: '#ef4444' },
]

export function RecallStrengthCurve({ items }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const data = useMemo(() => items ?? DEFAULT_ITEMS, [items])
  const height = 200

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
    ctx.fillText('RECALL STRENGTH', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const maxDays = 90

    // Decay reference curves (Ebbinghaus-inspired)
    for (const halfLife of [7, 21, 60]) {
      ctx.beginPath()
      for (let d = 0; d <= maxDays; d += 1) {
        const x = ml + (d / maxDays) * chartW
        const y = mt + chartH - (100 * Math.exp(-0.693 * d / halfLife) / 100) * chartH
        if (d === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Danger zone
    ctx.fillStyle = '#ef444408'
    ctx.fillRect(ml, mt + chartH * 0.7, chartW, chartH * 0.3)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#ef4444'
    ctx.globalAlpha = 0.3
    ctx.textAlign = 'right'
    ctx.fillText('FORGOTTEN', ml + chartW - 4, mt + chartH - 4)
    ctx.globalAlpha = 1

    // Plot items
    data.forEach(item => {
      const x = ml + (Math.min(item.daysSinceReview, maxDays) / maxDays) * chartW
      const y = mt + chartH - (item.strength / 100) * chartH

      // Glow
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = `${item.color}15`
      ctx.fill()

      // Dot
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = `${item.color}40`
      ctx.fill()
      ctx.strokeStyle = item.color
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = item.color
      ctx.textAlign = 'center'
      ctx.fillText(item.label, x, y - 10)
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${item.daysSinceReview}d`, x, y + 14)
    })

    // Axis labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Days since review →', ml + chartW / 2, mt + chartH + 14)
    ctx.save()
    ctx.translate(ml - 14, mt + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Recall %', 0, 0)
    ctx.restore()

  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
