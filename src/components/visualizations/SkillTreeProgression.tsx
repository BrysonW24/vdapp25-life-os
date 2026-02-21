import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Skill {
  label: string
  level: number // 0-100
  category: string
  color: string
}

interface Props {
  skills?: Skill[]
}

const DEFAULT_SKILLS: Skill[] = [
  { label: 'TypeScript', level: 85, category: 'Engineering', color: '#3b82f6' },
  { label: 'Python', level: 78, category: 'Engineering', color: '#3b82f6' },
  { label: 'System Design', level: 65, category: 'Engineering', color: '#3b82f6' },
  { label: 'Leadership', level: 55, category: 'Business', color: '#FF6B35' },
  { label: 'Sales', level: 40, category: 'Business', color: '#FF6B35' },
  { label: 'Writing', level: 70, category: 'Creative', color: '#8b5cf6' },
  { label: 'Chinese', level: 25, category: 'Language', color: '#22c55e' },
  { label: 'Golf', level: 35, category: 'Physical', color: '#eab308' },
]

export function SkillTreeProgression({ skills = DEFAULT_SKILLS }: Props) {
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
    ctx.fillText('SKILL TREE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 64, mr = 12, mt = 28, mb = 8
    const chartW = width - ml - mr
    const barH = Math.min(16, (height - mt - mb) / skills.length - 4)
    const gap = 4

    // Sort by level descending
    const sorted = [...skills].sort((a, b) => b.level - a.level)

    sorted.forEach((skill, i) => {
      const y = mt + i * (barH + gap)

      // Label
      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'right'
      ctx.fillText(skill.label, ml - 6, y + barH / 2 + 2)

      // Background bar
      ctx.fillStyle = CHART_COLORS.gridLine
      ctx.fillRect(ml, y, chartW, barH)

      // Progress bar
      const barWidth = (skill.level / 100) * chartW
      ctx.fillStyle = `${skill.color}40`
      ctx.fillRect(ml, y, barWidth, barH)

      // Progress border
      ctx.strokeStyle = skill.color
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.6
      ctx.strokeRect(ml, y, barWidth, barH)
      ctx.globalAlpha = 1

      // Level markers (25/50/75)
      for (const mark of [25, 50, 75]) {
        const mx = ml + (mark / 100) * chartW
        ctx.strokeStyle = CHART_COLORS.border
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(mx, y)
        ctx.lineTo(mx, y + barH)
        ctx.stroke()
      }

      // Level text
      ctx.font = `500 5px 'JetBrains Mono', monospace`
      ctx.fillStyle = skill.color
      ctx.textAlign = 'left'
      ctx.fillText(`${skill.level}`, ml + barWidth + 4, y + barH / 2 + 2)

      // Category dot
      ctx.beginPath()
      ctx.arc(ml - 2, y + barH / 2, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = skill.color
      ctx.fill()
    })

  }, [width, skills])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
