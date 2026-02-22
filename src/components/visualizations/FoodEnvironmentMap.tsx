import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Environment {
  name: string
  caloriePercent: number
  avgSpend: number
  color: string
}

interface Props {
  environments?: Environment[]
}

const DEFAULT_ENVS: Environment[] = [
  { name: 'Home', caloriePercent: 45, avgSpend: 85, color: '#22c55e' },
  { name: 'Work', caloriePercent: 25, avgSpend: 45, color: '#3b82f6' },
  { name: 'Restaurants', caloriePercent: 15, avgSpend: 120, color: '#FF6B35' },
  { name: 'Social', caloriePercent: 10, avgSpend: 65, color: '#8b5cf6' },
  { name: 'Travel', caloriePercent: 5, avgSpend: 35, color: '#eab308' },
]

export function FoodEnvironmentMap({ environments = DEFAULT_ENVS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 180

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
    ctx.fillText('FOOD ENVIRONMENT', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 72, mr = 50, mt = 28
    const barMaxW = width - ml - mr
    const rowH = 26

    environments.forEach((env, i) => {
      const y = mt + i * rowH

      // Label
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = env.color
      ctx.textAlign = 'right'
      ctx.fillText(env.name, ml - 8, y + rowH / 2 + 3)

      // Bar track
      ctx.fillStyle = CHART_COLORS.surfaceLight
      ctx.beginPath()
      ctx.roundRect(ml, y + rowH / 2 - 5, barMaxW, 10, 5)
      ctx.fill()

      // Bar fill
      const barW = (env.caloriePercent / 100) * barMaxW
      const grad = ctx.createLinearGradient(ml, 0, ml + barW, 0)
      grad.addColorStop(0, `${env.color}40`)
      grad.addColorStop(1, `${env.color}80`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(ml, y + rowH / 2 - 5, Math.max(4, barW), 10, 5)
      ctx.fill()

      // Percentage
      ctx.font = `700 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = env.color
      ctx.textAlign = 'left'
      ctx.fillText(`${env.caloriePercent}%`, ml + barMaxW + 6, y + rowH / 2 - 1)

      // Spend
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`$${env.avgSpend}/wk`, ml + barMaxW + 6, y + rowH / 2 + 9)
    })

  }, [width, environments])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
