import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Interaction {
  label: string
  energyBefore: number
  energyAfter: number
  duration: number // minutes
  category: 'energising' | 'neutral' | 'draining'
}

interface Props {
  interactions?: Interaction[]
}

function generateDefaults(): Interaction[] {
  return [
    { label: 'Coffee w/ mentor', energyBefore: 55, energyAfter: 80, duration: 45, category: 'energising' },
    { label: 'Team standup', energyBefore: 60, energyAfter: 50, duration: 15, category: 'draining' },
    { label: 'Dinner w/ partner', energyBefore: 45, energyAfter: 75, duration: 90, category: 'energising' },
    { label: 'Client call', energyBefore: 70, energyAfter: 40, duration: 60, category: 'draining' },
    { label: 'Gym w/ friend', energyBefore: 50, energyAfter: 85, duration: 75, category: 'energising' },
    { label: 'Family gathering', energyBefore: 65, energyAfter: 55, duration: 120, category: 'neutral' },
    { label: 'Networking event', energyBefore: 55, energyAfter: 30, duration: 90, category: 'draining' },
    { label: '1:1 deep talk', energyBefore: 40, energyAfter: 70, duration: 60, category: 'energising' },
  ]
}

export function EnergyAfterInteraction({ interactions }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const data = useMemo(() => interactions ?? generateDefaults(), [interactions])
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
    ctx.fillText('ENERGY AFTER INTERACTION', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 32, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Diagonal "no change" line
    ctx.beginPath()
    ctx.moveTo(ml, mt)
    ctx.lineTo(ml + chartW, mt + chartH)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Grid
    for (let v = 0; v <= 100; v += 25) {
      const x = ml + (v / 100) * chartW
      const y = mt + chartH - (v / 100) * chartH
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x, mt)
      ctx.lineTo(x, mt + chartH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ml, y)
      ctx.lineTo(ml + chartW, y)
      ctx.stroke()
    }

    // Axis labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Energy Before →', ml + chartW / 2, mt + chartH + 12)
    ctx.save()
    ctx.translate(ml - 14, mt + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Energy After →', 0, 0)
    ctx.restore()

    // Quadrant labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'left'
    ctx.fillText('ENERGISING', ml + 4, mt + 10)
    ctx.fillStyle = '#ef4444'
    ctx.textAlign = 'right'
    ctx.fillText('DRAINING', ml + chartW - 4, mt + chartH - 6)
    ctx.globalAlpha = 1

    // Plot interactions
    const catColors = { energising: '#22c55e', neutral: '#eab308', draining: '#ef4444' }

    data.forEach(d => {
      const x = ml + (d.energyBefore / 100) * chartW
      const y = mt + chartH - (d.energyAfter / 100) * chartH
      const r = 3 + (d.duration / 120) * 5
      const color = catColors[d.category]

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `${color}30`
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label (only for larger dots)
      if (r > 4) {
        ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.fillText(d.label, x, y - r - 3)
      }
    })

  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
