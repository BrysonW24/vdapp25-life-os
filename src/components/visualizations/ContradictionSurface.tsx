import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Contradiction {
  stated: string
  actual: string
  severity: number // 0-100
  domain: string
}

interface Props {
  contradictions?: Contradiction[]
}

const DEFAULT_CONTRADICTIONS: Contradiction[] = [
  { stated: 'Health is #1', actual: 'Skip gym 3x/wk', severity: 75, domain: 'Health' },
  { stated: 'Want deep work', actual: 'Check phone 40x/d', severity: 85, domain: 'Work' },
  { stated: 'Save more', actual: 'Impulse buys +20%', severity: 60, domain: 'Wealth' },
  { stated: 'Family first', actual: 'Missed 4 calls', severity: 55, domain: 'Family' },
  { stated: 'Learning Chinese', actual: '0 sessions/wk', severity: 90, domain: 'Learning' },
]

export function ContradictionSurface({ contradictions = DEFAULT_CONTRADICTIONS }: Props) {
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
    ctx.fillText('CONTRADICTION SURFACE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28
    const cardW = width - ml - mr
    const cardH = 30
    const gap = 6

    const sorted = [...contradictions].sort((a, b) => b.severity - a.severity)

    sorted.forEach((c, i) => {
      const y = mt + i * (cardH + gap)
      const sevColor = c.severity >= 70 ? '#ef4444' : c.severity >= 40 ? '#eab308' : '#3b82f6'

      // Card
      ctx.beginPath()
      ctx.roundRect(ml, y, cardW, cardH, 6)
      ctx.fillStyle = `${sevColor}08`
      ctx.fill()
      ctx.strokeStyle = `${sevColor}25`
      ctx.lineWidth = 1
      ctx.stroke()

      // Severity bar
      const barW = (c.severity / 100) * cardW
      ctx.fillStyle = `${sevColor}12`
      ctx.fillRect(ml + 1, y + 1, barW, cardH - 2)

      // Stated vs actual
      const midX = ml + cardW / 2
      ctx.font = `400 5px 'JetBrains Mono', monospace`

      // Left side — stated
      ctx.fillStyle = '#22c55e'
      ctx.textAlign = 'right'
      ctx.fillText(`"${c.stated}"`, midX - 8, y + 12)

      // Divider
      ctx.fillStyle = sevColor
      ctx.textAlign = 'center'
      ctx.fillText('≠', midX, y + 12)

      // Right side — actual
      ctx.fillStyle = '#ef4444'
      ctx.textAlign = 'left'
      ctx.fillText(c.actual, midX + 8, y + 12)

      // Domain + severity
      ctx.font = `400 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(c.domain, ml + 8, y + 23)
      ctx.textAlign = 'right'
      ctx.fillStyle = sevColor
      ctx.fillText(`${c.severity}%`, ml + cardW - 8, y + 23)
    })

    // Integrity score
    const avgSeverity = sorted.reduce((s, c) => s + c.severity, 0) / sorted.length
    const integrity = Math.round(100 - avgSeverity)
    const intColor = integrity >= 60 ? '#22c55e' : integrity >= 35 ? '#eab308' : '#ef4444'

    ctx.font = `700 10px 'Inter', sans-serif`
    ctx.fillStyle = intColor
    ctx.textAlign = 'right'
    ctx.fillText(`${integrity}%`, width - 12, 24)
    ctx.font = `400 5px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('INTEGRITY', width - 12, 32)

  }, [width, contradictions])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
