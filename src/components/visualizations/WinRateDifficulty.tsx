import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Goal {
  label: string
  difficulty: number // 1-10
  winRate: number    // 0-100
  domain: string
  color: string
}

interface Props {
  goals?: Goal[]
}

const DEFAULT_GOALS: Goal[] = [
  { label: 'Daily walk', difficulty: 2, winRate: 90, domain: 'Health', color: '#22c55e' },
  { label: 'Meditation', difficulty: 3, winRate: 65, domain: 'Mental', color: '#8b5cf6' },
  { label: 'Chinese study', difficulty: 7, winRate: 35, domain: 'Learning', color: '#3b82f6' },
  { label: 'Deep work 4h', difficulty: 6, winRate: 55, domain: 'Work', color: '#FF6B35' },
  { label: 'Savings target', difficulty: 5, winRate: 72, domain: 'Wealth', color: '#eab308' },
  { label: 'Scratch golf', difficulty: 9, winRate: 20, domain: 'Health', color: '#22c55e' },
  { label: 'Weekly call home', difficulty: 2, winRate: 80, domain: 'Family', color: '#8b5cf6' },
  { label: 'Ship side project', difficulty: 8, winRate: 40, domain: 'Work', color: '#FF6B35' },
]

export function WinRateDifficulty({ goals = DEFAULT_GOALS }: Props) {
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
    ctx.fillText('WIN RATE vs DIFFICULTY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Quadrant dividers
    const midX = ml + chartW / 2
    const midY = mt + chartH / 2

    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(midX, mt)
    ctx.lineTo(midX, mt + chartH)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ml, midY)
    ctx.lineTo(ml + chartW, midY)
    ctx.stroke()
    ctx.setLineDash([])

    // Quadrant labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.globalAlpha = 0.25
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22c55e'
    ctx.fillText('EASY WINS', ml + chartW * 0.25, mt + 10)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('GROWTH EDGE', ml + chartW * 0.75, mt + 10)
    ctx.fillStyle = '#eab308'
    ctx.fillText('COMFORT ZONE', ml + chartW * 0.25, mt + chartH - 6)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('OVERREACH', ml + chartW * 0.75, mt + chartH - 6)
    ctx.globalAlpha = 1

    // Axis labels
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Difficulty →', ml + chartW / 2, mt + chartH + 14)
    ctx.save()
    ctx.translate(ml - 14, mt + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Win Rate →', 0, 0)
    ctx.restore()

    // Plot goals
    goals.forEach(g => {
      const x = ml + ((g.difficulty - 1) / 9) * chartW
      const y = mt + chartH - (g.winRate / 100) * chartH

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = `${g.color}30`
      ctx.fill()
      ctx.strokeStyle = g.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = g.color
      ctx.textAlign = 'center'
      ctx.fillText(g.label, x, y - 8)
    })

  }, [width, goals])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
