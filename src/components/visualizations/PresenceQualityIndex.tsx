import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Presence Quality Index
 * 7-day × 3-block grid (morning / afternoon / evening).
 * Each cell: quantity (hours) × quality (1–5 rating) = presence score.
 * Alongside: work hours that day as grey overlay bar.
 * Shows: where presence is being displaced by work.
 */

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const BLOCKS = ['MORNING', 'AFTERNOON', 'EVENING']

interface DayBlock {
  hours: number      // hours with child
  quality: number    // 1–5
  workHours: number  // competing work hours in same period
}

// Each day: [morning, afternoon, evening]
const WEEK_DATA: DayBlock[][] = [
  [ // Monday
    { hours: 0.5, quality: 3, workHours: 3 },
    { hours: 0,   quality: 0, workHours: 5 },
    { hours: 1.5, quality: 4, workHours: 1 },
  ],
  [ // Tuesday
    { hours: 0.5, quality: 2, workHours: 3 },
    { hours: 0,   quality: 0, workHours: 6 },
    { hours: 2,   quality: 5, workHours: 0 },
  ],
  [ // Wednesday
    { hours: 1,   quality: 4, workHours: 2 },
    { hours: 0,   quality: 0, workHours: 6 },
    { hours: 1,   quality: 3, workHours: 2 },
  ],
  [ // Thursday
    { hours: 0.5, quality: 3, workHours: 3 },
    { hours: 0,   quality: 0, workHours: 5 },
    { hours: 2,   quality: 4, workHours: 0 },
  ],
  [ // Friday
    { hours: 0.5, quality: 2, workHours: 3 },
    { hours: 1,   quality: 3, workHours: 4 },
    { hours: 3,   quality: 5, workHours: 0 },
  ],
  [ // Saturday
    { hours: 2,   quality: 5, workHours: 0 },
    { hours: 3,   quality: 5, workHours: 0 },
    { hours: 2,   quality: 4, workHours: 0 },
  ],
  [ // Sunday
    { hours: 2,   quality: 5, workHours: 0 },
    { hours: 2,   quality: 4, workHours: 0 },
    { hours: 1.5, quality: 3, workHours: 1 },
  ],
]

export function PresenceQualityIndex() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 260

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

    const ml = width < 320 ? 50 : 68, mr = 12, mt = 26, mb = 54
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('PRESENCE QUALITY INDEX', width / 2, 14)
    ctx.letterSpacing = '0px'

    const cellW = chartW / 7
    const cellH = chartH / 3
    const maxScore = 5 * 4  // quality 5 × hours 4 = 20 max score per block

    // Block row labels — abbreviate on narrow
    const blockLabels = width < 320 ? ['AM', 'PM', 'EVE'] : BLOCKS
    blockLabels.forEach((block, bi) => {
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(block, ml - 4, mt + bi * cellH + cellH / 2 + 3)
    })

    // Day column headers
    DAYS.forEach((day, di) => {
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = di >= 5 ? CHART_COLORS.textSecondary : CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(day, ml + di * cellW + cellW / 2, mt - 4)
    })

    // Cells
    WEEK_DATA.forEach((day, di) => {
      day.forEach((block, bi) => {
        const x = ml + di * cellW + 2
        const y = mt + bi * cellH + 2
        const w = cellW - 4
        const h = cellH - 4

        // Presence score = quality × min(hours, 4) / maxScore
        const presenceScore = (block.quality * Math.min(block.hours, 4)) / maxScore
        const workIntensity = Math.min(block.workHours / 6, 1)

        // Work displacement bg (red tint)
        if (workIntensity > 0) {
          ctx.fillStyle = `rgba(239,68,68,${workIntensity * 0.15})`
          ctx.beginPath()
          ctx.roundRect(x, y, w, h, 3)
          ctx.fill()
        }

        // Presence fill (green tint)
        if (presenceScore > 0) {
          const green = `rgba(34,197,94,${presenceScore * 0.7})`
          ctx.fillStyle = green
          ctx.beginPath()
          ctx.roundRect(x, y, w, h, 3)
          ctx.fill()
        }

        // Border
        ctx.strokeStyle = CHART_COLORS.border
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 3)
        ctx.stroke()

        // Hours text
        if (block.hours > 0) {
          ctx.font = `600 ${chartFontSize(9, width)}px 'JetBrains Mono', monospace`
          ctx.fillStyle = `rgba(255,255,255,${0.4 + presenceScore * 0.5})`
          ctx.textAlign = 'center'
          ctx.fillText(`${block.hours}h`, x + w / 2, y + h / 2 - 1)

          // Quality stars (compact)
          ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
          ctx.fillStyle = `rgba(34,197,94,${0.4 + presenceScore * 0.4})`
          ctx.fillText('★'.repeat(block.quality), x + w / 2, y + h / 2 + 9)
        } else {
          // Work-displaced block
          ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
          ctx.fillStyle = 'rgba(239,68,68,0.4)'
          ctx.textAlign = 'center'
          ctx.fillText('work', x + w / 2, y + h / 2 + 2)
        }
      })
    })

    // Summary stats
    const totalPresenceHours = WEEK_DATA.flat().reduce((s, b) => s + b.hours, 0)
    const qualityBlocks = WEEK_DATA.flat().filter(b => b.quality > 0)
    const avgQuality = qualityBlocks.length
      ? qualityBlocks.reduce((s, b) => s + b.quality, 0) / qualityBlocks.length
      : 0
    const displacedBlocks = WEEK_DATA.flat().filter(b => b.hours === 0 && b.workHours > 0).length

    const statsY = height - 36
    ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`

    // Stat 1
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'left'
    ctx.fillText(`${totalPresenceHours.toFixed(1)}h`, ml, statsY)
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('total presence', ml, statsY + 11)

    // Stat 2
    const midX = ml + chartW / 2
    ctx.fillStyle = avgQuality >= 4 ? '#22c55e' : avgQuality >= 3 ? '#eab308' : '#ef4444'
    ctx.textAlign = 'center'
    ctx.fillText(`${avgQuality.toFixed(1)}/5`, midX, statsY)
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('avg quality', midX, statsY + 11)

    // Stat 3
    ctx.fillStyle = displacedBlocks > 4 ? '#ef4444' : '#eab308'
    ctx.textAlign = 'right'
    ctx.fillText(`${displacedBlocks}`, ml + chartW, statsY)
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('displaced blocks', ml + chartW, statsY + 11)

    // Legend — proportional positioning
    const legY = height - 10
    const legItem1W = Math.floor((ml + chartW) / 2)
    ctx.fillStyle = 'rgba(34,197,94,0.6)'
    ctx.fillRect(ml, legY - 6, 10, 6)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'left'
    ctx.fillText(width < 360 ? 'Presence' : 'Presence (quality × hours)', ml + 13, legY)

    ctx.fillStyle = 'rgba(239,68,68,0.3)'
    ctx.fillRect(legItem1W + ml, legY - 6, 10, 6)
    ctx.fillText(width < 360 ? 'Work' : 'Work displacement', legItem1W + ml + 13, legY)
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
