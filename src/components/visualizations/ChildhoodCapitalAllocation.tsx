import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Childhood Capital Allocation
 * Two views side by side: Time capital and Financial capital
 * Per life stage (0-5, 6-12, 13-18), showing how investment
 * shifts across categories. Frames cost as compounding human capital.
 */

const STAGES = ['0–5\nFoundation', '6–12\nBuilding', '13–18\nLaunch']

interface Allocation {
  label: string
  color: string
  timeAlloc: number[]    // % of parental time per stage
  moneyAlloc: number[]   // % of budget per stage
}

const ALLOCATIONS: Allocation[] = [
  { label: 'Safety & Health', color: '#22c55e',  timeAlloc: [35, 20, 12], moneyAlloc: [20, 14, 10] },
  { label: 'Education',       color: '#3b82f6',  timeAlloc: [15, 30, 35], moneyAlloc: [15, 30, 40] },
  { label: 'Play & Bonding',  color: '#8b5cf6',  timeAlloc: [30, 22, 15], moneyAlloc: [10, 12,  8] },
  { label: 'Activities',      color: '#FF6B35',  timeAlloc: [ 8, 18, 22], moneyAlloc: [12, 24, 22] },
  { label: 'Character',       color: '#eab308',  timeAlloc: [12, 10, 16], moneyAlloc: [ 8,  6, 10] },
  { label: 'Independence',    color: '#ec4899',  timeAlloc: [ 0,  0,  0], moneyAlloc: [35, 14, 10] },
]

export function ChildhoodCapitalAllocation() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 300

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
    ctx.clearRect(0, 0, width, height)

    const ml = 12, mr = 12, mt = 26, mb = 48
    const chartH = height - mt - mb
    const twoCol = width >= 280
    const halfW = twoCol ? (width - ml - mr - 8) / 2 : (width - ml - mr)
    const gap = 8

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('CHILDHOOD CAPITAL ALLOCATION', width / 2, 14)
    ctx.letterSpacing = '0px'

    // Section headers
    ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textSecondary
    ctx.textAlign = 'center'
    if (twoCol) {
      ctx.fillText('TIME CAPITAL', ml + halfW / 2, mt - 2)
      ctx.fillText('FINANCIAL CAPITAL', ml + halfW + gap + halfW / 2, mt - 2)
    } else {
      ctx.fillText('TIME CAPITAL', ml + halfW / 2, mt - 2)
    }

    const stageW = halfW / STAGES.length

    const drawStacked = (offsetX: number, useTime: boolean) => {
      STAGES.forEach((stage, si) => {
        const x = offsetX + si * stageW + 2
        const barW = stageW - 4
        let stackY = mt + chartH

        ALLOCATIONS.forEach(alloc => {
          const pct = useTime ? alloc.timeAlloc[si] : alloc.moneyAlloc[si]
          if (pct === 0) return
          const barH = (pct / 100) * chartH

          ctx.fillStyle = `${alloc.color}99`
          ctx.fillRect(x, stackY - barH, barW, barH)

          ctx.strokeStyle = `${alloc.color}40`
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, stackY - barH, barW, barH)

          // Label if tall enough
          if (barH > 14) {
            ctx.font = `400 ${chartFontSize(5.5, width)}px 'JetBrains Mono', monospace`
            ctx.fillStyle = `${alloc.color}ff`
            ctx.textAlign = 'center'
            ctx.fillText(`${pct}%`, x + barW / 2, stackY - barH / 2 + 2)
          }

          stackY -= barH
        })

        // Stage label
        const stageLines = stage.split('\n')
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = CHART_COLORS.textDim
        ctx.textAlign = 'center'
        stageLines.forEach((line, li) => {
          ctx.fillText(line, x + barW / 2, mt + chartH + 10 + li * 9)
        })
      })
    }

    drawStacked(ml, true)
    if (twoCol) {
      drawStacked(ml + halfW + gap, false)

      // Divider
      ctx.beginPath()
      ctx.moveTo(ml + halfW + gap / 2, mt - 8)
      ctx.lineTo(ml + halfW + gap / 2, mt + chartH)
      ctx.strokeStyle = CHART_COLORS.border
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Category legend at bottom — 2 rows on narrow
    const legY = height - 12
    const legCols = width < 360 ? 3 : ALLOCATIONS.length
    const legItemW = Math.floor((width - 16) / legCols)
    ALLOCATIONS.forEach((alloc, i) => {
      const col = i % legCols
      const row = Math.floor(i / legCols)
      const x = 8 + col * legItemW
      const y = legY - row * 12
      ctx.fillStyle = `${alloc.color}99`
      ctx.fillRect(x, y - 6, 8, 6)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(alloc.label, x + 10, y)
    })
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
