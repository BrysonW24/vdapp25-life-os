import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/appStore'
import { Zap, Compass, Layers, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { LifeSeason, CoachTone, PersonalityType } from '@/types'

const STEPS = ['welcome', 'season', 'personality', 'tone', 'ready'] as const
type Step = typeof STEPS[number]

const SEASONS: Array<{ value: LifeSeason; label: string; desc: string }> = [
  { value: 'foundation',   label: 'Foundation',   desc: 'Building habits, stabilizing' },
  { value: 'expansion',    label: 'Expansion',    desc: 'Growing capacity' },
  { value: 'domination',   label: 'Domination',   desc: 'Peak output' },
  { value: 'exploration',  label: 'Exploration',  desc: 'Experimenting, new paths' },
  { value: 'recovery',     label: 'Recovery',     desc: 'Rest and repair' },
  { value: 'reinvention',  label: 'Reinvention',  desc: 'Major pivot' },
]

const TONES: Array<{ value: CoachTone; label: string; desc: string }> = [
  { value: 'rational',      label: 'Rational',      desc: 'Clinical, data-driven' },
  { value: 'stoic',         label: 'Stoic',         desc: 'Disciplined, no excuses' },
  { value: 'athletic',      label: 'Athletic',      desc: 'Competitive, game-tape' },
  { value: 'philosophical', label: 'Philosophical', desc: 'Reflective, deep' },
  { value: 'adaptive',      label: 'Adaptive',      desc: 'Calibrates to you' },
]

const PERSONALITIES: PersonalityType[] = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
]

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setSeason } = useAppStore()
  const [step, setStep] = useState<Step>('welcome')
  const [season, setSeasonLocal] = useState<LifeSeason>('foundation')
  const [personality, setPersonality] = useState<PersonalityType | null>(null)
  const [tone, setTone] = useState<CoachTone>('adaptive')

  const stepIdx = STEPS.indexOf(step)
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  function next() {
    const nextIdx = stepIdx + 1
    if (nextIdx < STEPS.length) {
      setStep(STEPS[nextIdx])
    }
  }

  function finish() {
    setSeason(season)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="h-1 rounded-full bg-[#1e1e35] overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-[#404060] text-right mt-1">{stepIdx + 1}/{STEPS.length}</p>
      </div>

      <div className="w-full max-w-sm">
        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#e8e8f0]">Life OS</h1>
              <p className="text-[#606080] text-sm mt-2 leading-relaxed">
                A digital performance coach that compares who you say you are against what you actually do.
              </p>
            </div>
            <Card className="text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Compass size={14} className="text-violet-400 flex-shrink-0" />
                  <p className="text-xs text-[#a0a0c0]">Declare your identity and standards</p>
                </div>
                <div className="flex items-center gap-3">
                  <Layers size={14} className="text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-[#a0a0c0]">Track habits and goals against them</p>
                </div>
                <div className="flex items-center gap-3">
                  <Zap size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-[#a0a0c0]">Get challenged when you drift</p>
                </div>
              </div>
            </Card>
            <Button className="w-full" onClick={next}>
              Get Started <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}

        {step === 'season' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#e8e8f0]">What season are you in?</h2>
              <p className="text-xs text-[#606080] mt-1">This shapes coaching expectations</p>
            </div>
            <div className="space-y-2">
              {SEASONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSeasonLocal(s.value)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                    season === s.value
                      ? 'border-violet-500/50 bg-violet-500/5'
                      : 'border-[#2d2d4e] hover:border-violet-500/30',
                  )}
                >
                  <div className={clsx(
                    'w-3 h-3 rounded-full flex-shrink-0 border-2 transition-colors',
                    season === s.value
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-[#2d2d4e] bg-transparent',
                  )} />
                  <div>
                    <p className="text-sm font-medium text-[#e8e8f0]">{s.label}</p>
                    <p className="text-[10px] text-[#606080]">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={next}>
              Continue <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}

        {step === 'personality' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#e8e8f0]">Personality Type</h2>
              <p className="text-xs text-[#606080] mt-1">Optional — helps calibrate coaching</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PERSONALITIES.map(t => (
                <button
                  key={t}
                  onClick={() => setPersonality(personality === t ? null : t)}
                  className={clsx(
                    'text-xs py-2 rounded-lg border transition-colors font-mono',
                    personality === t
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-[#2d2d4e] text-[#808090] hover:border-violet-500/50',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={next}>
              {personality ? 'Continue' : 'Skip'} <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}

        {step === 'tone' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#e8e8f0]">Coach Tone</h2>
              <p className="text-xs text-[#606080] mt-1">How should the system speak to you?</p>
            </div>
            <div className="space-y-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                    tone === t.value
                      ? 'border-violet-500/50 bg-violet-500/5'
                      : 'border-[#2d2d4e] hover:border-violet-500/30',
                  )}
                >
                  <div className={clsx(
                    'w-3 h-3 rounded-full flex-shrink-0 border-2 transition-colors',
                    tone === t.value
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-[#2d2d4e] bg-transparent',
                  )} />
                  <div>
                    <p className="text-sm font-medium text-[#e8e8f0]">{t.label}</p>
                    <p className="text-[10px] text-[#606080]">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={next}>
              Continue <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}

        {step === 'ready' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e8e8f0]">You're Ready</h2>
              <p className="text-xs text-[#606080] mt-2 leading-relaxed max-w-xs mx-auto">
                Start by declaring your identity — your vision, values, and the standards you'll be measured against. Everything flows from that.
              </p>
            </div>
            <Button className="w-full" onClick={finish}>
              Enter Life OS <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
