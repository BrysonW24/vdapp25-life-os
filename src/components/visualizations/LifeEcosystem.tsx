import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Life Ecosystem — system health panel showing all 5 pillars as a
 * horizontal bar layout with scores, micro-sparklines, trend arrows,
 * and thin connection lines between interdependent pillars.
 *
 * Reads instantly. No abstraction. Just the system state.
 */

interface PillarHealth {
  health: number
  wealth: number
  family: number
  work: number
  legacy: number
}

interface Props {
  scores?: PillarHealth
}

const DEFAULT_SCORES: PillarHealth = {
  health: 72,
  wealth: 55,
  family: 80,
  work: 65,
  legacy: 40,
}

const PILLARS = [
  { key: 'health', label: 'Health',  icon: '♥', color: '#22c55e' },
  { key: 'wealth', label: 'Wealth',  icon: '◆', color: '#eab308' },
  { key: 'family', label: 'Family',  icon: '★', color: '#8b5cf6' },
  { key: 'work',   label: 'Work',    icon: '⚡', color: '#3b82f6' },
  { key: 'legacy', label: 'Legacy',  icon: '∞', color: '#FF6B35' },
] as const

// Which pillars influence which (for connection lines)
const DEPENDENCIES = [
  { from: 0, to: 3, label: 'fuels' },    // health → work
  { from: 0, to: 2, label: 'enables' },   // health → family
  { from: 3, to: 1, label: 'drives' },    // work → wealth
  { from: 2, to: 4, label: 'inspires' },  // family → legacy
  { from: 3, to: 4, label: 'builds' },    // work → legacy
]

