import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface DayPoint {
  mood: number    // 0-100
  energy: number  // 0-100
  stress: number  // 0-100
  daysAgo: number
}

interface Props {
  points?: DayPoint[]
}

function generateDefaults(): DayPoint[] {
  return Array.from({ length: 30 }, (_, i) => ({
    mood: 40 + Math.random() * 40,
    energy: 35 + Math.random() * 45,
    stress: 20 + Math.random() * 50,
    daysAgo: 29 - i,
  }))
}

export function MoodEnergyStressTriangle({ points }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const data = useMemo(() => points ?? generateDefaults(), [points])
  const height = 240

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
    ctx.fillText('MOOD · ENERGY · STRESS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cx = width / 2
    const cy = 140
    const triR = Math.min(width * 0.35, 90)

    // Triangle vertices
    const top = { x: cx, y: cy - triR }                    // Mood
    const bl = { x: cx - triR * 0.87, y: cy + triR * 0.5 } // Energy
    const br = { x: cx + triR * 0.87, y: cy + triR * 0.5 } // Stress

    // Draw triangle
    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(bl.x, bl.y)
    ctx.lineTo(br.x, br.y)
    ctx.closePath()
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#1e1e3520'
    ctx.fill()

    // Axis labels
    ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = '#22c55e'
    ctx.fillText('MOOD', top.x, top.y - 8)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('ENERGY', bl.x - 8, bl.y + 14)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('STRESS', br.x + 8, br.y + 14)

    // Plot points using barycentric coordinates
    data.forEach(p => {
      const total = p.mood + p.energy + p.stress
      if (total === 0) return
      const wMood = p.mood / total
      const wEnergy = p.energy / total
      const wStress = p.stress / total

      const px = wMood * top.x + wEnergy * bl.x + wStress * br.x
      const py = wMood * top.y + wEnergy * bl.y + wStress * br.y

      const recency = 1 - p.daysAgo / 30
      const alpha = 0.15 + recency * 0.7
      const r = 2 + recency * 2

      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`
      ctx.fill()

      if (p.daysAgo < 3) {
        ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Cluster center for last 7 days
    const recent = data.filter(d => d.daysAgo < 7)
    if (recent.length > 0) {
      const avgMood = recent.reduce((s, p) => s + p.mood, 0) / recent.length
      const avgEnergy = recent.reduce((s, p) => s + p.energy, 0) / recent.length
      const avgStress = recent.reduce((s, p) => s + p.stress, 0) / recent.length
      const total = avgMood + avgEnergy + avgStress
      const cx2 = (avgMood / total) * top.x + (avgEnergy / total) * bl.x + (avgStress / total) * br.x
      const cy2 = (avgMood / total) * top.y + (avgEnergy / total) * bl.y + (avgStress / total) * br.y

      ctx.beginPath()
      ctx.arc(cx2, cy2, 6, 0, Math.PI * 2)
      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'left'
      ctx.fillText('7d center', cx2 + 10, cy2 + 3)
    }

  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
