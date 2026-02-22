import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface DataSource {
  label: string
  domain: string
  daysSinceUpdate: number
  maxStaleDays: number
}

interface Props {
  sources?: DataSource[]
}

const DEFAULT_SOURCES: DataSource[] = [
  { label: 'Weight', domain: 'Health', daysSinceUpdate: 1, maxStaleDays: 7 },
  { label: 'Sleep', domain: 'Health', daysSinceUpdate: 0, maxStaleDays: 2 },
  { label: 'Mood', domain: 'Mental', daysSinceUpdate: 0, maxStaleDays: 1 },
  { label: 'Finances', domain: 'Wealth', daysSinceUpdate: 5, maxStaleDays: 30 },
  { label: 'Goals', domain: 'Work', daysSinceUpdate: 14, maxStaleDays: 7 },
  { label: 'Exercise', domain: 'Health', daysSinceUpdate: 2, maxStaleDays: 3 },
  { label: 'Journal', domain: 'Mental', daysSinceUpdate: 3, maxStaleDays: 2 },
  { label: 'Social Log', domain: 'Social', daysSinceUpdate: 8, maxStaleDays: 7 },
  { label: 'Skills', domain: 'Learning', daysSinceUpdate: 21, maxStaleDays: 14 },
  { label: 'Nutrition', domain: 'Health', daysSinceUpdate: 1, maxStaleDays: 1 },
]

export function DataFreshnessMap({ sources = DEFAULT_SOURCES }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 220

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
    ctx.fillText('DATA FRESHNESS', width / 2, 14)
    ctx.letterSpacing = '0px'

    const ml = 12, mr = 12, mt = 28
    const gridW = width - ml - mr
    const cols = Math.min(5, Math.floor(gridW / 60))
    const cellW = gridW / cols
    const cellH = 32
    const gap = 4

    sources.forEach((src, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = ml + col * cellW + gap / 2
      const y = mt + row * (cellH + gap)
      const w = cellW - gap
      const freshness = Math.max(0, 1 - src.daysSinceUpdate / src.maxStaleDays)
      const isStale = src.daysSinceUpdate > src.maxStaleDays

      // Cell color based on freshness
      let color: string
      if (freshness >= 0.7) color = '#22c55e'
      else if (freshness >= 0.3) color = '#eab308'
      else color = '#ef4444'

      // Cell bg
      ctx.beginPath()
      ctx.roundRect(x, y, w, cellH, 4)
      ctx.fillStyle = `${color}12`
      ctx.fill()
      ctx.strokeStyle = `${color}30`
      ctx.lineWidth = 1
      ctx.stroke()

      // Freshness bar at bottom
      const barH = 3
      ctx.fillStyle = `${color}40`
      ctx.fillRect(x + 2, y + cellH - barH - 2, (w - 4) * Math.min(1, freshness), barH)

      // Label
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.fillText(src.label, x + 6, y + 12)

      // Staleness info
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`${src.daysSinceUpdate}d ago`, x + 6, y + 22)

      // Stale badge
      if (isStale) {
        ctx.fillStyle = '#ef4444'
        ctx.textAlign = 'right'
        ctx.fillText('STALE', x + w - 6, y + 12)
      }
    })

    // Summary
    const fresh = sources.filter(s => s.daysSinceUpdate <= s.maxStaleDays).length
    const total = sources.length
    const rows = Math.ceil(total / cols)
    const summaryY = mt + rows * (cellH + gap) + 12
    const pct = Math.round((fresh / total) * 100)
    const sumColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444'

    ctx.font = `700 ${chartFontSize(10, width)}px 'Inter', sans-serif`
    ctx.fillStyle = sumColor
    ctx.textAlign = 'center'
    ctx.fillText(`${pct}% FRESH`, width / 2, summaryY)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText(`${fresh}/${total} sources current`, width / 2, summaryY + 12)

  }, [width, sources])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
