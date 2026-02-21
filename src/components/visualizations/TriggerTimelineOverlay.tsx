import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  days?: number
  stress?: number[]
  mood?: number[]
  sleep?: number[]
  caffeine?: number[]
  social?: number[]
}

function gen(n: number, base: number, range: number): number[] {
  return Array.from({ length: n }, () => base + (Math.random() - 0.5) * range * 2)
}

export function TriggerTimelineOverlay({ days = 30, stress, mood, sleep, caffeine, social }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const lines = useMemo(() => [
    { label: 'Stress', color: '#ef4444', data: stress ?? gen(days, 45, 25) },
    { label: 'Mood', color: '#22c55e', data: mood ?? gen(days, 60, 20) },
    { label: 'Sleep', color: '#3b82f6', data: sleep ?? gen(days, 55, 20) },
    { label: 'Caffeine', color: '#eab308', data: caffeine ?? gen(days, 40, 20) },
    { label: 'Social', color: '#8b5cf6', data: social ?? gen(days, 50, 25) },
  ], [days, stress, mood, sleep, caffeine, social])

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

    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('TRIGGER TIMELINE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = lines[0].data.length

    // Grid
    for (let v = 0; v <= 100; v += 25) {
      const y = mt + chartH - (v / 100) * chartH
      ctx.strokeStyle = CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(ml, y)
      ctx.lineTo(ml + chartW, y)
      ctx.stroke()
    }

    // Draw each line
    lines.forEach(line => {
      ctx.beginPath()
      line.data.forEach((v, i) => {
        const x = ml + (i / (n - 1)) * chartW
        const y = mt + chartH - (Math.min(100, Math.max(0, v)) / 100) * chartH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = line.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1

      // End dot
      const lastVal = line.data[n - 1]
      const lastX = ml + chartW
      const lastY = mt + chartH - (Math.min(100, Math.max(0, lastVal)) / 100) * chartH
      ctx.beginPath()
      ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = line.color
      ctx.fill()
    })

  }, [width, lines])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-3 mt-2 pt-2 flex-wrap" style={{ borderTop: '1px solid #2d2d4e' }}>
        {lines.map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