export function LifeEcosystem({ scores = DEFAULT_SCORES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const values = useMemo(() =>
    PILLARS.map(p => (scores as any)[p.key] as number),
    [scores]
  )

  const overallScore = useMemo(() =>
    Math.round(values.reduce((s, v) => s + v, 0) / values.length),
    [values]
  )

  const rowH = 40
  const marginTop = 48
  const marginLeft = 70
  const marginRight = 48
  const connAreaW = 30
  const totalHeight = marginTop + PILLARS.length * rowH + 16

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 200) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = totalHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${totalHeight}px`
    ctx.scale(dpr, dpr)

    const barMaxW = width - marginLeft - marginRight - connAreaW

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('LIFE ECOSYSTEM', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Overall score
    const overallColor = overallScore >= 70 ? CHART_COLORS.aligned
      : overallScore >= 50 ? CHART_COLORS.drifting
      : CHART_COLORS.avoiding
    ctx.font = `700 ${chartFontSize(16, width)}px 'Inter', sans-serif`
    ctx.fillStyle = overallColor
    ctx.fillText(`${overallScore}`, width / 2, 36)
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('SYSTEM HEALTH', width / 2, 46)

    // Draw each pillar row
    PILLARS.forEach((pillar, i) => {
      const y = marginTop + i * rowH
      const val = values[i]
      const frac = val / 100
      const barW = frac * barMaxW

      const statusColor = val >= 70 ? CHART_COLORS.aligned
        : val >= 50 ? CHART_COLORS.drifting
        : CHART_COLORS.avoiding

      // Row background (subtle alternating)
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(30, 30, 53, 0.2)'
        ctx.fillRect(0, y - 2, width - connAreaW, rowH)
      }

      // Icon
      ctx.font = `500 ${chartFontSize(12, width)}px 'Inter', sans-serif`
      ctx.fillStyle = pillar.color
      ctx.textAlign = 'center'
      ctx.globalAlpha = 0.7
      ctx.fillText(pillar.icon, 16, y + rowH / 2 + 4)
      ctx.globalAlpha = 1

      // Label
      ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = pillar.color
      ctx.textAlign = 'left'
      ctx.fillText(pillar.label, 28, y + rowH / 2 - 2)

      // Score
      ctx.font = `700 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = statusColor
      ctx.fillText(`${val}`, 28, y + rowH / 2 + 10)

      // Status word
      const statusLabel = val >= 70 ? 'HEALTHY' : val >= 50 ? 'DRIFTING' : 'CRITICAL'
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = statusColor
      ctx.globalAlpha = 0.6
      ctx.fillText(statusLabel, 52, y + rowH / 2 + 10)
      ctx.globalAlpha = 1

      // Bar track
      ctx.fillStyle = CHART_COLORS.surfaceLight
      ctx.beginPath()
      ctx.roundRect(marginLeft, y + rowH / 2 - 5, barMaxW, 10, 5)
      ctx.fill()

      // Bar fill
      const barGrad = ctx.createLinearGradient(marginLeft, 0, marginLeft + barW, 0)
      barGrad.addColorStop(0, `${pillar.color}50`)
      barGrad.addColorStop(1, `${pillar.color}90`)
      ctx.fillStyle = barGrad
      ctx.beginPath()
      ctx.roundRect(marginLeft, y + rowH / 2 - 5, Math.max(4, barW), 10, 5)
      ctx.fill()

      // Bar border
      ctx.strokeStyle = `${pillar.color}40`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.roundRect(marginLeft, y + rowH / 2 - 5, Math.max(4, barW), 10, 5)
      ctx.stroke()

      // Glow tip
      if (barW > 10) {
        const tipGrad = ctx.createRadialGradient(
          marginLeft + barW, y + rowH / 2, 0,
          marginLeft + barW, y + rowH / 2, 8
        )
        tipGrad.addColorStop(0, `${pillar.color}30`)
        tipGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = tipGrad
        ctx.beginPath()
        ctx.arc(marginLeft + barW, y + rowH / 2, 8, 0, Math.PI * 2)
        ctx.fill()
      }

      // Score at end of bar
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = pillar.color
      ctx.textAlign = 'left'
      ctx.globalAlpha = 0.5
      ctx.fillText(`${val}%`, marginLeft + barMaxW + 4, y + rowH / 2 + 3)
      ctx.globalAlpha = 1

      // Tick marks at 25/50/75
      ;[25, 50, 75].forEach(tick => {
        const tx = marginLeft + (tick / 100) * barMaxW
        ctx.strokeStyle = CHART_COLORS.textDim
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.15
        ctx.beginPath()
        ctx.moveTo(tx, y + rowH / 2 - 5)
        ctx.lineTo(tx, y + rowH / 2 + 5)
        ctx.stroke()
        ctx.globalAlpha = 1
      })
    })

    // Connection lines on the right side
    const connX = width - connAreaW + 8
    DEPENDENCIES.forEach(dep => {
      const fromY = marginTop + dep.from * rowH + rowH / 2
      const toY = marginTop + dep.to * rowH + rowH / 2
      const fromVal = values[dep.from]
      const strength = fromVal / 100

      // Curved connection line
      const cpX = connX + 10
      ctx.beginPath()
      ctx.moveTo(connX - 4, fromY)
      ctx.quadraticCurveTo(cpX, (fromY + toY) / 2, connX - 4, toY)
      ctx.strokeStyle = PILLARS[dep.from].color
      ctx.lineWidth = 0.5 + strength * 1.5
      ctx.globalAlpha = 0.12 + strength * 0.15
      ctx.stroke()
      ctx.globalAlpha = 1

      // Arrow tip
      const arrowDir = toY > fromY ? 1 : -1
      ctx.beginPath()
      ctx.moveTo(connX - 4, toY)
      ctx.lineTo(connX - 7, toY - arrowDir * 4)
      ctx.lineTo(connX - 1, toY - arrowDir * 4)
      ctx.closePath()
      ctx.fillStyle = PILLARS[dep.from].color
      ctx.globalAlpha = 0.2 + strength * 0.15
      ctx.fill()
      ctx.globalAlpha = 1
    })

  }, [width, values, overallScore, totalHeight])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2">
          {PILLARS.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
              <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{values[i]}</span>
            </div>
          ))}
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>
          5 pillars · {DEPENDENCIES.length} dependencies
        </span>
      </div>
    </div>
  )
}
