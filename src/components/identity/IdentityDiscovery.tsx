import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDiscoveryStore } from '@/stores/discoveryStore'
import {
  DISCOVERY_WELCOME,
  LIFE_VIEW_EXERCISE,
  WORK_VIEW_EXERCISE,
  VISION_EXERCISE,
  MISSION_EXERCISE,
  ALL_VALUES,
  VALUES_EXERCISE,
  PILLARS_EXERCISE,
  getSuggestedPillars,
} from '@/lib/discoveryPrompts'
import type { DiscoveryExercise, PillarSuggestion } from '@/lib/discoveryPrompts'
import { ChevronLeft, ChevronDown, ChevronUp, ArrowRight, Compass, Zap, Plus, X, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

const STEP_COUNT = 8

const PILLAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777', '#4f46e5']

// ─── Main Component ──────────────────────────────────────────────────────────

interface IdentityDiscoveryProps {
  onComplete: (drafts: ReturnType<typeof useDiscoveryStore.getState>['drafts']) => void
  onClose: () => void
}

export function IdentityDiscovery({ onComplete, onClose }: IdentityDiscoveryProps) {
  const { currentStep, setStep, drafts, updateDrafts, resetDiscovery } = useDiscoveryStore()

  const progress = ((currentStep + 1) / STEP_COUNT) * 100

  function handleSaveAndExit() {
    onClose()
  }

  function handleApply() {
    onComplete(drafts)
    resetDiscovery()
  }

  function next() {
    if (currentStep < STEP_COUNT - 1) {
      setStep(currentStep + 1)
    }
  }

  function back() {
    if (currentStep > 0) {
      setStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-md px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          {currentStep > 0 ? (
            <button onClick={back} className="text-[#606080] hover:text-[#e8e8f0] transition-colors">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <span className="text-xs text-[#606080] flex-1 text-center">{currentStep + 1} / {STEP_COUNT}</span>
          <button
            onClick={handleSaveAndExit}
            className="text-xs text-[#606080] hover:text-[#e8e8f0] transition-colors"
          >
            Save & Exit
          </button>
        </div>
        <div className="h-1 rounded-full bg-[#1e1e35] overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-lg mx-auto pb-24">
        {currentStep === 0 && <WelcomeStep onNext={next} />}
        {currentStep === 1 && (
          <TextExerciseStep
            exercise={LIFE_VIEW_EXERCISE}
            notes={drafts.lifeViewNotes}
            draft={drafts.lifeViewDraft}
            onSave={(notes, draft) => { updateDrafts({ lifeViewNotes: notes, lifeViewDraft: draft }); next() }}
          />
        )}
        {currentStep === 2 && (
          <TextExerciseStep
            exercise={WORK_VIEW_EXERCISE}
            notes={drafts.workViewNotes}
            draft={drafts.workViewDraft}
            onSave={(notes, draft) => { updateDrafts({ workViewNotes: notes, workViewDraft: draft }); next() }}
          />
        )}
        {currentStep === 3 && (
          <VisionStep
            lifeViewDraft={drafts.lifeViewDraft}
            workViewDraft={drafts.workViewDraft}
            notes={drafts.visionNotes}
            draft={drafts.visionDraft}
            onSave={(notes, draft) => { updateDrafts({ visionNotes: notes, visionDraft: draft }); next() }}
          />
        )}
        {currentStep === 4 && (
          <MissionStep
            visionDraft={drafts.visionDraft}
            notes={drafts.missionNotes}
            draft={drafts.missionDraft}
            onSave={(notes, draft) => { updateDrafts({ missionNotes: notes, missionDraft: draft }); next() }}
          />
        )}
        {currentStep === 5 && (
          <ValuesStep
            selected={drafts.selectedValues}
            top={drafts.topValues}
            onSave={(selected, top) => {
              const pillars = getSuggestedPillars(selected)
              updateDrafts({ selectedValues: selected, topValues: top, suggestedPillars: pillars })
              next()
            }}
          />
        )}
        {currentStep === 6 && (
          <PillarsStep
            pillars={drafts.suggestedPillars}
            onSave={(pillars) => { updateDrafts({ suggestedPillars: pillars }); next() }}
          />
        )}
        {currentStep === 7 && (
          <ReviewStep
            drafts={drafts}
            onEdit={(step) => setStep(step)}
            onApply={handleApply}
          />
        )}
      </div>
    </div>
  )
}

// ─── Welcome Step ────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto">
        <Compass size={28} className="text-white" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#e8e8f0]">{DISCOVERY_WELCOME.title}</h1>
        <p className="text-sm text-[#606080] mt-2 leading-relaxed">{DISCOVERY_WELCOME.subtitle}</p>
      </div>

      <p className="text-xs text-[#606080] leading-relaxed max-w-xs mx-auto">{DISCOVERY_WELCOME.body}</p>

      <Card className="text-left">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Compass size={14} className="text-blue-400 flex-shrink-0" />
            <p className="text-xs text-[#a0a0c0]">Build your Life View and Work View</p>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={14} className="text-violet-400 flex-shrink-0" />
            <p className="text-xs text-[#a0a0c0]">Synthesize into a Vision and Mission</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-[#a0a0c0]">Discover your Values and Life Pillars</p>
          </div>
        </div>
      </Card>

      <div className="text-[10px] text-[#404060]">
        {DISCOVERY_WELCOME.duration} · {DISCOVERY_WELCOME.methodology}
      </div>

      <Button className="w-full" onClick={onNext}>
        Let's Begin <ArrowRight size={14} className="ml-2" />
      </Button>
    </div>
  )
}

// ─── Text Exercise Step (Life View, Work View) ───────────────────────────────

function TextExerciseStep({ exercise, notes, draft, onSave }: {
  exercise: DiscoveryExercise
  notes: string[]
  draft: string
  onSave: (notes: string[], draft: string) => void
}) {
  const [subStep, setSubStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(
    notes.length > 0 ? [...notes] : exercise.prompts.map(() => ''),
  )
  const [synthesis, setSynthesis] = useState(draft)
  const [showExample, setShowExample] = useState<number | null>(null)
  const activeRef = useRef<HTMLTextAreaElement>(null)

  const isSynthesisStep = subStep === exercise.prompts.length

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [subStep])

  function handleSubNext() {
    if (subStep < exercise.prompts.length) {
      setSubStep(subStep + 1)
    }
  }

  function handleSave() {
    onSave(answers, synthesis)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">{exercise.title}</h2>
        <p className="text-xs text-[#606080] mt-1 leading-relaxed">{exercise.intro}</p>
      </div>

      {/* Previous sub-prompt answers (shown as context) */}
      {answers.slice(0, subStep).map((answer, i) => (
        <div key={exercise.prompts[i].key} className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-3">
          <p className="text-[10px] text-[#404060] mb-1">{exercise.prompts[i].question}</p>
          <p className="text-xs text-[#808090]">{answer || '(skipped)'}</p>
        </div>
      ))}

      {/* Current sub-prompt */}
      {!isSynthesisStep && (
        <div>
          <p className="text-sm font-semibold text-[#e8e8f0] mb-1">
            {exercise.prompts[subStep].question}
          </p>
          <p className="text-xs text-[#404060] mb-3">{exercise.prompts[subStep].guidance}</p>

          <textarea
            ref={activeRef}
            rows={4}
            value={answers[subStep]}
            onChange={e => {
              const next = [...answers]
              next[subStep] = e.target.value
              setAnswers(next)
            }}
            placeholder={exercise.prompts[subStep].placeholder}
            className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />

          {/* Example toggle */}
          <button
            onClick={() => setShowExample(showExample === subStep ? null : subStep)}
            className="flex items-center gap-1.5 text-[10px] text-[#606080] hover:text-violet-400 transition-colors mt-2"
          >
            {showExample === subStep ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            See an example
          </button>
          {showExample === subStep && (
            <div className="mt-2 rounded-xl bg-violet-500/5 border border-violet-500/10 p-3">
              <p className="text-xs text-[#808090] italic leading-relaxed">
                "{exercise.prompts[subStep].example}"
              </p>
            </div>
          )}

          <Button className="w-full mt-4" size="sm" onClick={handleSubNext}>
            {subStep < exercise.prompts.length - 1 ? 'Next' : 'Now synthesize'}
            <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      )}

      {/* Synthesis step */}
      {isSynthesisStep && (
        <div>
          <p className="text-sm font-semibold text-[#e8e8f0] mb-1">Pull it together</p>
          <p className="text-xs text-[#404060] mb-3">{exercise.synthesis.instruction}</p>

          <textarea
            ref={activeRef}
            rows={5}
            value={synthesis}
            onChange={e => setSynthesis(e.target.value)}
            placeholder={exercise.synthesis.placeholder}
            className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />

          <p className="text-[10px] text-[#404060] mt-1.5">{exercise.synthesis.hint}</p>

          {exercise.synthesis.example && (
            <>
              <button
                onClick={() => setShowExample(showExample === 99 ? null : 99)}
                className="flex items-center gap-1.5 text-[10px] text-[#606080] hover:text-violet-400 transition-colors mt-2"
              >
                {showExample === 99 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                See an example
              </button>
              {showExample === 99 && (
                <div className="mt-2 rounded-xl bg-violet-500/5 border border-violet-500/10 p-3">
                  <p className="text-xs text-[#808090] italic leading-relaxed">
                    "{exercise.synthesis.example}"
                  </p>
                </div>
              )}
            </>
          )}

          <Button className="w-full mt-4" onClick={handleSave} disabled={!synthesis.trim()}>
            Continue <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Vision Step (shows Life View + Work View context) ───────────────────────

function VisionStep({ lifeViewDraft, workViewDraft, notes, draft, onSave }: {
  lifeViewDraft: string
  workViewDraft: string
  notes: string[]
  draft: string
  onSave: (notes: string[], draft: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">{VISION_EXERCISE.title}</h2>
        <p className="text-xs text-[#606080] mt-1 leading-relaxed">{VISION_EXERCISE.intro}</p>
      </div>

      {/* Context cards */}
      {lifeViewDraft && (
        <div className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-3">
          <p className="text-[10px] text-[#404060] mb-1">Your Life View</p>
          <p className="text-xs text-[#808090]">{lifeViewDraft}</p>
        </div>
      )}
      {workViewDraft && (
        <div className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-3">
          <p className="text-[10px] text-[#404060] mb-1">Your Work View</p>
          <p className="text-xs text-[#808090]">{workViewDraft}</p>
        </div>
      )}

      <TextExerciseStep
        exercise={VISION_EXERCISE}
        notes={notes}
        draft={draft}
        onSave={onSave}
      />
    </div>
  )
}

// ─── Mission Step (shows Vision context) ─────────────────────────────────────

function MissionStep({ visionDraft, notes, draft, onSave }: {
  visionDraft: string
  notes: string[]
  draft: string
  onSave: (notes: string[], draft: string) => void
}) {
  return (
    <div className="space-y-4">
      {visionDraft && (
        <div className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-3">
          <p className="text-[10px] text-[#404060] mb-1">Your Vision</p>
          <p className="text-xs text-[#808090]">{visionDraft}</p>
        </div>
      )}

      <TextExerciseStep
        exercise={MISSION_EXERCISE}
        notes={notes}
        draft={draft}
        onSave={onSave}
      />
    </div>
  )
}

// ─── Values Elimination Step ─────────────────────────────────────────────────

function ValuesStep({ selected, top, onSave }: {
  selected: string[]
  top: string[]
  onSave: (selected: string[], top: string[]) => void
}) {
  const [round, setRound] = useState(0)
  const [pool, setPool] = useState<string[]>(selected.length > 0 ? selected : [])
  const [topPicks, setTopPicks] = useState<string[]>(top.length > 0 ? top : [])

  const roundConfig = VALUES_EXERCISE.rounds[round]

  function toggleValue(value: string) {
    if (round === 0) {
      // Round 1: select from all 15, target 10
      setPool(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : prev.length < 10 ? [...prev, value] : prev,
      )
    } else if (round === 1) {
      // Round 2: deselect from 10, target 7
      setPool(prev =>
        prev.includes(value) && prev.length > 7
          ? prev.filter(v => v !== value)
          : prev.includes(value) ? prev : [...prev, value],
      )
    } else {
      // Round 3: highlight top 3 from remaining 7
      setTopPicks(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : prev.length < 3 ? [...prev, value] : prev,
      )
    }
  }

  function handleNext() {
    if (round < 2) {
      setRound(round + 1)
    } else {
      onSave(pool, topPicks)
    }
  }

  const displayValues = round === 0 ? ALL_VALUES : pool
  const canContinue =
    (round === 0 && pool.length === 10) ||
    (round === 1 && pool.length === 7) ||
    (round === 2 && topPicks.length === 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">{VALUES_EXERCISE.title}</h2>
        <p className="text-xs text-[#606080] mt-1 leading-relaxed">{VALUES_EXERCISE.intro}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#e8e8f0] mb-1">
          Round {round + 1} of 3
        </p>
        <p className="text-xs text-[#404060] mb-3">{roundConfig.instruction}</p>

        <div className="flex flex-wrap gap-2">
          {displayValues.map(v => {
            const isSelected = round < 2 ? pool.includes(v) : topPicks.includes(v)
            const isInPool = pool.includes(v)

            return (
              <button
                key={v}
                onClick={() => toggleValue(v)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors',
                  round === 2 && isSelected && 'bg-amber-500 text-white border-amber-500',
                  round === 2 && !isSelected && 'bg-violet-600/20 text-violet-300 border-violet-500/30',
                  round < 2 && isSelected && 'bg-violet-600 text-white border-violet-600',
                  round < 2 && !isSelected && 'border-[#2d2d4e] text-[#808090] hover:border-violet-500/50',
                  round === 1 && !isInPool && 'opacity-30',
                )}
              >
                {v}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-[#606080] text-center mt-3">
          {round === 0 && `${pool.length}/10 selected`}
          {round === 1 && `${pool.length}/7 remaining`}
          {round === 2 && `${topPicks.length}/3 non-negotiables`}
        </p>
      </div>

      <Button className="w-full" onClick={handleNext} disabled={!canContinue}>
        {round < 2 ? 'Next Round' : 'Continue'} <ArrowRight size={14} className="ml-2" />
      </Button>
    </div>
  )
}

// ─── Pillars Step ────────────────────────────────────────────────────────────

function PillarsStep({ pillars, onSave }: {
  pillars: PillarSuggestion[]
  onSave: (pillars: PillarSuggestion[]) => void
}) {
  const [selected, setSelected] = useState<PillarSuggestion[]>(pillars)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(PILLAR_COLORS[0])

  function togglePillar(pillar: PillarSuggestion) {
    setSelected(prev =>
      prev.some(p => p.name === pillar.name)
        ? prev.filter(p => p.name !== pillar.name)
        : [...prev, pillar],
    )
  }

  function addCustom() {
    if (!newName.trim()) return
    setSelected(prev => [...prev, { name: newName.trim(), description: newDesc.trim(), color: newColor }])
    setNewName('')
    setNewDesc('')
    setNewColor(PILLAR_COLORS[0])
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">{PILLARS_EXERCISE.title}</h2>
        <p className="text-xs text-[#606080] mt-1 leading-relaxed">{PILLARS_EXERCISE.intro}</p>
      </div>

      <p className="text-xs text-[#404060]">{PILLARS_EXERCISE.instruction}</p>

      <div className="space-y-2">
        {pillars.map(p => {
          const isSelected = selected.some(s => s.name === p.name)
          return (
            <button
              key={p.name}
              onClick={() => togglePillar(p)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-[#2d2d4e] hover:border-violet-500/30 opacity-50',
              )}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#e8e8f0]">{p.name}</p>
                <p className="text-[10px] text-[#606080]">{p.description}</p>
              </div>
              {isSelected && <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0" />}
            </button>
          )
        })}

        {/* Custom pillars added by user */}
        {selected.filter(s => !pillars.some(p => p.name === s.name)).map(p => (
          <div
            key={p.name}
            className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/50 bg-violet-500/5"
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#e8e8f0]">{p.name}</p>
              <p className="text-[10px] text-[#606080]">{p.description}</p>
            </div>
            <button onClick={() => setSelected(prev => prev.filter(s => s.name !== p.name))}>
              <X size={12} className="text-[#404060] hover:text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add custom pillar */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-xs text-[#606080] hover:text-violet-400 transition-colors"
        >
          <Plus size={12} /> Add custom pillar
        </button>
      ) : (
        <Card>
          <div className="space-y-3">
            <input
              placeholder="Pillar name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
            <input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2 text-xs text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
            <div className="flex gap-2">
              {PILLAR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: newColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                    opacity: newColor === c ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
              <Button size="sm" onClick={addCustom} disabled={!newName.trim()} className="flex-1">Add</Button>
            </div>
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={() => onSave(selected)} disabled={selected.length === 0}>
        Continue <ArrowRight size={14} className="ml-2" />
      </Button>
    </div>
  )
}

// ─── Review Step ─────────────────────────────────────────────────────────────

function ReviewStep({ drafts, onEdit, onApply }: {
  drafts: ReturnType<typeof useDiscoveryStore.getState>['drafts']
  onEdit: (step: number) => void
  onApply: () => void
}) {
  const sections = [
    { label: 'Life View', value: drafts.lifeViewDraft, step: 1 },
    { label: 'Work View', value: drafts.workViewDraft, step: 2 },
    { label: 'Vision', value: drafts.visionDraft, step: 3 },
    { label: 'Mission', value: drafts.missionDraft, step: 4 },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#e8e8f0]">Your Identity Draft</h2>
        <p className="text-xs text-[#606080] mt-1">Review everything before applying to your Identity Declaration.</p>
      </div>

      {/* Text sections */}
      {sections.map(s => (
        <Card key={s.label}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider">{s.label}</p>
            <button onClick={() => onEdit(s.step)} className="text-[10px] text-violet-400 hover:text-violet-300">
              Edit
            </button>
          </div>
          <p className="text-xs text-[#a0a0c0] leading-relaxed">
            {s.value || <span className="text-[#404060] italic">(not yet written)</span>}
          </p>
        </Card>
      ))}

      {/* Values */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider">Core Values</p>
          <button onClick={() => onEdit(5)} className="text-[10px] text-violet-400 hover:text-violet-300">
            Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {drafts.selectedValues.map(v => (
            <span
              key={v}
              className={clsx(
                'text-[10px] px-2 py-1 rounded-full',
                drafts.topValues.includes(v)
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'bg-violet-500/10 text-violet-300',
              )}
            >
              {v}
            </span>
          ))}
          {drafts.selectedValues.length === 0 && (
            <span className="text-[10px] text-[#404060] italic">(no values selected)</span>
          )}
        </div>
      </Card>

      {/* Pillars */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider">Life Pillars</p>
          <button onClick={() => onEdit(6)} className="text-[10px] text-violet-400 hover:text-violet-300">
            Edit
          </button>
        </div>
        <div className="space-y-2">
          {drafts.suggestedPillars.map(p => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <p className="text-xs text-[#e8e8f0]">{p.name}</p>
            </div>
          ))}
          {drafts.suggestedPillars.length === 0 && (
            <span className="text-[10px] text-[#404060] italic">(no pillars selected)</span>
          )}
        </div>
      </Card>

      <Button className="w-full" onClick={onApply}>
        Apply to My Identity <ArrowRight size={14} className="ml-2" />
      </Button>

      <p className="text-[10px] text-[#404060] text-center">
        This will populate your Identity Declaration. You can still edit before saving.
      </p>
    </div>
  )
}
