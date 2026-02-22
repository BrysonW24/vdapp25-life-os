import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

/**
 * Impact Ripple — a stone dropped into still water. You are the stone.
 *
 * Rings ripple outward:
 * - 1st ring = immediate family
 * - 2nd ring = close friends & collaborators
 * - 3rd ring = people your work has touched
 * - 4th ring = influenced by something you created
 * - 5th ring = future generation impact (projected)
 *
 * Ripples animate slowly. Actions add new drops. Pattern grows over time.
 */

interface RippleLayer {
  label: string
  reach: number // 0–100, how many people/impact
  color: string
}

interface Props {
  layers?: RippleLayer[]
}

const DEFAULT_LAYERS: RippleLayer[] = [
  { label: 'Family',        reach: 90, color: '#8b5cf6' },
  { label: 'Close Circle',  reach: 70, color: '#3b82f6' },
  { label: 'Work Impact',   reach: 50, color: '#22c55e' },
  { label: 'Creations',     reach: 30, color: '#FF6B35' },
  { label: 'Future Gen',    reach: 15, color: '#eab308' },
]

export function ImpactRipple({ layers = DEFAULT_LAYERS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = Math.min(width, 360)
  const height = size

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
    const maxR = size / 2 - 24

    let animFrame: number
    let time = 0

    function draw() {
      time += 0.008
      ctx.clearRect(0, 0, size, height)

      // Water surface gradient
      const waterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR + 10)
      waterGrad.addColorStop(0, 'rgba(15, 15, 26, 0.1)')
      waterGrad.addColorStop(1, 'rgba(15, 15, 26, 0.4)')
      ctx.fillStyle = waterGrad
      ctx.fillRect(0, 0, size, height)

      // Draw ripple rings from outside in
      const ringSpacing = maxR / (layers.length + 1)

      layers.slice().reverse().forEach((layer, reverseIdx) => {
        const idx = layers.length - 1 - reverseIdx
        const baseR = (idx + 1) * ringSpacing
        const reach = layer.reach / 100

        // Multiple animated rings per layer for ripple effect
        for (let wave = 0; wave < 3; wave++) {
          const waveOffset = wave * 0.7
          const ripplePhase = Math.sin(time * 1.5 + idx * 0.8 + waveOffset)
          const rippleR = baseR + ripplePhase * 3
          const rippleAlpha = (0.08 + reach * 0.12) * (1 - wave * 0.3)

          ctx.beginPath()
          ctx.arc(cx, cy, Math.max(0, rippleR), 0, Math.PI * 2)
          ctx.strokeStyle = layer.color
          ctx.lineWidth = 1 + reach * 1.5 - wave * 0.4
          ctx.globalAlpha = rippleAlpha * (0.7 + 0.3 * Math.abs(ripplePhase))
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Label
        const labelAngle = -Math.PI / 2 + idx * 0.35
        const labelR = baseR + 8
        const lx = cx + Math.cos(labelAngle) * labelR
        const ly = cy + Math.sin(labelAngle) * labelR

        ctx.save()
        ctx.translate(lx, ly)
        ctx.rotate(labelAngle + Math.PI / 2)
        ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = layer.color
        ctx.globalAlpha = 0.5 + reach * 0.3
        ctx.textAlign = 'center'
        ctx.fillText(layer.label, 0, 0)
        ctx.restore()
        ctx.globalAlpha = 1
      })

      // Center drop point — you
      // Outer glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18)
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
      coreGrad.addColorStop(0.3, 'rgba(139, 92, 246, 0.3)')
      coreGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx.fill()

      // Drop impact — periodic "drop" animation
      const dropPhase = (time * 0.5) % (Math.PI * 2)
      const dropExpand = Math.sin(dropPhase)
      if (dropExpand > 0) {
        const expandR = dropExpand * maxR * 0.8
        ctx.beginPath()
        ctx.arc(cx, cy, expandR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
        ctx.lineWidth = 1.5
        ctx.globalAlpha = (1 - dropExpand) * 0.3
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Core dot
      const corePulse = 0.7 + 0.3 * Math.sin(time * 3)
      ctx.fillStyle = `rgba(232, 232, 240, ${corePulse})`
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()

      // "YOU" label
      ctx.font = `700 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textMuted
      ctx.textAlign = 'center'
      ctx.fillText('YOU', cx, cy + 16)

      // Title
      ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textDim
      ctx.letterSpacing = '2px'
      ctx.fillText('IMPACT RIPPLE', size / 2, 12)
      ctx.letterSpacing = '0px'

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [size, height, layers])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} />
      </div>

      {/* Layer legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
        {layers.map(layer => (
          <div key={layer.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
            <span className="text-[7px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>{layer.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
