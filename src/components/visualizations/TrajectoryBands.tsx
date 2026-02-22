import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface Props {
  weeks?: number
  current?: number[]
  desired?: number[]
  risk?: number[]
}

function generateDefaults(n: number) {
  const current = Array.from({ length: n }, (_, i) => 50 + Math.sin(i / 4) * 8 + i * 0.3 + (Math.random() - 0.5) * 5)
  const desired = Array.from({ length: n }, (_, i) => 55 + i * 0.8)
  const risk = Array.from({ length: n }, (_, i) => 40 + Math.sin(i / 5) * 5 - i * 0.1)
  return { current, desired, risk }
}

export function TrajectoryBands({ weeks = 26, current, desired, risk }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const defaults = useMemo(() => generateDefaults(weeks), [weeks])
  const cur = current ?? defaults.current
  const des = desired ?? defaults.desired
  const rsk = risk ?? defaults.risk
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
    ctx.fillText('TRAJECTORY BANDS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 24, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = cur.length
    const allVals = [...cur, ...des, ...rsk]
    const minV = Math.min(...allVals) - 5
    const maxV = Math.max(...allVals) + 5
    const toY = (v: number) => mt + chartH - ((v - minV) / (maxV - minV)) * chartH
    const toX = (i: number) => ml + (i / (n - 1)) * chartW

    // Risk zone fill (below risk line)
    ctx.beginPath()
    rsk.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.lineTo(toX(n - 1), mt + chartH)
    ctx.lineTo(ml, mt + chartH)
    ctx.closePath()
    ctx.fillStyle = '#ef444408'
    ctx.fill()

    // Warning zone fill (between risk and current)
    ctx.beginPath()
    cur.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(toX(i), toY(rsk[i]))
    ctx.closePath()
    ctx.fillStyle = '#eab30808'
    ctx.fill()

    // Gap fill (between current and desired)
    ctx.beginPath()
    des.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(toX(i), toY(cur[i]))
    ctx.closePath()
    ctx.fillStyle = '#22c55e08'
    ctx.fill()

    // Desired line (dashed)
    ctx.beginPath()
    des.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3])
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Risk line
    ctx.beginPath()
    rsk.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.globalAlpha = 1

    // Current line (solid)
    ctx.beginPath()
    cur.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 2
    ctx.stroke()

    // Labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'left'
    ctx.fillStyle = '#22c55e'
    ctx.fillText('DESIRED', toX(n - 1) + 4, toY(des[n - 1]) + 3)
    ctx.fillStyle = '#7c3aed'
    ctx.fillText('CURRENT', toX(n - 1) + 4, toY(cur[n - 1]) + 3)
    ctx.fillStyle = '#ef4444'
    ctx.fillText('RISK', toX(n - 1) + 4, toY(rsk[n - 1]) + 3)

  }, [width, cur, des, rsk])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
