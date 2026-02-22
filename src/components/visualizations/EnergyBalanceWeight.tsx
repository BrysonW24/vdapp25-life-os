import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  balance?: number[] // daily calorie balance (intake - expenditure)
  weight?: number[]  // daily weight
}

function generateDefaults() {
  const balance = Array.from({ length: 30 }, () => (Math.random() - 0.45) * 800)
  const weight = Array.from({ length: 30 }, (_, i) => 82 + Math.sin(i / 5) * 0.8 + (Math.random() - 0.5) * 0.4)
  return { balance, weight }
}

export function EnergyBalanceWeight({ balance, weight }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const defaults = useMemo(() => generateDefaults(), [])
  const bal = balance ?? defaults.balance
  const wt = weight ?? defaults.weight
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
    ctx.fillText('ENERGY BALANCE vs WEIGHT', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 36, mr = 36, mt = 28, mb = 20
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    const maxBal = Math.max(...bal.map(Math.abs), 200)
    const minWt = Math.min(...wt) - 0.5
    const maxWt = Math.max(...wt) + 0.5

    // Zero line for balance
    const zeroY = mt + chartH / 2

    // Grid
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(ml, zeroY)
    ctx.lineTo(ml + chartW, zeroY)
    ctx.stroke()

    // Balance bars + surplus/deficit shading
    const barW = chartW / bal.length - 1
    bal.forEach((v, i) => {
      const x = ml + (i / bal.length) * chartW
      const barH = (Math.abs(v) / maxBal) * (chartH / 2)
      const y = v >= 0 ? zeroY - barH : zeroY

      ctx.fillStyle = v >= 0 ? '#22c55e20' : '#ef444420'
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 1)
      ctx.fill()

      ctx.strokeStyle = v >= 0 ? '#22c55e40' : '#ef444440'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 1)
      ctx.stroke()
    })

    // Weight trend line (mapped to right Y axis)
    ctx.beginPath()
    wt.forEach((w, i) => {
      const x = ml + (i / (wt.length - 1)) * chartW
      const y = mt + chartH - ((w - minWt) / (maxWt - minWt)) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#FF6B35'
    ctx.lineWidth = 2
    ctx.stroke()

    // 7-day moving average for weight
    ctx.beginPath()
    wt.forEach((_, i) => {
      const start = Math.max(0, i - 6)
      const slice = wt.slice(start, i + 1)
      const avg = slice.reduce((s, v) => s + v, 0) / slice.length
      const x = ml + (i / (wt.length - 1)) * chartW
      const y = mt + chartH - ((avg - minWt) / (maxWt - minWt)) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#FF6B35'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Axis labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'right'
    ctx.fillText(`+${maxBal.toFixed(0)}`, ml - 4, mt + 4)
    ctx.fillText('0', ml - 4, zeroY + 3)
    ctx.fillText(`-${maxBal.toFixed(0)}`, ml - 4, mt + chartH + 2)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#FF6B35'
    ctx.fillText(`${maxWt.toFixed(1)}kg`, ml + chartW + 4, mt + 4)
    ctx.fillText(`${minWt.toFixed(1)}kg`, ml + chartW + 4, mt + chartH + 2)

  }, [width, bal, wt])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>surplus</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>deficit</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ background: '#FF6B35' }} />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>weight</span>
        </div>
      </div>
    </div>
  )
}
