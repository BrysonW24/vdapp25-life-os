import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS } from './theme'

/**
 * Fuel Composition Ring — concentric arcs showing macro breakdown.
 *
 * Outer ring: calories consumed vs target (gap = fuel deficit).
 * Inner rings: protein, carbs, fats, fiber, hydration as percentage arcs.
 * Center: deficit/surplus label.
 */

interface MacroData {
  protein: number    // grams
  carbs: number      // grams
  fats: number       // grams
  fiber: number      // grams
  hydration: number  // litres
}

interface Props {
  calories?: number
  calorieTarget?: number
  macros?: MacroData
  macroTargets?: MacroData
}

const MACRO_COLORS = {
  protein: '#22c55e',
  carbs: '#3b82f6',
  fats: '#eab308',
  fiber: '#8b5cf6',
  hydration: '#06b6d4',
} as const

const MACRO_KEYS = ['protein', 'carbs', 'fats', 'fiber', 'hydration'] as const

const DEFAULT_MACROS: MacroData = { protein: 142, carbs: 210, fats: 68, fiber: 28, hydration: 2.4 }
const DEFAULT_TARGETS: MacroData = { protein: 180, carbs: 250, fats: 75, fiber: 35, hydration: 3.0 }

export function FuelCompositionRing({
  calories = 2180,
  calorieTarget = 2600,
  macros = DEFAULT_MACROS,
  macroTargets = DEFAULT_TARGETS,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 340)
  const height = size

  const deficit = calorieTarget - calories
  const calorieRatio = Math.min(calories / calorieTarget, 1)

  const macroRatios = useMemo(() => {
    return MACRO_KEYS.map(key => ({
      key,
      label: key.toUpperCase(),
      color: MACRO_COLORS[key],
      ratio: Math.min((macros[key] ?? 0) / (macroTargets[key] ?? 1), 1),
      value: macros[key] ?? 0,
      target: macroTargets[key] ?? 0,
    }))
  }, [macros, macroTargets])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size < 100) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = height * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const maxR = size / 2 - 32
    const ringWidth = 8
    const ringGap = 6

    ctx.clearRect(0, 0, size, height)

    // Title
    ctx.font = `500 8px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('FUEL COMPOSITION', cx, 16)
    ctx.letterSpacing = '0px'

    // Background radial glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR + 20)
    glowGrad.addColorStop(0, 'rgba(124, 58, 237, 0.04)')
    glowGrad.addColorStop(0.6, 'rgba(124, 58, 237, 0.02)')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, size, height)

    // === OUTER RING — Calorie target ===
    const outerR = maxR

    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(45, 45, 78, 0.4)'
    ctx.lineWidth = ringWidth + 2
    ctx.stroke()

    // Calorie arc
    const calArc = calorieRatio * Math.PI * 2
    const calStart = -Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, calStart, calStart + calArc)
    ctx.strokeStyle = CHART_COLORS.accent
    ctx.lineWidth = ringWidth + 2
    ctx.lineCap = 'round'
    ctx.stroke()

    // Deficit gap indicator
    if (deficit > 0) {
      const gapStart = calStart + calArc + 0.04
      const gapEnd = calStart + Math.PI * 2 - 0.04
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, gapStart, gapEnd)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)'
      ctx.lineWidth = ringWidth + 2
      ctx.lineCap = 'butt'
      ctx.stroke()
    }

    // Calorie label on outer ring
    ctx.font = `600 7px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.accent
    ctx.textAlign = 'right'
    ctx.fillText(`${calories} / ${calorieTarget} kcal`, cx + maxR - 2, cy - maxR - 10)

    // === INNER RINGS — Macros ===
    ctx.lineCap = 'round'

    macroRatios.forEach((macro, i) => {
      const r = outerR - (i + 1) * (ringWidth + ringGap)
      const arcLen = macro.ratio * Math.PI * 2
      const startAngle = -Math.PI / 2

      // Background ring
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(45, 45, 78, 0.25)'
      ctx.lineWidth = ringWidth
      ctx.lineCap = 'butt'
      ctx.stroke()

      // Active arc
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, startAngle + arcLen)
      ctx.strokeStyle = macro.color
      ctx.lineWidth = ringWidth
      ctx.lineCap = 'round'
      ctx.globalAlpha = 0.6 + macro.ratio * 0.4
      ctx.stroke()
      ctx.globalAlpha = 1

      // Glow on tip
      if (macro.ratio > 0.05) {
        const endAngle = startAngle + arcLen
        const tipX = cx + Math.cos(endAngle) * r
        const tipY = cy + Math.sin(endAngle) * r
        ctx.shadowColor = macro.color
        ctx.shadowBlur = 6
        ctx.fillStyle = macro.color
        ctx.beginPath()
        ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Label at fixed position
      const labelAngle = Math.PI / 2 + i * 0.35
      const labelR = r + ringWidth + 5
      const lx = cx + Math.cos(labelAngle) * labelR
      const ly = cy + Math.sin(labelAngle) * labelR

      ctx.font = `400 6px 'JetBrains Mono', monospace`
      ctx.fillStyle = macro.color
      ctx.globalAlpha = 0.6
      ctx.textAlign = 'center'
      ctx.fillText(macro.label, lx, ly)
      ctx.globalAlpha = 1
    })

    // === CENTER ===
    // Deficit / surplus display
    const isDeficit = deficit > 0
    const centerLabel = isDeficit ? 'DEFICIT' : deficit < 0 ? 'SURPLUS' : 'ON TARGET'
    const centerValue = Math.abs(deficit)
    const centerColor = isDeficit ? '#ef4444' : deficit < 0 ? '#22c55e' : CHART_COLORS.textPrimary

    ctx.font = `700 22px 'Inter', sans-serif`
    ctx.fillStyle = centerColor
    ctx.textAlign = 'center'
    ctx.globalAlpha = 0.9
    ctx.fillText(`${centerValue}`, cx, cy - 2)
    ctx.globalAlpha = 1

    ctx.font = `400 7px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textMuted
    ctx.fillText(centerLabel, cx, cy + 14)

    ctx.font = `400 6px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.fillText('kcal', cx, cy + 24)
  }, [size, height, calories, calorieTarget, deficit, calorieRatio, macroRatios])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      {/* Macro legend bar */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        {macroRatios.map(m => (
          <div key={m.key} className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
              <span className="text-[7px] uppercase" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textMuted }}>
                {m.key}
              </span>
            </div>
            <span className="text-[9px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: m.color }}>
              {m.value}{m.key === 'hydration' ? 'L' : 'g'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
