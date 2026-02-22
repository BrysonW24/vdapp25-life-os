import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Skill {
  label: string
  peakLevel: number      // 0-100
  daysSincePractice: number
  halfLife: number       // days until 50% decay
  color: string
}

interface Props {
  skills?: Skill[]
}

const DEFAULT_SKILLS: Skill[] = [
  { label: 'React', peakLevel: 90, daysSincePractice: 5, halfLife: 60, color: '#3b82f6' },
  { label: 'Python', peakLevel: 80, daysSincePractice: 30, halfLife: 45, color: '#22c55e' },
  { label: 'Chinese', peakLevel: 45, daysSincePractice: 14, halfLife: 14, color: '#8b5cf6' },
  { label: 'Piano', peakLevel: 35, daysSincePractice: 90, halfLife: 30, color: '#eab308' },
  { label: 'Golf', peakLevel: 40, daysSincePractice: 21, halfLife: 21, color: '#FF6B35' },
]

export function SkillAtrophyCurve({ skills = DEFAULT_SKILLS }: Props) {
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
    ctx.fillText('SKILL ATROPHY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 28, mr = 12, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const maxDays = 120

    // Draw decay curves
    skills.forEach(skill => {
      ctx.beginPath()
      for (let d = 0; d <= maxDays; d += 1) {
        const x = ml + (d / maxDays) * chartW
        const currentLevel = skill.peakLevel * Math.exp(-0.693 * d / skill.halfLife)
        const y = mt + chartH - (currentLevel / 100) * chartH
        if (d === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = skill.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1

      // Current position marker
      const currentD = Math.min(skill.daysSincePractice, maxDays)
      const currentLevel = skill.peakLevel * Math.exp(-0.693 * currentD / skill.halfLife)
      const cx = ml + (currentD / maxDays) * chartW
      const cy = mt + chartH - (currentLevel / 100) * chartH

      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = `${skill.color}40`
      ctx.fill()
      ctx.strokeStyle = skill.color
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label at current position
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = skill.color
      ctx.textAlign = 'left'
      ctx.fillText(`${skill.label} ${Math.round(currentLevel)}%`, cx + 6, cy + 3)
    })

    // Danger threshold
    const dangerY = mt + chartH - (30 / 100) * chartH
    ctx.beginPath()
    ctx.moveTo(ml, dangerY)
    ctx.lineTo(ml + chartW, dangerY)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 0.5
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#ef4444'
    ctx.textAlign = 'right'
    ctx.fillText('ATROPHIED', ml + chartW, dangerY - 4)

    // Axis labels
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('Days without practice →', ml + chartW / 2, mt + chartH + 14)

  }, [width, skills])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
