import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Deficiency {
  nutrient: string
  level: number // 0-100 (100 = adequate)
  symptom: string
  region: 'head' | 'chest' | 'core' | 'limbs'
  color: string
}

interface Props {
  deficiencies?: Deficiency[]
}

const DEFAULT_DEFICIENCIES: Deficiency[] = [
  { nutrient: 'Vitamin D', level: 35, symptom: 'Mood baseline dropping', region: 'chest', color: '#eab308' },
  { nutrient: 'Magnesium', level: 42, symptom: 'Sleep quality degrading', region: 'head', color: '#8b5cf6' },
  { nutrient: 'Iron', level: 55, symptom: 'Fatigue correlation detected', region: 'limbs', color: '#ef4444' },
  { nutrient: 'Omega-3', level: 60, symptom: 'Inflammation markers elevated', region: 'core', color: '#3b82f6' },
  { nutrient: 'B12', level: 72, symptom: 'Cognitive fog signals', region: 'head', color: '#22c55e' },
]

export function DepletionSignal({ deficiencies = DEFAULT_DEFICIENCIES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 260

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

    // Title
    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('DEPLETION SIGNALS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const bodyX = width * 0.35
    const bodyTop = 36
    const bodyH = 180

    // Body silhouette (abstract)
    const headCy = bodyTop + 16
    const headR = 14
    const torsoTop = bodyTop + 34
    const torsoH = 70
    const torsoW = 36
    const limbTop = torsoTop + torsoH
    const limbH = 60

    // Head
    ctx.beginPath()
    ctx.arc(bodyX, headCy, headR, 0, Math.PI * 2)
    ctx.fillStyle = '#1e1e35'
    ctx.fill()
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.stroke()

    // Torso
    ctx.beginPath()
    ctx.roundRect(bodyX - torsoW / 2, torsoTop, torsoW, torsoH, 6)
    ctx.fillStyle = '#1e1e35'
    ctx.fill()
    ctx.stroke()

    // Limbs (legs)
    ctx.beginPath()
    ctx.roundRect(bodyX - torsoW / 2, limbTop + 4, torsoW / 2 - 3, limbH, 4)
    ctx.fillStyle = '#1e1e35'
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.roundRect(bodyX + 3, limbTop + 4, torsoW / 2 - 3, limbH, 4)
    ctx.fillStyle = '#1e1e35'
    ctx.fill()
    ctx.stroke()

    // Highlight regions based on deficiencies
    const regionCoords: Record<string, { x: number; y: number }> = {
      head: { x: bodyX, y: headCy },
      chest: { x: bodyX, y: torsoTop + 25 },
      core: { x: bodyX, y: torsoTop + 55 },
      limbs: { x: bodyX, y: limbTop + 35 },
    }

    deficiencies.forEach(d => {
      const pos = regionCoords[d.region]
      if (!pos) return
      const severity = 1 - d.level / 100
      const glowR = 20 + severity * 20

      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR)
      grad.addColorStop(0, `${d.color}${Math.round(severity * 60).toString(16).padStart(2, '0')}`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2)
      ctx.fill()
    })

    // Labels on the right side
    const labelX = width * 0.58
    const sorted = [...deficiencies].sort((a, b) => a.level - b.level)

    sorted.forEach((d, i) => {
      const y = 44 + i * 38
      const severity = 1 - d.level / 100
      const pos = regionCoords[d.region]

      // Connection line
      if (pos) {
        ctx.beginPath()
        ctx.moveTo(pos.x + 24, pos.y)
        ctx.lineTo(labelX - 8, y + 6)
        ctx.strokeStyle = `${d.color}30`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Nutrient name
      ctx.font = `600 8px 'JetBrains Mono', monospace`
      ctx.fillStyle = d.color
      ctx.textAlign = 'left'
      ctx.fillText(d.nutrient, labelX, y)

      // Level bar
      const barW = width - labelX - 40
      ctx.fillStyle = CHART_COLORS.surfaceLight
      ctx.beginPath()
      ctx.roundRect(labelX, y + 5, barW, 6, 3)
      ctx.fill()

      ctx.fillStyle = d.color
      ctx.globalAlpha = 0.5 + severity * 0.5
      ctx.beginPath()
      ctx.roundRect(labelX, y + 5, (d.level / 100) * barW, 6, 3)
      ctx.fill()
      ctx.globalAlpha = 1

      // Level value
      ctx.font = `500 7px 'JetBrains Mono', monospace`
      ctx.fillStyle = d.color
      ctx.textAlign = 'right'
      ctx.fillText(`${d.level}%`, width - 12, y + 10)

      // Symptom
      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(d.symptom, labelX, y + 22)
    })

  }, [width, deficiencies])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
