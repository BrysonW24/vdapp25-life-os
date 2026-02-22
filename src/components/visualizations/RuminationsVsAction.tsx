import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface WeekData {
  week: string
  ruminationMin: number
  actionMin: number
}

interface Props {
  data?: WeekData[]
}

const DEFAULT_DATA: WeekData[] = [
  { week: 'W1', ruminationMin: 280, actionMin: 420 },
  { week: 'W2', ruminationMin: 320, actionMin: 380 },
  { week: 'W3', ruminationMin: 200, actionMin: 520 },
  { week: 'W4', ruminationMin: 350, actionMin: 350 },
  { week: 'W5', ruminationMin: 180, actionMin: 540 },
  { week: 'W6', ruminationMin: 260, actionMin: 460 },
  { week: 'W7', ruminationMin: 300, actionMin: 410 },
  { week: 'W8', ruminationMin: 220, actionMin: 500 },
]

export function RuminationsVsAction({ data = DEFAULT_DATA }: Props) {
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
    ctx.fillText('RUMINATION vs ACTION', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 32, mr = 40, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const rowH = chartH / data.length

    data.forEach((d, i) => {
      const y = mt + i * rowH
      const total = d.ruminationMin + d.actionMin
      const rumFrac = d.ruminationMin / total
      const actFrac = d.actionMin / total

      // Week label
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(d.week, ml - 6, y + rowH / 2 + 3)

      // Rumination bar (left, red/amber)
      const rumW = rumFrac * chartW
      ctx.fillStyle = '#ef444430'
      ctx.beginPath()
      ctx.roundRect(ml, y + 3, rumW, rowH - 6, 3)
      ctx.fill()

      // Action bar (right, green/blue)
      ctx.fillStyle = '#22c55e25'
      ctx.beginPath()
      ctx.roundRect(ml + rumW, y + 3, actFrac * chartW, rowH - 6, 3)
      ctx.fill()

      // Divider
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(ml + rumW, y + 5)
      ctx.lineTo(ml + rumW, y + rowH - 5)
      ctx.stroke()

      // Ratio
      const ratio = Math.round(actFrac * 100)
      const ratioColor = ratio >= 60 ? '#22c55e' : ratio >= 50 ? '#eab308' : '#ef4444'
      ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = ratioColor
      ctx.textAlign = 'left'
      ctx.fillText(`${ratio}%`, ml + chartW + 6, y + rowH / 2 + 3)
    })

  }, [width, data])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>rumination</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>action</span>
          </div>
        </div>
        <span className="text-[7px] text-[#404060]" style={{ fontFamily: 'var(--font-mono)' }}>% = action ratio</span>
      </div>
    </div>
  )
}
