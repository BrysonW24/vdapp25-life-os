import { useEffect, useRef, useMemo } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Body Energy Reactor — arc-reactor-style health visualization.
 *
 * Four concentric rings spinning at different speeds:
 * - Outer ring  = sleep consistency
 * - Second ring = training frequency
 * - Third ring  = nutrition discipline
 * - Inner core  = recovery quality
 *
 * When aligned and consistent, the reactor glows brighter.
 * When one ring drops, the core dims.
 */

interface Props {
  sleep?: number       // 0–100
  training?: number    // 0–100
  nutrition?: number   // 0–100
  recovery?: number    // 0–100
}

const RING_CONFIG = [
  { key: 'sleep',     label: 'SLEEP',     color: '#3b82f6', speed: 0.3 },
  { key: 'training',  label: 'TRAINING',  color: '#22c55e', speed: -0.5 },
  { key: 'nutrition', label: 'NUTRITION', color: '#eab308', speed: 0.7 },
  { key: 'recovery',  label: 'RECOVERY',  color: '#8b5cf6', speed: -0.4 },
] as const

export function BodyEnergyReactor({
  sleep = 78,
  training = 65,
  nutrition = 70,
  recovery = 82,
}: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 320)
  const height = size

  const values = useMemo(() => ({
    sleep: sleep / 100,
    training: training / 100,
    nutrition: nutrition / 100,
    recovery: recovery / 100,
  }), [sleep, training, nutrition, recovery])

  const coreIntensity = useMemo(() => {
    return (values.sleep + values.training + values.nutrition + values.recovery) / 4
  }, [values])

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
    const maxR = size / 2 - 28
    const ringWidth = 6
    const ringGap = 10

    let animFrame: number
    let time = 0

    function draw() {
      time += 0.012
      ctx.clearRect(0, 0, size, height)

      // Background radial glow — intensity based on overall health
      const glowR = maxR + 20
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      glowGrad.addColorStop(0, `rgba(139, 92, 246, ${0.03 + coreIntensity * 0.08})`)
      glowGrad.addColorStop(0.6, `rgba(139, 92, 246, ${0.01 + coreIntensity * 0.03})`)
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, size, height)

      // Draw rings from outside in
      const ringValues = [values.sleep, values.training, values.nutrition, values.recovery]

      RING_CONFIG.forEach((ring, i) => {
        const r = maxR - i * (ringWidth + ringGap)
        const val = ringValues[i]
        const rotation = time * ring.speed

        // Background ring (faint)
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(45, 45, 78, 0.3)'
        ctx.lineWidth = ringWidth
        ctx.stroke()

        // Active arc — length proportional to value
        const arcLen = val * Math.PI * 2
        const startAngle = rotation - Math.PI / 2
        const endAngle = startAngle + arcLen

        ctx.beginPath()
        ctx.arc(cx, cy, r, startAngle, endAngle)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = ringWidth
        ctx.lineCap = 'round'
        ctx.globalAlpha = 0.5 + val * 0.4
        ctx.stroke()
        ctx.globalAlpha = 1

        // Glow on arc tip
        if (val > 0.1) {
          const tipX = cx + Math.cos(endAngle) * r
          const tipY = cy + Math.sin(endAngle) * r
          ctx.shadowColor = ring.color
          ctx.shadowBlur = 8
          ctx.fillStyle = ring.color
          ctx.beginPath()
          ctx.arc(tipX, tipY, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Ring label (positioned outside ring at fixed angle)
        const labelAngle = -Math.PI / 2 + i * 0.6 - 0.3
        const labelR = r + ringWidth + 6
        const lx = cx + Math.cos(labelAngle) * labelR
        const ly = cy + Math.sin(labelAngle) * labelR

        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = ring.color
        ctx.globalAlpha = 0.5
        ctx.textAlign = 'center'
        ctx.fillText(ring.label, lx, ly)
        ctx.globalAlpha = 1
      })

      // ═══ INNER CORE ═══
      const coreR = maxR - 4 * (ringWidth + ringGap)

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
      const pulse = 0.7 + 0.3 * Math.sin(time * 2)
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreIntensity * 0.6 * pulse})`)
      coreGrad.addColorStop(0.4, `rgba(139, 92, 246, ${coreIntensity * 0.3 * pulse})`)
      coreGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fill()

      // Core solid center
      ctx.fillStyle = `rgba(232, 232, 240, ${0.3 + coreIntensity * 0.5})`
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fill()

      // Core percentage
      ctx.font = `700 ${chartFontSize(20, width)}px 'Inter', sans-serif`
      ctx.fillStyle = CHART_COLORS.textPrimary
      ctx.globalAlpha = 0.9
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(coreIntensity * 100)}`, cx, cy - 2)
      ctx.globalAlpha = 1

      ctx.font = `400 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.fillText('REACTOR', cx, cy + 12)

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.letterSpacing = '2px'
      ctx.fillText('BODY ENERGY', size / 2, 14)
      ctx.letterSpacing = '0px'

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, values, coreIntensity])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      {/* Metrics bar */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        {RING_CONFIG.map((ring, i) => {
          const val = [sleep, training, nutrition, recovery][i]
          return (
            <div key={ring.key} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ring.color }} />
              <span className="text-[8px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: ring.color }}>
                {val}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
