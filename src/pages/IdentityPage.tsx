import { useState, useEffect, useRef } from 'react'
import { PageHero } from '@/components/illustrations/PageHero'

function IdentityCanvas() {
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
      t += 0.008

      // Radial identity glow — violet, centered
      const grd = ctx!.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.5)
      grd.addColorStop(0, 'rgba(124,58,237,0.07)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      // Double helix strands — sweeping across left side
      const helixX = w * 0.15
      const helixH = h * 0.7
      const helixTop = h * 0.15
      const amp = 18
      const freq = 0.045

      for (let strand = 0; strand < 2; strand++) {
        ctx!.beginPath()
        const phase = strand === 0 ? 0 : Math.PI
        for (let y = helixTop; y < helixTop + helixH; y += 3) {
          const x = helixX + Math.sin(y * freq + t + phase) * amp
          if (y === helixTop) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        ctx!.strokeStyle = `rgba(124,58,237,${strand === 0 ? 0.18 : 0.10})`
        ctx!.lineWidth = 1
        ctx!.stroke()
      }

      // Helix rungs
      for (let y = helixTop; y < helixTop + helixH; y += 18) {
        const x1 = helixX + Math.sin(y * freq + t) * amp
        const x2 = helixX + Math.sin(y * freq + t + Math.PI) * amp
        ctx!.beginPath()
        ctx!.moveTo(x1, y)
        ctx!.lineTo(x2, y)
        ctx!.strokeStyle = 'rgba(124,58,237,0.12)'
        ctx!.lineWidth = 0.8
        ctx!.stroke()
      }

      // Concentric identity rings — right side
      const cx = w * 0.82, cy = h * 0.38
      const rings = [50, 90, 130, 170]
      rings.forEach((r, i) => {
        const pulse = 1 + Math.sin(t * 0.7 + i * 0.8) * 0.06
        ctx!.beginPath()
        ctx!.arc(cx, cy, r * pulse, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(139,92,246,${0.12 - i * 0.02})`
        ctx!.lineWidth = 1
        ctx!.stroke()
      })

      // Core dot
      ctx!.beginPath()
      ctx!.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(139,92,246,0.4)'
      ctx!.fill()

      // Value particles orbiting the core
      for (let i = 0; i < 7; i++) {
        const angle = t * 0.4 + (i / 7) * Math.PI * 2
        const r = 55 + Math.sin(t + i) * 8
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        ctx!.beginPath()
        ctx!.arc(px, py, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(167,139,250,${0.25 + Math.sin(t + i) * 0.1})`
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
import { ValuesRadar } from '@/components/visualizations/ValuesRadar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { PillarEditor } from '@/components/identity/PillarEditor'
import { StandardEditor } from '@/components/identity/StandardEditor'
import { IdentityDiscovery } from '@/components/identity/IdentityDiscovery'
import { useIdentity, usePillars, useStandards, saveIdentityFull, addPillar, updatePillar, deletePillar } from '@/hooks/useIdentity'
import { useDiscoveryStore } from '@/stores/discoveryStore'
import { Zap, Shield, Compass, Layers, Plus, Pencil, Trash2, CheckCircle2, Columns3, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import type { CoachTone, PersonalityType, Pillar } from '@/types'

const PERSONALITY_TYPES: PersonalityType[] = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
]

const CORE_VALUES = [
  'Mastery', 'Freedom', 'Integrity', 'Impact', 'Courage',
  'Discipline', 'Creativity', 'Family', 'Health', 'Wealth',
  'Growth', 'Service', 'Wisdom', 'Authenticity', 'Excellence',
]

const TONE_OPTIONS: Array<{ value: CoachTone; label: string; desc: string }> = [
  { value: 'rational',      label: 'Rational',      desc: 'Clinical, data-driven, direct' },
  { value: 'stoic',         label: 'Stoic',         desc: 'Disciplined, no excuses, Spartan' },
  { value: 'athletic',      label: 'Athletic',      desc: 'Competitive, game-tape mindset' },
  { value: 'philosophical', label: 'Philosophical', desc: 'Reflective, questioning, deep' },
  { value: 'adaptive',      label: 'Adaptive',      desc: 'Calibrates to your current state' },
]

export function IdentityPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const allStandards = useStandards()

  // Discovery
  const { discoveryOpen, openDiscovery, closeDiscovery, currentStep, drafts } = useDiscoveryStore()

  // Form state
  const [vision, setVision] = useState('')
  const [lifeView, setLifeView] = useState('')
  const [workView, setWorkView] = useState('')
  const [mission, setMission] = useState('')
  const [values, setValues] = useState<string[]>([])
  const [personality, setPersonality] = useState<PersonalityType | null>(null)
  const [tone, setTone] = useState<CoachTone>('adaptive')
  const [saved, setSaved] = useState(false)

  // Pillar editor
  const [pillarModalOpen, setPillarModalOpen] = useState(false)
  const [editingPillar, setEditingPillar] = useState<Pillar | undefined>()

  // Populate from DB
  useEffect(() => {
    if (identity) {
      setVision(identity.visionStatement)
      setLifeView(identity.lifeView)
      setWorkView(identity.workView)
      setMission(identity.missionStatement)
      setValues(identity.coreValues)
      setPersonality(identity.personalityType)
      setTone(identity.coachTone)
    }
  }, [identity])

  function toggleValue(v: string) {
    setValues(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length >= 7 ? prev : [...prev, v],
    )
  }

  async function handleSave() {
    await saveIdentityFull({
      visionStatement: vision,
      lifeView,
      workView,
      missionStatement: mission,
      coreValues: values,
      personalityType: personality,
      coachTone: tone,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleAddPillar(data: { name: string; description: string; color: string }) {
    if (!identity) {
      // Save identity first if it doesn't exist
      await handleSave()
    }
    const id = identity?.id ?? 1
    await addPillar({ identityId: id, ...data, order: pillars.length })
  }

  async function handleEditPillar(data: { name: string; description: string; color: string }) {
    if (editingPillar) {
      await updatePillar(editingPillar.id, data)
    }
    setEditingPillar(undefined)
  }

  async function handleDiscoveryComplete(completedDrafts: typeof drafts) {
    // Populate form state from discovery drafts
    if (completedDrafts.visionDraft) setVision(completedDrafts.visionDraft)
    if (completedDrafts.lifeViewDraft) setLifeView(completedDrafts.lifeViewDraft)
    if (completedDrafts.workViewDraft) setWorkView(completedDrafts.workViewDraft)
    if (completedDrafts.missionDraft) setMission(completedDrafts.missionDraft)
    if (completedDrafts.topValues.length > 0) {
      setValues(completedDrafts.topValues.length <= 7
        ? completedDrafts.topValues
        : completedDrafts.topValues.slice(0, 7))
    }

    // Add suggested pillars
    const identityId = identity?.id ?? 1
    for (let i = 0; i < completedDrafts.suggestedPillars.length; i++) {
      const p = completedDrafts.suggestedPillars[i]
      await addPillar({
        identityId,
        name: p.name,
        description: p.description,
        color: p.color,
        order: pillars.length + i,
      })
    }
  }

  const fieldsEmpty = !vision && !lifeView && !workView && !mission
  const hasInProgressDrafts = currentStep > 0 && !discoveryOpen

  return (
    <>
    <IdentityCanvas />
    <div className="relative space-y-6" style={{ zIndex: 1 }}>
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Identity Declaration</h1>
        <p className="text-[#606080] text-sm mt-1">Your constitution. Everything is measured against this.</p>
      </div>
      <PageHero variant="identity" />

      {/* Discovery: Hero CTA when all fields are empty */}
      {fieldsEmpty && !hasInProgressDrafts && (
        <button
          onClick={openDiscovery}
          className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 text-left transition-colors hover:bg-violet-500/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-violet-400" />
            <p className="text-sm font-semibold text-violet-400">Not sure where to start?</p>
          </div>
          <p className="text-xs text-[#808090] leading-relaxed">
            Our guided discovery walks you through coaching exercises to uncover your vision,
            values, and life pillars. Takes about 15 minutes.
          </p>
          <p className="text-xs text-violet-400 font-medium mt-3">Start Guided Discovery →</p>
        </button>
      )}

      {/* Discovery: Resume banner when in-progress */}
      {hasInProgressDrafts && (
        <button
          onClick={openDiscovery}
          className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left transition-colors hover:bg-amber-500/10 flex items-center gap-3"
        >
          <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">Discovery in Progress</p>
            <p className="text-xs text-[#808090]">Step {currentStep + 1} of 8 — tap to continue</p>
          </div>
          <span className="text-xs text-amber-400">Resume →</span>
        </button>
      )}

      {/* Vision Statement */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Vision Statement</p>
        </div>
        <Textarea
          hint="In 2-3 sentences: what are you building toward? What does your life look like in 10 years?"
          rows={4}
          placeholder="I am building a life where..."
          value={vision}
          onChange={e => setVision(e.target.value)}
        />
      </Card>

      {/* Life View & Work View */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-blue-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Life View</p>
        </div>
        <Textarea
          hint="Why are you alive? What is the purpose of human existence?"
          rows={3}
          placeholder="Life is..."
          value={lifeView}
          onChange={e => setLifeView(e.target.value)}
        />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-green-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Work View</p>
        </div>
        <Textarea
          hint="Why do you work? What is work for, beyond money?"
          rows={3}
          placeholder="I work because..."
          value={workView}
          onChange={e => setWorkView(e.target.value)}
        />
      </Card>

      {/* Mission Statement */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Mission Statement</p>
        </div>
        <Textarea
          hint="What is your 10-20 year arc? What legacy will you build?"
          rows={3}
          placeholder="My mission is to..."
          value={mission}
          onChange={e => setMission(e.target.value)}
        />
      </Card>

      {/* Core Values */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Core Values</p>
          <span className="text-xs text-[#606080] ml-auto">{values.length}/7</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CORE_VALUES.map(v => (
            <button
              key={v}
              onClick={() => toggleValue(v)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                values.includes(v)
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-[#2d2d4e] text-[#808090] hover:border-violet-500/50 hover:text-violet-400',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </Card>

      {/* Values radar */}
      {values.length >= 3 ? (
        <Card>
          <p className="text-[10px] text-[#606080] mb-1.5">Your Value Shape</p>
          <ValuesRadar values={values} />
        </Card>
      ) : values.length > 0 ? (
        <p className="text-[10px] text-[#404060] text-center">Select {3 - values.length} more value{3 - values.length !== 1 ? 's' : ''} to see your radar</p>
      ) : null}

      {/* Life Pillars */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Columns3 size={16} className="text-emerald-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Life Pillars</p>
          <button
            onClick={() => { setEditingPillar(undefined); setPillarModalOpen(true) }}
            className="ml-auto flex items-center gap-1 text-xs text-[#606080] hover:text-violet-400 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {pillars.length === 0 ? (
          <p className="text-xs text-[#404060] py-4 text-center">
            Add your non-negotiable life domains (e.g. Health, Finance, Learning)
          </p>
        ) : (
          <div className="space-y-3">
            {pillars.map(p => {
              const standards = allStandards.filter(s => s.pillarId === p.id)
              return (
                <div key={p.id} className="rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <p className="text-sm font-semibold text-[#e8e8f0] flex-1">{p.name}</p>
                    <button
                      onClick={() => { setEditingPillar(p); setPillarModalOpen(true) }}
                      className="text-[#404060] hover:text-violet-400 transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => deletePillar(p.id)}
                      className="text-[#404060] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {p.description && (
                    <p className="text-xs text-[#606080] mt-1 ml-4">{p.description}</p>
                  )}
                  <StandardEditor pillarId={p.id} standards={standards} />
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Personality */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} className="text-cyan-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Personality Type</p>
          <a
            href="https://www.16personalities.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#606080] hover:text-violet-400 transition-colors ml-auto"
          >
            Take test →
          </a>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PERSONALITY_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setPersonality(personality === t ? null : t)}
              className={clsx(
                'text-xs py-1.5 rounded-lg border transition-colors font-mono',
                personality === t
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-[#2d2d4e] text-[#808090] hover:border-violet-500/50 hover:text-violet-400',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* Coach Tone */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-red-400" />
          <p className="text-sm font-semibold text-[#e8e8f0]">Coach Tone</p>
        </div>
        <div className="space-y-2">
          {TONE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={clsx(
                'w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-left',
                tone === t.value
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-[#2d2d4e] hover:border-violet-500/30',
              )}
            >
              <div className={clsx(
                'w-3 h-3 rounded-full mt-0.5 flex-shrink-0 border-2 transition-colors',
                tone === t.value
                  ? 'border-violet-500 bg-violet-500'
                  : 'border-[#2d2d4e] bg-transparent',
              )} />
              <div>
                <p className="text-sm font-medium text-[#e8e8f0]">{t.label}</p>
                <p className="text-xs text-[#606080]">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Button size="lg" className="w-full" onClick={handleSave}>
        {saved ? (
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Saved</span>
        ) : (
          identity ? 'Update Identity Declaration' : 'Save Identity Declaration'
        )}
      </Button>

      {/* Discovery: subtle link always visible */}
      {!fieldsEmpty && (
        <button
          onClick={openDiscovery}
          className="w-full text-center text-xs text-[#404060] hover:text-violet-400 transition-colors py-2"
        >
          Need help? Try Guided Discovery
        </button>
      )}

      <PillarEditor
        open={pillarModalOpen}
        onClose={() => { setPillarModalOpen(false); setEditingPillar(undefined) }}
        onSave={editingPillar ? handleEditPillar : handleAddPillar}
        initial={editingPillar}
      />

      {/* Discovery overlay */}
      {discoveryOpen && (
        <IdentityDiscovery
          onComplete={handleDiscoveryComplete}
          onClose={closeDiscovery}
        />
      )}
    </div>
    </>
  )
}
