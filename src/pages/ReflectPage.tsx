import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Reflect</h1>
        <p className="text-[#606080] text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

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
  )
}
