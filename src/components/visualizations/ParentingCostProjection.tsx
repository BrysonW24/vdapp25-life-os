import { useState, useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Parenting Cost Projection — Interactive Family Planning Calculator
 * Controls: number of children (1–3), sibling age gaps, school type (public/private)
 * Models: CCS subsidy (50% @ $180k), sibling discounts, sports/tutoring/camps
 * Government credits: FTB-A ($417/mo per child <13), FTB-B ($250/mo household)
 * X-axis: 25 years from now. Y-axis: combined monthly cost (AUD).
 */

// ─── Cost matrix ─────────────────────────────────────────────────────────────
// Columns: [childcare_gross, eduPublic, eduPrivate, health, food, clothing, sports, tutoring, camps, housing]
const COST_BY_AGE: number[][] = [
  [2200, 0,    0,    120, 180, 80,  0,   0,   0,   400],  // 0
  [2200, 0,    0,    100, 200, 90,  0,   0,   0,   400],  // 1
  [1800, 0,    0,    100, 220, 90,  0,   0,   0,   400],  // 2
  [1400, 400,  0,    90,  240, 100, 180, 0,   0,   400],  // 3  preschool; swimming
  [0,    600,  0,    90,  260, 110, 180, 0,   100, 400],  // 4  school; holiday camps
  [0,    600,  800,  90,  280, 120, 180, 0,   100, 400],  // 5  prep/kindy (private $800)
  [0,    600,  2000, 80,  290, 120, 380, 0,   100, 400],  // 6  primary; sport+music+swim
  [0,    600,  2000, 80,  300, 130, 380, 0,   100, 400],  // 7
  [0,    600,  2000, 80,  310, 130, 380, 0,   100, 400],  // 8
  [0,    600,  2000, 80,  320, 140, 380, 0,   100, 400],  // 9
  [0,    700,  2000, 90,  330, 150, 380, 150, 100, 400],  // 10 tutoring begins
  [0,    700,  2000, 90,  340, 160, 380, 150, 100, 400],  // 11
  [0,    900,  2000, 100, 350, 170, 380, 150, 80,  450],  // 12 high school (public)
  [0,    900,  3500, 100, 360, 180, 300, 150, 80,  450],  // 13 private high school $3,500
  [0,    900,  3500, 100, 370, 190, 300, 150, 80,  450],  // 14
  [0,    900,  3500, 110, 380, 200, 300, 150, 80,  450],  // 15
  [0,    900,  3500, 120, 390, 200, 300, 250, 80,  450],  // 16 HSC tutoring $250
  [0,    900,  3500, 120, 380, 190, 300, 250, 80,  450],  // 17
  [0,    800,  4000, 120, 360, 180, 200, 0,   80,  450],  // 18 uni/HECS year
]

const CCS_RATE      = 0.50   // Child Care Subsidy at $180k combined household income
const FTB_A_MONTHLY = 417    // FTB-A: per child aged 0–12
const FTB_B_MONTHLY = 250    // FTB-B: household, while any child under 13
const CHART_YEARS   = 25     // x-axis span in years

// ─── Category definitions ─────────────────────────────────────────────────────
const CATS_PUBLIC = [
  { key: 'childcare', label: 'Childcare',    color: '#3b82f6' },
  { key: 'education', label: 'Education',    color: '#8b5cf6' },
  { key: 'health',    label: 'Health',       color: '#22c55e' },
  { key: 'food',      label: 'Food',         color: '#FF6B35' },
  { key: 'clothing',  label: 'Clothing',     color: '#eab308' },
  { key: 'sports',    label: 'Sports',       color: '#ec4899' },
  { key: 'tutoring',  label: 'Tutoring',     color: '#f97316' },
  { key: 'camps',     label: 'Camps',        color: '#06b6d4' },
  { key: 'housing',   label: 'Housing',      color: '#404070' },
]

const CATS_PRIVATE = [
  { key: 'childcare', label: 'Childcare',     color: '#3b82f6' },
  { key: 'education', label: 'Private School', color: '#8b5cf6' },
  { key: 'health',    label: 'Health',        color: '#22c55e' },
  { key: 'food',      label: 'Food',          color: '#FF6B35' },
  { key: 'clothing',  label: 'Clothing',      color: '#eab308' },
  { key: 'sports',    label: 'Sports',        color: '#ec4899' },
  { key: 'tutoring',  label: 'Tutoring',      color: '#f97316' },
  { key: 'camps',     label: 'Camps',         color: '#06b6d4' },
  { key: 'housing',   label: 'Housing',       color: '#404070' },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface Child { id: number; birthOffsetYears: number }

interface YearData {
  year: number
  stacks: Record<string, number>
  total: number
  ccsMonthlyBenefit: number
  ftbCredit: number
}

// ─── Logic functions ──────────────────────────────────────────────────────────
function getChildCostAtAge(
  age: number,
  schoolType: 'public' | 'private',
  isSecondary: boolean,
): Record<string, number> {
  const zero = { childcare:0, education:0, health:0, food:0, clothing:0, sports:0, tutoring:0, camps:0, housing:0 }
  if (age < 0 || age > 18) return zero
  const row = COST_BY_AGE[age]
  return {
    childcare: row[0] * (1 - CCS_RATE),
    education: schoolType === 'private' ? row[2] : row[1],
    health:    row[3],
    food:      row[4] * (isSecondary ? 0.80 : 1.0),
    clothing:  row[5] * (isSecondary ? 0.70 : 1.0),
    sports:    row[6],
    tutoring:  row[7],
    camps:     row[8],
    housing:   0,
  }
}

function housingForYear(yearIndex: number, children: Child[]): number {
  let max = 0
  for (const child of children) {
    const age = yearIndex - child.birthOffsetYears
    if (age >= 0 && age <= 18) {
      const h = COST_BY_AGE[age][9]
      if (h > max) max = h
    }
  }
  return max
}

function ftbCreditsForYear(yearIndex: number, children: Child[]): number {
  let ftbA = 0
  let anyUnder13 = false
  for (const child of children) {
    const age = yearIndex - child.birthOffsetYears
    if (age >= 0 && age < 13) { ftbA += FTB_A_MONTHLY; anyUnder13 = true }
  }
  return ftbA + (anyUnder13 ? FTB_B_MONTHLY : 0)
}

function computeYearlyData(children: Child[], schoolType: 'public' | 'private'): YearData[] {
  return Array.from({ length: CHART_YEARS + 1 }, (_, yearIndex) => {
    const stacks: Record<string, number> = {
      childcare:0, education:0, health:0, food:0,
      clothing:0, sports:0, tutoring:0, camps:0, housing:0,
    }
    let ccsBenefit = 0

    for (const child of children) {
      const age = yearIndex - child.birthOffsetYears
      if (age < 0 || age > 18) continue
      const costs = getChildCostAtAge(age, schoolType, child.id > 0)
      for (const key of Object.keys(stacks)) {
        if (key !== 'housing') stacks[key] += costs[key] ?? 0
      }
      ccsBenefit += COST_BY_AGE[age][0] * CCS_RATE
    }

    stacks.housing = housingForYear(yearIndex, children)
    const total = Object.values(stacks).reduce((s, v) => s + v, 0)
    return {
      year: yearIndex,
      stacks,
      total,
      ccsMonthlyBenefit: ccsBenefit,
      ftbCredit: ftbCreditsForYear(yearIndex, children),
    }
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ParentingCostProjection() {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [numChildren, setNumChildren] = useState(1)
  const [gap12, setGap12] = useState(3)
  const [gap23, setGap23] = useState(3)
  const [schoolType, setSchoolType] = useState<'public' | 'private'>('public')

  const height = 320

  const children: Child[] = [
    { id: 0, birthOffsetYears: 0 },
    ...(numChildren >= 2 ? [{ id: 1, birthOffsetYears: gap12 }] : []),
    ...(numChildren >= 3 ? [{ id: 2, birthOffsetYears: gap12 + gap23 }] : []),
  ]

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

    const ml = width < 320 ? 28 : 44, mr = 16, mt = 28, mb = 52
    const chartW = width - ml - mr
    const chartH = height - mt - mb
    const n = CHART_YEARS + 1
    const barW = Math.max(2, chartW / n - 1)
    const toX = (i: number) => ml + i * (chartW / n) + 0.5
    const categories = schoolType === 'private' ? CATS_PRIVATE : CATS_PUBLIC

    const yearlyData = computeYearlyData(children, schoolType)
    const totals = yearlyData.map(d => d.total)
    const maxTotal = Math.max(...totals, 1)
    const peakYear = totals.indexOf(maxTotal)
    const cumulativeTotal = yearlyData.reduce((s, d) => s + d.total * 12, 0)
    const toY = (v: number) => mt + chartH - (v / maxTotal) * chartH

    // Title
    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText(
      `FAMILY COST PROJECTION · ${numChildren} CHILD${numChildren > 1 ? 'REN' : ''}`,
      width / 2, 14
    )
    ctx.letterSpacing = '0px'

    // Y-axis grid
    const tickInterval = maxTotal > 12000 ? 3000 : maxTotal > 8000 ? 2000 : 1000
    for (let v = 0; v <= maxTotal; v += tickInterval) {
      const y = toY(v)
      ctx.beginPath()
      ctx.moveTo(ml - 4, y)
      ctx.lineTo(ml + chartW, y)
      ctx.strokeStyle = v === 0 ? CHART_COLORS.border : CHART_COLORS.gridLine
      ctx.lineWidth = v === 0 ? 1 : 0.5
      ctx.setLineDash(v === 0 ? [] : [3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`$${(v / 1000).toFixed(0)}k`, ml - 6, y + 3)
    }

    // Stacked bars
    yearlyData.forEach(({ year, stacks }) => {
      const x = toX(year)
      let stackY = mt + chartH

      categories.forEach(cat => {
        const val = stacks[cat.key] ?? 0
        if (val <= 0) return
        const bH = (val / maxTotal) * chartH
        ctx.fillStyle = year === peakYear ? `${cat.color}ff` : `${cat.color}99`
        ctx.fillRect(x, stackY - bH, barW, bH)
        stackY -= bH
      })

      // Year 0 highlight
      if (year === 0) {
        ctx.strokeStyle = '#ffffff30'
        ctx.lineWidth = 1
        ctx.strokeRect(x - 1, mt, barW + 2, chartH)
      }

      // X-axis year labels
      if (year === 0 || year % 5 === 0 || year === CHART_YEARS) {
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = year === 0 ? CHART_COLORS.textPrimary : CHART_COLORS.textDim
        ctx.textAlign = 'center'
        ctx.fillText(`${year}`, x + barW / 2, mt + chartH + 10)
      }
    })

    // X-axis label
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.fillText('YEAR FROM NOW', ml + chartW / 2, mt + chartH + 22)

    // Child birth markers (for children born after year 0)
    children.forEach((child, idx) => {
      if (child.birthOffsetYears <= 0) return
      const bx = toX(child.birthOffsetYears) + barW / 2
      ctx.beginPath()
      ctx.moveTo(bx, mt + chartH + 2)
      ctx.lineTo(bx, mt + chartH + 7)
      ctx.strokeStyle = CHART_COLORS.accent
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.accent
      ctx.textAlign = 'center'
      ctx.fillText(`#${idx + 1}`, bx, mt + chartH + 16)
    })

    // Peak annotation
    const peakBarTop = toY(maxTotal)
    if (peakBarTop > mt + 20) {
      const px = toX(peakYear) + barW / 2
      ctx.beginPath()
      ctx.moveTo(px - 4, peakBarTop - 6)
      ctx.lineTo(px + 4, peakBarTop - 6)
      ctx.lineTo(px,     peakBarTop - 2)
      ctx.closePath()
      ctx.fillStyle = CHART_COLORS.accent
      ctx.fill()
      ctx.font = `500 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.accent
      ctx.textAlign = 'center'
      ctx.fillText(`PEAK YR ${peakYear}`, px, peakBarTop - 8)
      if (peakBarTop > mt + 32) {
        ctx.fillText(`$${Math.round(maxTotal).toLocaleString()}`, px, peakBarTop - 18)
      }
    }

    // Cumulative callout — top right
    const cumFontSize = width < 360 ? 12 : 16
    ctx.font = `700 ${chartFontSize(cumFontSize, width)}px 'Inter', sans-serif`
    ctx.fillStyle = CHART_COLORS.accent
    ctx.textAlign = 'right'
    ctx.fillText(`$${(cumulativeTotal / 1000000).toFixed(2)}M`, width - mr, mt + 16)
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('TOTAL 0–25YRS', width - mr, mt + 26)

    // Year 0 callout — top left
    if (width >= 300) {
      ctx.font = `600 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'left'
      ctx.fillText('NOW', ml, mt + 12)
      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.fillText(`$${Math.round(totals[0]).toLocaleString()}/mo`, ml, mt + 22)
    }

    // Legend — 2 or 3 rows on narrow screens
    const legY = height - 14
    const legCols = width < 280 ? 3 : width < 400 ? 4 : categories.length
    const legItemW = Math.floor((width - 16) / legCols)
    categories.forEach((cat, i) => {
      const col = i % legCols
      const row = Math.floor(i / legCols)
      const lx = 8 + col * legItemW
      const ly = legY - row * 13
      ctx.fillStyle = `${cat.color}99`
      ctx.fillRect(lx, ly - 5, 8, 5)
      ctx.font = `400 ${chartFontSize(5, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.textAlign = 'left'
      ctx.fillText(cat.label, lx + 10, ly)
    })
  }, [width, schoolType, numChildren, gap12, gap23])  // eslint-disable-line react-hooks/exhaustive-deps

  // Values for JSX info rows (cheap pure calls)
  const yearlyData = computeYearlyData(children, schoolType)
  const activeCcsYears = yearlyData.filter(d => d.ccsMonthlyBenefit > 0)
  const avgCcs = activeCcsYears.length > 0
    ? Math.round(activeCcsYears.reduce((s, d) => s + d.ccsMonthlyBenefit, 0) / activeCcsYears.length)
    : 0
  const ftbYear0 = Math.round(yearlyData[0].ftbCredit)

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4 space-y-3">

      {/* ── Controls: above the chart ── */}
      <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-[#2d2d4e]">

        {/* Number of children */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-[#404060] tracking-wider mr-1">CHILDREN</span>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setNumChildren(n)}
              className={`w-6 h-6 rounded font-mono text-[10px] border transition-colors ${
                numChildren === n
                  ? 'bg-[#2d2d4e] text-[#e8e8f0] border-[#8b5cf6]'
                  : 'text-[#404060] border-[#2d2d4e] hover:border-[#404070]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Gap to child 2 */}
        {numChildren >= 2 && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-[#404060]">#2 IN</span>
            <select
              value={gap12}
              onChange={e => setGap12(Number(e.target.value))}
              className="bg-[#16162a] border border-[#2d2d4e] text-[#8888aa] font-mono text-[9px] rounded px-1 py-0.5 focus:outline-none"
            >
              {[2, 3, 4, 5].map(y => <option key={y} value={y}>{y}yr</option>)}
            </select>
          </div>
        )}

        {/* Gap to child 3 */}
        {numChildren >= 3 && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-[#404060]">#3 IN</span>
            <select
              value={gap23}
              onChange={e => setGap23(Number(e.target.value))}
              className="bg-[#16162a] border border-[#2d2d4e] text-[#8888aa] font-mono text-[9px] rounded px-1 py-0.5 focus:outline-none"
            >
              {[2, 3, 4, 5].map(y => <option key={y} value={y}>{y}yr</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />

      {/* ── School toggle ── */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#2d2d4e]">
        <span className="font-mono text-[9px] text-[#404060] tracking-wider mr-1">SCHOOL</span>
        {(['public', 'private'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSchoolType(s)}
            className={`px-2 py-0.5 rounded font-mono text-[9px] tracking-wider border transition-colors ${
              schoolType === s
                ? 'bg-[#2d2d4e] text-[#e8e8f0] border-[#8b5cf6]'
                : 'text-[#404060] border-[#2d2d4e] hover:border-[#404070]'
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Government credits info ── */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        {avgCcs > 0 && (
          <span className="font-mono text-[8px] text-[#22c55e]">
            CCS ~${avgCcs.toLocaleString()}/mo avg · 50% @ $180k income
          </span>
        )}
        {ftbYear0 > 0 && (
          <span className="font-mono text-[8px] text-[#3b82f6]">
            FTB ~${ftbYear0.toLocaleString()}/mo credit (yr 0)
          </span>
        )}
      </div>

    </div>
  )
}
