import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  micro?: number[] // 30 daily scores
  macro?: number[] // 12 monthly scores
}

function generateDefaults() {
  const micro = Array.from({ length: 30 }, () => 40 + Math.random() * 40)
  const macro = Array.from({ length: 12 }, (_, i) => 50 + Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 8)
  return { micro, macro }
}

export function MicroMacroSplit({ micro, macro }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const defaults = useMemo(() => generateDefaults(), [])
  const microData = micro ?? defaults.micro
  const macroData = macro ?? defaults.macro
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
    ctx.fillText('MICRO / MACRO', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 24, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const splitH = (height - mt - mb - 8) / 2

    // MICRO panel (top — daily noise)
    const microTop = mt
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#3b82f6'
    ctx.textAlign = 'left'
    ctx.fillText('DAILY (30d)', ml, microTop + 8)

    // Micro sparkline
    const microMax = Math.max(...microData)
    const microMin = Math.min(...microData)
    ctx.beginPath()
    microData.forEach((v, i) => {
      const x = ml + (i / (microData.length - 1)) * chartW
      const y = microTop + 12 + (splitH - 12) - ((v - microMin) / (microMax - microMin)) * (splitH - 16)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Volatility shading
    ctx.beginPath()
    ctx.moveTo(ml, microTop + 12 + splitH - 12)
    microData.forEach((v, i) => {
      const x = ml + (i / (microData.length - 1)) * chartW
      const y = microTop + 12 + (splitH - 12) - ((v - microMin) / (microMax - microMin)) * (splitH - 16)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(ml + chartW, microTop + 12 + splitH - 12)
    ctx.closePath()
    ctx.fillStyle = '#3b82f608'
    ctx.fill()

    // Divider
    const divY = microTop + splitH + 4
    ctx.beginPath()
    ctx.moveTo(ml, divY)
    ctx.lineTo(ml + chartW, divY)
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // MACRO panel (bottom — monthly trend)
    const macroTop = divY + 4
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#8b5cf6'
    ctx.textAlign = 'left'
    ctx.fillText('MONTHLY (12m)', ml, macroTop + 8)

    const macroMax = Math.max(...macroData)
    const macroMin = Math.min(...macroData)
    ctx.beginPath()
    macroData.forEach((v, i) => {
      const x = ml + (i / (macroData.length - 1)) * chartW
      const y = macroTop + 12 + (splitH - 12) - ((v - macroMin) / (macroMax - macroMin)) * (splitH - 16)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Macro area fill
    ctx.beginPath()
    ctx.moveTo(ml, macroTop + 12 + splitH - 12)
    macroData.forEach((v, i) => {
      const x = ml + (i / (macroData.length - 1)) * chartW
      const y = macroTop + 12 + (splitH - 12) - ((v - macroMin) / (macroMax - macroMin)) * (splitH - 16)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(ml + chartW, macroTop + 12 + splitH - 12)
    ctx.closePath()
    ctx.fillStyle = '#8b5cf610'
    ctx.fill()

    // Divergence indicator
    const microAvg = microData.reduce((s, v) => s + v, 0) / microData.length
    const macroLast = macroData[macroData.length - 1]
    const divergence = ((microAvg - macroLast) / macroLast * 100).toFixed(0)
    const divColor = Math.abs(microAvg - macroLast) > 15 ? '#eab308' : '#22c55e'

    ctx.font = `700 ${chartFontSize(10, width)}px 'Inter', sans-serif`
    ctx.fillStyle = divColor
    ctx.textAlign = 'right'
    ctx.fillText(`${Number(divergence) > 0 ? '+' : ''}${divergence}%`, width - 12, mt + 8)
    ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('DIVERGENCE', width - 12, mt + 16)

  }, [width, microData, macroData])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
