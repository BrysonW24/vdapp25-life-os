import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

interface Props {
  load?: number[]     // 12 weeks of load scores (0-100)
  recovery?: number[] // 12 weeks of recovery scores (0-100)
}

function generateDefaults() {
  const load = Array.from({ length: 12 }, (_, i) => 40 + Math.sin(i / 3) * 20 + (Math.random() - 0.5) * 10)
  const recovery = Array.from({ length: 12 }, (_, i) => 55 - Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 10)
  return { load, recovery }
}

export function LoadRecoveryPhase({ load, recovery }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const defaults = useMemo(() => generateDefaults(), [])
  const loadData = load ?? defaults.load
  const recData = recovery ?? defaults.recovery
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
    ctx.fillText('LOAD vs RECOVERY', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 24, mr = 12, mt = 28, mb = 16
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = loadData.length
    const toX = (i: number) => ml + (i / (n - 1)) * chartW
    const toY = (v: number) => mt + chartH - (v / 100) * chartH

    // Imbalance shading (where load > recovery)
    for (let i = 0; i < n - 1; i++) {
      if (loadData[i] > recData[i]) {
        const x1 = toX(i)
        const x2 = toX(i + 1)
        ctx.fillStyle = '#ef444410'
        ctx.fillRect(x1, mt, x2 - x1, chartH)
      }
    }

    // Recovery area fill
    ctx.beginPath()
    ctx.moveTo(toX(0), mt + chartH)
    recData.forEach((v, i) => ctx.lineTo(toX(i), toY(v)))
    ctx.lineTo(toX(n - 1), mt + chartH)
    ctx.closePath()
    ctx.fillStyle = '#22c55e08'
    ctx.fill()

    // Load line
    ctx.beginPath()
    loadData.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Recovery line
    ctx.beginPath()
    recData.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)) })
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.stroke()

    // Phase labels
    const lastLoad = loadData[n - 1]
    const lastRec = recData[n - 1]
    const phase = lastLoad > lastRec * 1.2 ? 'OVERLOADED' : lastRec > lastLoad * 1.2 ? 'RECOVERING' : 'BALANCED'
    const phaseColor = phase === 'OVERLOADED' ? '#ef4444' : phase === 'RECOVERING' ? '#22c55e' : '#3b82f6'

    ctx.font = `700 12px 'Inter', sans-serif`
    ctx.fillStyle = phaseColor
    ctx.textAlign = 'right'
    ctx.fillText(phase, width - 12, mt + 10)

    // Line labels
    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ef4444'
    ctx.fillText('LOAD', toX(n - 1) + 4, toY(lastLoad) + 3)
    ctx.fillStyle = '#22c55e'
    ctx.fillText('RECOVERY', toX(n - 1) + 4, toY(lastRec) + 3)

  }, [width, loadData, recData])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
