import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Developmental Milestone Tracker
 * Horizontal timeline (0–18 years). Four domains stacked as lanes:
 * Physical, Cognitive, Language, Social-Emotional.
 * Milestone windows shown as colored spans. Current age cursor overlaid.
 * Upcoming windows (next 12mo) highlighted.
 */

type Domain = 'physical' | 'cognitive' | 'language' | 'social'

const DOMAIN_COLORS: Record<Domain, string> = {
  physical:  '#22c55e',
  cognitive: '#3b82f6',
  language:  '#8b5cf6',
  social:    '#FF6B35',
}

const DOMAIN_LABELS: Record<Domain, string> = {
  physical:  'PHYSICAL',
  cognitive: 'COGNITIVE',
  language:  'LANGUAGE',
  social:    'SOCIAL',
}

interface Milestone {
  domain: Domain
  label: string
  startMonth: number   // age in months
  endMonth: number
}

const MILESTONES: Milestone[] = [
  // Physical
  { domain: 'physical', label: 'Head control',     startMonth: 1,   endMonth: 4   },
  { domain: 'physical', label: 'Rolling',           startMonth: 3,   endMonth: 6   },
  { domain: 'physical', label: 'Sitting',           startMonth: 5,   endMonth: 9   },
  { domain: 'physical', label: 'Crawling',          startMonth: 7,   endMonth: 12  },
  { domain: 'physical', label: 'Walking',           startMonth: 10,  endMonth: 18  },
  { domain: 'physical', label: 'Running',           startMonth: 18,  endMonth: 30  },
  { domain: 'physical', label: 'Bike (balance)',    startMonth: 36,  endMonth: 60  },
  { domain: 'physical', label: 'Sport skills',      startMonth: 60,  endMonth: 120 },
  { domain: 'physical', label: 'Puberty onset',     startMonth: 120, endMonth: 156 },
  { domain: 'physical', label: 'Adult strength',    startMonth: 156, endMonth: 216 },

  // Cognitive
  { domain: 'cognitive', label: 'Object permanence', startMonth: 4,  endMonth: 12  },
  { domain: 'cognitive', label: 'Cause & effect',    startMonth: 6,  endMonth: 14  },
  { domain: 'cognitive', label: 'Symbolic play',     startMonth: 18, endMonth: 36  },
  { domain: 'cognitive', label: 'Numbers 1–10',      startMonth: 36, endMonth: 60  },
  { domain: 'cognitive', label: 'Reading',           startMonth: 60, endMonth: 96  },
  { domain: 'cognitive', label: 'Logic & reason',    startMonth: 84, endMonth: 132 },
  { domain: 'cognitive', label: 'Abstract thought',  startMonth: 132, endMonth: 180 },
  { domain: 'cognitive', label: 'Executive function',startMonth: 156, endMonth: 216 },

  // Language
  { domain: 'language', label: 'Cooing',            startMonth: 1,  endMonth: 4   },
  { domain: 'language', label: 'Babbling',          startMonth: 5,  endMonth: 10  },
  { domain: 'language', label: 'First words',       startMonth: 10, endMonth: 18  },
  { domain: 'language', label: '2-word phrases',    startMonth: 18, endMonth: 30  },
  { domain: 'language', label: 'Full sentences',    startMonth: 30, endMonth: 48  },
  { domain: 'language', label: 'Reading fluency',   startMonth: 72, endMonth: 108 },
  { domain: 'language', label: '2nd language prime',startMonth: 0,  endMonth: 84  },
  { domain: 'language', label: 'Writing fluency',   startMonth: 84, endMonth: 132 },

  // Social
  { domain: 'social', label: 'Social smile',        startMonth: 1,  endMonth: 4   },
  { domain: 'social', label: 'Stranger anxiety',    startMonth: 6,  endMonth: 12  },
  { domain: 'social', label: 'Parallel play',       startMonth: 18, endMonth: 36  },
  { domain: 'social', label: 'Cooperative play',    startMonth: 36, endMonth: 60  },
  { domain: 'social', label: 'Empathy dev.',        startMonth: 48, endMonth: 96  },
  { domain: 'social', label: 'Peer relationships',  startMonth: 72, endMonth: 144 },
  { domain: 'social', label: 'Identity formation',  startMonth: 132, endMonth: 204 },
  { domain: 'social', label: 'Independence',        startMonth: 156, endMonth: 216 },
]

const CURRENT_AGE_MONTHS = 2  // 2 months old
const MAX_MONTHS = 216        // 18 years

const DOMAINS: Domain[] = ['physical', 'cognitive', 'language', 'social']

