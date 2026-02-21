import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Investment {
  label: string
  hoursInvested: number
  valueReturned: number // 0-100 subjective
  color: string
}

interface Props {
  investments?: Investment[]
}

const DEFAULT_INVESTMENTS: Investment[] = [
  { label: 'TypeScript', hoursInvested: 200, valueReturned: 90, color: '#3b82f6' },
  { label: 'System Design', hoursInvested: 80, valueReturned: 75, color: '#8b5cf6' },
  { label: 'Chinese', hoursInvested: 150, valueReturned: 35, color: '#22c55e' },
  { label: 'Golf', hoursInvested: 120, valueReturned: 45, color: '#eab308' },
  { label: 'Writing', hoursInvested: 60, valueReturned: 65, color: '#FF6B35' },
  { label: 'Sales', hoursInvested: 30, valueReturned: 50, color: '#ef4444' },
]

export function LearningROI({ investments = DEFAULT_INVESTMENTS }: Props) {
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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('LEARNING ROI', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const maxHours = Math.max(...investments.map(i => i.hoursInvested)) * 1.1

    // Efficiency diagonal (ROI = 1)
    ctx.beginPath()
    ctx.moveTo(ml, mt + chartH)
    ctx.lineTo(ml + chartW, mt)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Zone labels
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.globalAlpha = 0.25
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22c55e'
    ctx.fillText('HIGH ROI', ml + chartW * 0.25, mt + 10)
    ctx.fillStyle = '#eab308'
    ctx.fillText('LOW ROI', ml + chartW * 0.75, mt + chartH - 6)
    ctx.globalAlpha = 1

    // Bubble chart
    investments.forEach(inv => {
      const x = ml + (inv.hoursInvested / maxHours) * chartW
      const y = mt + chartH - (inv.valueReturned / 100) * chartH
      const roi = inv.valueReturned / (inv.hoursInvested / maxHours * 100)
      const r = Math.max(4, Math.min(12, roi * 5))

      // Bubble
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `${inv.color}25`
      ctx.fill()
      ctx.strokeStyle = inv.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = inv.color
      ctx.textAlign = 'center'
      ctx.fillText(inv.label, x, y - r - 4)
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${inv.hoursInvested}h`, x, y + r + 8)
    })

    // Axis labels
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Hours invested →', ml + chartW / 2, mt + chartH + 14)
    ctx.save()
    ctx.translate(ml - 14, mt + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Value returned →', 0, 0)
    ctx.restore()

  }, [width, investments])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
