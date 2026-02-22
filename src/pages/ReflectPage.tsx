import { useState, useEffect, useRef } from 'react'

function ReflectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0
    let w = 0, h = 0
    const dpr = window.devicePixelRatio || 1

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = w * dpr; canvas!.height = h * dpr
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`
      ctx!.scale(dpr, dpr)
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h)
      t += 0.004

      // Soft violet-indigo glow — center
      const grd = ctx!.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6)
      grd.addColorStop(0, 'rgba(99,102,241,0.05)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      // Slow concentric ripple rings — breathing orb
      const cx = w * 0.5, cy = h * 0.42
      for (let i = 0; i < 5; i++) {
        const phase = t + i * 0.55
        const r = 30 + i * 40 + Math.sin(phase) * 8
        const alpha = 0.08 - i * 0.012
        ctx!.beginPath()
        ctx!.arc(cx, cy, r, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(139,92,246,${Math.max(0, alpha)})`
        ctx!.lineWidth = 1
        ctx!.stroke()
      }

      // Slow horizontal sine waves across bottom — water / calm
      for (let wave = 0; wave < 3; wave++) {
        ctx!.beginPath()
        const baseY = h * (0.72 + wave * 0.08)
        const amp = 6 - wave * 1.5
        const freq = 0.012 - wave * 0.002
        const speed = t * (0.6 - wave * 0.15)
        for (let x = 0; x <= w; x += 4) {
          const y = baseY + Math.sin(x * freq + speed) * amp
          if (x === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        ctx!.strokeStyle = `rgba(124,58,237,${0.07 - wave * 0.02})`
        ctx!.lineWidth = 1
        ctx!.stroke()
      }

      // Floating dust motes (slow, random)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.12
        const r = 80 + Math.sin(t * 0.5 + i) * 30
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r * 0.4
        ctx!.beginPath()
        ctx!.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(167,139,250,${0.12 + Math.sin(t + i) * 0.06})`
        ctx!.fill()
      }

      animId = requestAnimationFrame(animate)
    }

    resize(); animate()
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
import { Card } from '@/components/ui/Card'
import { PageHero } from '@/components/illustrations/PageHero'
import { MoodEnergyLine } from '@/components/visualizations/MoodEnergyLine'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/appStore'
import { useTodayReflection, useRecentReflections, saveReflection } from '@/hooks/useReflections'
import { getPrompts, REFLECTION_TYPE_LABELS } from '@/lib/reflectionPrompts'
import { format } from 'date-fns'
import { BookOpen, Sun, Moon, Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import type { ReflectionType } from '@/types'

const MODE_CARDS: Array<{ type: ReflectionType; icon: typeof Sun; color: string; desc: string }> = [
  { type: 'daily-am', icon: Sun,      color: '#d97706', desc: 'Set intentions' },
  { type: 'daily-pm', icon: Moon,     color: '#7c3aed', desc: 'Review the day' },
  { type: 'weekly',   icon: Calendar, color: '#2563eb', desc: 'Pattern review' },
]

export function ReflectPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { activeReflectionType, setActiveReflectionType } = useAppStore()

  const amDone = useTodayReflection('daily-am')
  const pmDone = useTodayReflection('daily-pm')

  const prompts = getPrompts(activeReflectionType)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [energy, setEnergy] = useState(7)
  const [mood, setMood] = useState(7)
  const [saved, setSaved] = useState(false)

  // Load existing reflection for selected type
  const existing = activeReflectionType === 'daily-am' ? amDone : activeReflectionType === 'daily-pm' ? pmDone : undefined

  useEffect(() => {
    if (existing) {
      setResponses(existing.responses)
      setEnergy(existing.energyLevel)
      setMood(existing.mood)
    } else {
      setResponses({})
      setEnergy(7)
      setMood(7)
    }
  }, [existing, activeReflectionType])

  async function handleSave() {
    await saveReflection({
      type: activeReflectionType,
      date: today,
      responses,
      energyLevel: energy,
      mood,
      note: '',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Chart data
  const chartReflections = useRecentReflections(30)

  // History
  const recent = useRecentReflections(7)
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null)

  const hasContent = Object.values(responses).some(v => v.trim().length > 0)

  return (
    <>
    <ReflectCanvas />
    <div className="relative space-y-6" style={{ zIndex: 1 }}>
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Reflect</h1>
        <p className="text-[#606080] text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>
      <PageHero variant="reflect" />

      {/* Mode selection */}
      <div className="grid grid-cols-3 gap-3">
        {MODE_CARDS.map(({ type, icon: Icon, color, desc }) => {
          const isDone = (type === 'daily-am' && amDone) || (type === 'daily-pm' && pmDone)
          const isActive = activeReflectionType === type
          return (
            <Card
              key={type}
              onClick={() => setActiveReflectionType(type)}
              className={clsx('text-center relative', isActive && 'ring-2 ring-violet-500')}
            >
              {isDone && (
                <CheckCircle2 size={12} className="text-emerald-400 absolute top-2 right-2" />
              )}
              <div className="flex justify-center mb-2">
                <div className="rounded-xl p-2" style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <p className="text-xs font-semibold text-[#e8e8f0]">{REFLECTION_TYPE_LABELS[type]}</p>
              <p className="text-[10px] text-[#606080] mt-0.5">{desc}</p>
            </Card>
          )
        })}
      </div>

      {/* Mood / Energy trend */}
      {chartReflections.length >= 2 ? (
        <Card>
          <p className="text-[10px] text-[#606080] mb-1.5">Energy & Mood — Last 30 Reflections</p>
          <MoodEnergyLine reflections={chartReflections} />
        </Card>
      ) : (
        <p className="text-[10px] text-[#404060] text-center">Save 2+ reflections to see mood & energy trends</p>
      )}

      {/* Active reflection form */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          {activeReflectionType === 'daily-am' && <Sun size={16} className="text-amber-400" />}
          {activeReflectionType === 'daily-pm' && <Moon size={16} className="text-violet-400" />}
          {activeReflectionType === 'weekly' && <Calendar size={16} className="text-blue-400" />}
          <p className="text-sm font-semibold text-[#e8e8f0]">{REFLECTION_TYPE_LABELS[activeReflectionType]} Reflection</p>
          {existing && <span className="text-[10px] text-emerald-400 ml-auto">Saved</span>}
        </div>
        <div className="space-y-4">
          {prompts.map(p => (
            <div key={p.key}>
              <p className="text-xs text-[#a0a0c0] mb-1.5">{p.question}</p>
              <textarea
                rows={2}
                value={responses[p.key] ?? ''}
                onChange={e => setResponses(prev => ({ ...prev, [p.key]: e.target.value }))}
                className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                placeholder="..."
              />
            </div>
          ))}
        </div>

        {/* Energy / Mood */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#606080] mb-1.5">Energy ({energy})</p>
            <input type="range" min={1} max={10} value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>
          <div>
            <p className="text-xs text-[#606080] mb-1.5">Mood ({mood})</p>
            <input type="range" min={1} max={10} value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>
        </div>

        <Button className="w-full mt-4" size="sm" onClick={handleSave} disabled={!hasContent}>
          {saved ? <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Saved</span> : `Save ${REFLECTION_TYPE_LABELS[activeReflectionType]} Reflection`}
        </Button>
      </Card>

      {/* History */}
      {recent.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider mb-3">Recent Reflections</p>
          <div className="space-y-2">
            {recent.map(r => {
              const expanded = expandedHistoryId === r.id
              return (
                <Card key={r.id} className="!p-3">
                  <button onClick={() => setExpandedHistoryId(expanded ? null : r.id)} className="w-full text-left flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#e8e8f0]">{REFLECTION_TYPE_LABELS[r.type]}</span>
                        <span className="text-[10px] text-[#404060]">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-[#606080]">Energy: {r.energyLevel}</span>
                        <span className="text-[10px] text-[#606080]">Mood: {r.mood}</span>
                      </div>
                    </div>
                    {expanded ? <ChevronUp size={12} className="text-[#404060]" /> : <ChevronDown size={12} className="text-[#404060]" />}
                  </button>
                  {expanded && (
                    <div className="mt-2 pt-2 border-t border-[#2d2d4e] space-y-2">
                      {Object.entries(r.responses).map(([key, val]) => {
                        if (!val) return null
                        const prompt = getPrompts(r.type).find(p => p.key === key)
                        return (
                          <div key={key}>
                            <p className="text-[10px] text-[#606080]">{prompt?.question ?? key}</p>
                            <p className="text-xs text-[#a0a0c0]">{val}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Quote */}
      <Card className="border-[#1e1e35]">
        <div className="flex items-start gap-2">
          <BookOpen size={14} className="text-[#404060] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#606080] italic leading-relaxed">
            "The unexamined life is not worth living."
            <span className="block mt-1 not-italic text-[#404060]">— Socrates</span>
          </p>
        </div>
      </Card>
    </div>
    </>
  )
}
