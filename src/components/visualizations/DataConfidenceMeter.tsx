import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface DomainConfidence {
  domain: string
  dataPoints: number
  freshness: number  // 0-100
  consistency: number // 0-100
  color: string
}

interface Props {
  domains?: DomainConfidence[]
}

const DEFAULT_DOMAINS: DomainConfidence[] = [
  { domain: 'Health', dataPoints: 350, freshness: 95, consistency: 88, color: '#22c55e' },
  { domain: 'Mental', dataPoints: 180, freshness: 72, consistency: 65, color: '#8b5cf6' },
  { domain: 'Work', dataPoints: 240, freshness: 80, consistency: 75, color: '#3b82f6' },
  { domain: 'Wealth', dataPoints: 120, freshness: 60, consistency: 90, color: '#eab308' },
  { domain: 'Social', dataPoints: 90, freshness: 45, consistency: 55, color: '#FF6B35' },
  { domain: 'Learning', dataPoints: 60, freshness: 50, consistency: 40, color: '#ef4444' },
]

export function DataConfidenceMeter({ domains = DEFAULT_DOMAINS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
    ctx.fillText('DATA CONFIDENCE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 56, mr = 12, mt = 28, mb = 8
    const chartW = width - ml - mr
    const barH = 20
    const gap = 6

    domains.forEach((d, i) => {
      const y = mt + i * (barH + gap)
      const confidence = Math.round((d.freshness * 0.4 + d.consistency * 0.4 + Math.min(d.dataPoints / 300, 1) * 100 * 0.2))
      const confColor = confidence >= 70 ? d.color : confidence >= 40 ? '#eab308' : '#ef4444'

      // Label
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'right'
      ctx.fillText(d.domain, ml - 6, y + barH / 2 + 2)

      // Background
      ctx.fillStyle = CHART_COLORS.gridLine
      ctx.fillRect(ml, y, chartW, barH)

      // Stacked bar segments
      const freshW = (d.freshness / 100) * chartW * 0.4
      const consW = (d.consistency / 100) * chartW * 0.4
      const dpW = Math.min(d.dataPoints / 300, 1) * chartW * 0.2

      ctx.fillStyle = `${d.color}30`
      ctx.fillRect(ml, y, freshW, barH)
      ctx.fillStyle = `${d.color}20`
      ctx.fillRect(ml + freshW, y, consW, barH)
      ctx.fillStyle = `${d.color}10`
      ctx.fillRect(ml + freshW + consW, y, dpW, barH)

      // Confidence overlay line
      const totalW = (confidence / 100) * chartW
      ctx.strokeStyle = confColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(ml + totalW, y)
      ctx.lineTo(ml + totalW, y + barH)
      ctx.stroke()

      // Confidence %
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = confColor
      ctx.textAlign = 'left'
      ctx.fillText(`${confidence}%`, ml + totalW + 4, y + barH / 2 + 2)
    })

    // Overall confidence
    const overallConf = Math.round(domains.reduce((s, d) =>
      s + (d.freshness * 0.4 + d.consistency * 0.4 + Math.min(d.dataPoints / 300, 1) * 100 * 0.2), 0) / domains.length)
    const overColor = overallConf >= 70 ? '#22c55e' : overallConf >= 40 ? '#eab308' : '#ef4444'

    ctx.font = `700 ${chartFontSize(10, width)}px 'Inter', sans-serif`
    ctx.fillStyle = overColor
    ctx.textAlign = 'right'
    ctx.fillText(`${overallConf}%`, width - 12, 24)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('OVERALL', width - 12, 32)

  }, [width, domains])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