export function DevelopmentalMilestoneTracker() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = 280

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

    const ml = width < 340 ? 48 : 68, mr = 12, mt = 26, mb = 32
    const chartW = width - ml - mr
    const chartH = height - mt - mb

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('DEVELOPMENTAL MILESTONE TRACKER', width / 2, 14)
    ctx.letterSpacing = '0px'

    const laneH = chartH / DOMAINS.length
    const toX = (months: number) => ml + (months / MAX_MONTHS) * chartW

    // Lane backgrounds + domain labels
    DOMAINS.forEach((domain, di) => {
      const laneY = mt + di * laneH
      const color = DOMAIN_COLORS[domain]

      // Lane bg
      ctx.fillStyle = `${color}08`
      ctx.fillRect(ml, laneY, chartW, laneH - 1)

      // Domain label
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(DOMAIN_LABELS[domain], ml - 6, laneY + laneH / 2 + 3)
    })

    // Age axis tick marks (years)
    const yearTicks = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18]
    yearTicks.forEach(yr => {
      const x = toX(yr * 12)
      ctx.beginPath()
      ctx.moveTo(x, mt)
      ctx.lineTo(x, mt + chartH)
      ctx.strokeStyle = yr === 0 ? CHART_COLORS.border : CHART_COLORS.gridLine
      ctx.lineWidth = 0.5
      ctx.setLineDash(yr === 0 ? [] : [2, 4])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'center'
      ctx.fillText(yr === 0 ? 'Birth' : `${yr}yr`, x, mt + chartH + 10)
    })

    // Milestones
    MILESTONES.forEach(m => {
      const di = DOMAINS.indexOf(m.domain)
      if (di < 0) return
      const color = DOMAIN_COLORS[m.domain]
      const laneY = mt + di * laneH
      const barY = laneY + laneH * 0.25
      const barH = laneH * 0.5

      const x1 = toX(m.startMonth)
      const x2 = toX(m.endMonth)
      const w = Math.max(x2 - x1, 2)

      // Is upcoming (next 12 months)?
      const isUpcoming = m.startMonth <= CURRENT_AGE_MONTHS + 12 &&
                         m.endMonth >= CURRENT_AGE_MONTHS &&
                         m.startMonth >= CURRENT_AGE_MONTHS

      // Is current (window we're in)?
      const isCurrent = m.startMonth <= CURRENT_AGE_MONTHS && m.endMonth >= CURRENT_AGE_MONTHS

      // Is past?
      const isPast = m.endMonth < CURRENT_AGE_MONTHS

      const alpha = isPast ? '30' : isCurrent ? 'ee' : isUpcoming ? 'cc' : '50'

      // Bar fill
      ctx.fillStyle = `${color}${alpha}28`
      ctx.beginPath()
      ctx.roundRect(x1, barY, w, barH, 2)
      ctx.fill()

      // Bar border
      ctx.strokeStyle = `${color}${alpha}`
      ctx.lineWidth = isCurrent ? 1.5 : 0.8
      ctx.stroke()

      // Label (only if wide enough)
      if (w > 30) {
        ctx.font = `400 ${chartFontSize(5.5, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = isPast ? `${color}60` : `${color}dd`
        ctx.textAlign = 'left'
        const maxLabelW = w - 4
        let label = m.label
        while (ctx.measureText(label).width > maxLabelW && label.length > 3) {
          label = label.slice(0, -1)
        }
        if (label !== m.label) label += '…'
        ctx.fillText(label, x1 + 3, barY + barH / 2 + 2)
      }
    })

    // Current age cursor
    const cursorX = toX(CURRENT_AGE_MONTHS)
    ctx.beginPath()
    ctx.moveTo(cursorX, mt - 4)
    ctx.lineTo(cursorX, mt + chartH)
    ctx.strokeStyle = '#ffffff60'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Cursor label
    ctx.font = `600 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textPrimary
    ctx.textAlign = 'center'
    const ageLabel = CURRENT_AGE_MONTHS < 12
      ? `${CURRENT_AGE_MONTHS}mo`
      : `${Math.floor(CURRENT_AGE_MONTHS / 12)}yr ${CURRENT_AGE_MONTHS % 12}mo`
    ctx.fillText(ageLabel, cursorX, mt - 6)

    // Upcoming window highlight (next 12mo band)
    const upcomingX1 = toX(CURRENT_AGE_MONTHS)
    const upcomingX2 = toX(CURRENT_AGE_MONTHS + 12)
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    ctx.fillRect(upcomingX1, mt, upcomingX2 - upcomingX1, chartH)

    // Legend at bottom — proportional spacing
    const legY = height - 10
    const items = [
      { label: width < 340 ? 'Active' : 'Current window', color: '#ffffff', alpha: 'ee' },
      { label: width < 340 ? 'Next 12mo' : 'Upcoming 12mo', color: '#ffffff', alpha: '60' },
      { label: 'Past', color: '#ffffff', alpha: '28' },
    ]
    const legItemSpan = (width - ml - mr) / items.length
    items.forEach((item, idx) => {
      const lx = ml + idx * legItemSpan
      ctx.fillStyle = `${item.color}${item.alpha}`
      ctx.fillRect(lx, legY - 6, 10, 6)
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(item.label, lx + 13, legY)
    })
  }, [width])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  )
}
