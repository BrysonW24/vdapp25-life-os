import { useEffect, useRef } from 'react'
import { useContainerSize } from './useContainerSize'
import { CHART_COLORS, chartFontSize } from './theme'

interface RelBalance {
  name: string
  given: number
  received: number
}

interface Props {
  relationships?: RelBalance[]
}

const DEFAULT_RELS: RelBalance[] = [
  { name: 'Partner', given: 65, received: 70 },
  { name: 'Best Friend', given: 50, received: 35 },
  { name: 'Mentor', given: 20, received: 55 },
  { name: 'Colleague A', given: 40, received: 15 },
  { name: 'Sibling', given: 45, received: 50 },
  { name: 'Old Friend', given: 30, received: 10 },
]

export function ReciprocityBalance({ relationships = DEFAULT_RELS }: Props) {
  const { containerRef, width } = useContainerSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    ctx.font = `500 ${chartFontSize(8, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CHART_COLORS.textDim
    ctx.textAlign = 'center'
    ctx.letterSpacing = '2px'
    ctx.fillText('RECIPROCITY BALANCE', width / 2, 14)
    ctx.letterSpacing = '0px'

    const mt = 28, ml = 70, mr = 12
    const barAreaW = (width - ml - mr) / 2
    const centerX = ml + barAreaW
    const rowH = 24
    const maxVal = Math.max(...relationships.flatMap(r => [r.given, r.received]), 1)

    relationships.forEach((rel, i) => {
      const y = mt + i * rowH

      // Name
      ctx.font = `500 ${chartFontSize(7, width)}px 'JetBrains Mono', monospace`
      ctx.fillStyle = CHART_COLORS.textSecondary
      ctx.textAlign = 'right'
      ctx.fillText(rel.name, ml - 8, y + rowH / 2 + 3)

      // Given bar (left)
      const givenW = (rel.given / maxVal) * barAreaW
      ctx.fillStyle = '#3b82f620'
      ctx.beginPath()
      ctx.roundRect(centerX - givenW, y + 4, givenW, rowH - 8, 3)
      ctx.fill()
      ctx.strokeStyle = '#3b82f640'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.roundRect(centerX - givenW, y + 4, givenW, rowH - 8, 3)
      ctx.stroke()

      // Received bar (right)
      const recvW = (rel.received / maxVal) * barAreaW
      ctx.fillStyle = '#22c55e20'
      ctx.beginPath()
      ctx.roundRect(centerX, y + 4, recvW, rowH - 8, 3)
      ctx.fill()
      ctx.strokeStyle = '#22c55e40'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.roundRect(centerX, y + 4, recvW, rowH - 8, 3)
      ctx.stroke()

      // Imbalance flag
      const ratio = rel.given / Math.max(rel.received, 1)
      if (ratio > 2 || ratio < 0.5) {
        ctx.fillStyle = '#ef444440'
        ctx.beginPath()
        ctx.arc(width - 16, y + rowH / 2, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Center line
    ctx.strokeStyle = CHART_COLORS.border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX, mt)
    ctx.lineTo(centerX, mt + relationships.length * rowH)
    ctx.stroke()

    // Labels
    ctx.font = `400 ${chartFontSize(6, width)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = '#3b82f6'
    ctx.textAlign = 'right'
    ctx.fillText('GIVEN', centerX - 4, mt - 4)
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'left'
    ctx.fillText('RECEIVED', centerX + 4, mt - 4)

  }, [width, relationships])

  return (
    <div ref={containerRef} className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
      <canvas ref={canvasRef} />
    </div>
  )
}
