import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * 90-Year Grid (Memento Mori) — 90 rows × 52 columns = 4,680 weeks of life.
 * Lived weeks are filled. Future weeks are faint outlines.
 * Current week pulses gold. Confrontation with time.
 */

interface Props {
  birthYear?: number
  birthMonth?: number // 0-indexed
}

export function NinetyYearGrid({ birthYear = 1997, birthMonth = 2 }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const TOTAL_YEARS = 90
  const WEEKS_PER_YEAR = 52

  const { weeksLived, currentWeekIndex } = useMemo(() => {
    const birth = new Date(birthYear, birthMonth, 1)
    const now = new Date()
    const diffMs = now.getTime() - birth.getTime()
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
    return {
      weeksLived: Math.max(0, diffWeeks),
      currentWeekIndex: Math.max(0, diffWeeks),
    }
  }, [birthYear, birthMonth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    // Cell sizing — fit 52 columns + gaps + margins
    const marginLeft = 32
    const marginRight = 8
    const marginTop = 28
    const marginBottom = 16
    const availW = width - marginLeft - marginRight
    const gap = 1
    const cellSize = Math.max(1.5, Math.floor((availW - (WEEKS_PER_YEAR - 1) * gap) / WEEKS_PER_YEAR * 10) / 10)
    const gridW = WEEKS_PER_YEAR * cellSize + (WEEKS_PER_YEAR - 1) * gap
    const gridH = TOTAL_YEARS * cellSize + (TOTAL_YEARS - 1) * gap
    const totalH = gridH + marginTop + marginBottom

    canvas.width = width * dpr
    canvas.height = totalH * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${totalH}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, totalH)

    // Title
    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('MEMENTO MORI', width / 2, 10)
    ctx.letterSpacing = '0px'

    // Weeks lived label
    ctx.font = `400 7px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textMuted
    ctx.textAlign = 'right'
    ctx.fillText(`${weeksLived.toLocaleString()} weeks lived`, width - marginRight, 10)

    // Age labels on left (every 10 years)
    ctx.font = `400 7px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'right'
    for (let y = 0; y <= TOTAL_YEARS; y += 10) {
      const py = marginTop + y * (cellSize + gap)
      ctx.fillText(`${y}`, marginLeft - 6, py + cellSize * 0.8)
    }

    // Animation for pulsing current week
    let animFrame: number
    let phase = 0

    function draw() {
      phase += 0.03
      ctx.clearRect(marginLeft, marginTop, gridW + 2, gridH + 2)

      for (let year = 0; year < TOTAL_YEARS; year++) {
        for (let week = 0; week < WEEKS_PER_YEAR; week++) {
          const weekIndex = year * WEEKS_PER_YEAR + week
          const x = marginLeft + week * (cellSize + gap)
          const y = marginTop + year * (cellSize + gap)

          const isCurrent = weekIndex === currentWeekIndex
          const isLived = weekIndex < currentWeekIndex

          if (isCurrent) {
            // Pulsing gold cell
            const pulse = 0.7 + 0.3 * Math.sin(phase)
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 6
            ctx.fillRect(x, y, cellSize, cellSize)
            ctx.shadowBlur = 0
          } else if (isLived) {
            // Lived weeks — gradient from early life (blue) to recent (violet)
            const lifeProgress = weekIndex / (TOTAL_YEARS * WEEKS_PER_YEAR)
            const r = Math.round(59 + lifeProgress * 80)   // 3b → 8b
            const g = Math.round(130 - lifeProgress * 38)  // 82 → 5c
            const b = Math.round(246 - lifeProgress * 9)   // f6 → ed
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`
            ctx.fillRect(x, y, cellSize, cellSize)
          } else {
            // Future weeks — faint outlines
            ctx.strokeStyle = 'rgba(45, 45, 78, 0.35)'
            ctx.lineWidth = 0.5
            ctx.strokeRect(x + 0.25, y + 0.25, cellSize - 0.5, cellSize - 0.5)
          }
        }
      }

      animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animFrame)
  }, [width, weeksLived, currentWeekIndex])

  const totalH = useMemo(() => {
    if (width < 100) return 400
    const marginTop = 28
    const marginBottom = 16
    const marginLeft = 32
    const marginRight = 8
    const availW = width - marginLeft - marginRight
    const gap = 1
    const cellSize = Math.max(1.5, Math.floor((availW - (WEEKS_PER_YEAR - 1) * gap) / WEEKS_PER_YEAR * 10) / 10)
    return TOTAL_YEARS * cellSize + (TOTAL_YEARS - 1) * gap + marginTop + marginBottom
  }, [width])

  // Stats
  const totalWeeks = TOTAL_YEARS * WEEKS_PER_YEAR
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived)
  const percentLived = ((weeksLived / totalWeeks) * 100).toFixed(1)

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height: totalH }} />

      {/* Stats bar */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        <div className="flex items-center gap-4">
          <StatChip label="LIVED" value={`${percentLived}%`} color="#8b5cf6" />
          <StatChip label="REMAINING" value={weeksRemaining.toLocaleString()} color={CHART_COLORS.textMuted} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: '#8b5cf6', opacity: 0.55 }} />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Lived</span>
          <div className="w-2 h-2 rounded-sm" style={{ background: '#FFD700' }} />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Now</span>
          <div className="w-2 h-2 rounded-sm border border-[#2d2d4e]" />
          <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>Ahead</span>
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[7px] text-[#404060] tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color }}>{value}</span>
    </div>
  )
}
