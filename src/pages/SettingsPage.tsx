import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/stores/appStore'
import { applyTheme } from '@/lib/theme'
import { getCoachKey, setCoachKey } from '@/lib/coachApi'
import { useIdentity } from '@/hooks/useIdentity'
import { db } from '@/lib/db'
import {
  User, Palette, Brain, Database, Key,
  Download, Trash2, CheckCircle2, Moon, Sun, Zap,
  Shield, ChevronRight, Sparkles, ExternalLink,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { Theme } from '@/stores/appStore'
import type { MindsetMode, LifeSeason } from '@/types'

const THEMES: Array<{ value: Theme; label: string; desc: string; icon: typeof Sun }> = [
  { value: 'dark',     label: 'Dark',     desc: 'Deep navy. Default.',            icon: Moon },
  { value: 'midnight', label: 'Midnight', desc: 'Max contrast.',                  icon: Zap  },
  { value: 'light',    label: 'Light',    desc: 'Bright. Daylight.',              icon: Sun  },
]

const MINDSET_MODES: Array<{ value: MindsetMode; label: string; desc: string; color: string }> = [
  { value: 'arena',          label: 'Arena',         desc: 'Competitive. High output.',  color: '#FF6B35' },
  { value: 'terminal',       label: 'Terminal',      desc: 'Focused. Deep work.',        color: '#22c55e' },
  { value: 'alignment',      label: 'Alignment',     desc: 'Balanced. Values-led.',      color: '#3b82f6' },
  { value: 'command-center', label: 'Command',       desc: 'Strategic. Review & plan.',  color: '#8b5cf6' },
]

const SEASONS: Array<{ value: LifeSeason; label: string; desc: string; color: string }> = [
  { value: 'foundation',  label: 'Foundation',  desc: 'Building habits, stabilizing pillars',  color: '#059669' },
  { value: 'expansion',   label: 'Expansion',   desc: 'Growing capacity, new challenges',      color: '#2563eb' },
  { value: 'domination',  label: 'Domination',  desc: 'Peak output, aggressive standards',     color: '#dc2626' },
  { value: 'exploration', label: 'Exploration', desc: 'Experimenting, traveling, new paths',   color: '#d97706' },
  { value: 'recovery',    label: 'Recovery',    desc: 'Rest, repair, reset after intensity',   color: '#7c3aed' },
  { value: 'reinvention', label: 'Reinvention', desc: 'Major life pivot, redefining identity', color: '#0891b2' },
]

function SectionHeader({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-violet-400" />
      </div>
      <p className="text-xs font-semibold text-[#e8e8f0] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
    </div>
  )
}

export function SettingsPage() {
  const {
    userName, setUserName,
    theme, setTheme,
    mindsetMode, setMindsetMode,
    currentSeason, setSeason,
  } = useAppStore()

  const identity = useIdentity()

  const [nameInput, setNameInput] = useState(userName)
  const [nameSaved, setNameSaved] = useState(false)

  const [apiKey, setApiKey] = useState('')
  const [keyVisible, setKeyVisible] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  const [clearConfirm, setClearConfirm] = useState(false)
  const [exportDone, setExportDone] = useState(false)

  useEffect(() => {
    setApiKey(getCoachKey())
  }, [])

  function handleSaveName() {
    setUserName(nameInput.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function handleSaveKey() {
    setCoachKey(apiKey.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  function handleTheme(t: Theme) {
    setTheme(t)
    applyTheme(t)
  }

  async function handleExport() {
    const [identityData, pillars, standards, goals, milestones, habits, habitLogs, reflections, alerts] =
      await Promise.all([
        db.identity.toArray(),
        db.pillars.toArray(),
        db.standards.toArray(),
        db.goals.toArray(),
        db.milestones.toArray(),
        db.habits.toArray(),
        db.habitLogs.toArray(),
        db.reflections.toArray(),
        db.advisoryAlerts.toArray(),
      ])

    const data = {
      exportedAt: new Date().toISOString(),
      identity: identityData,
      pillars, standards, goals, milestones,
      habits, habitLogs, reflections, advisoryAlerts: alerts,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-os-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2000)
  }

  async function handleClearData() {
    if (!clearConfirm) { setClearConfirm(true); return }
    await Promise.all([
      db.identity.clear(),
      db.pillars.clear(),
      db.standards.clear(),
      db.goals.clear(),
      db.milestones.clear(),
      db.habits.clear(),
      db.habitLogs.clear(),
      db.reflections.clear(),
      db.advisoryAlerts.clear(),
    ])
    setClearConfirm(false)
    window.location.href = '/'
  }

  const displayInitial = (userName || identity?.visionStatement || 'U')[0].toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Settings</h1>
        <p className="text-[#606080] text-sm mt-1">Profile, theme, AI coach, and data.</p>
      </div>

      {/* ── Profile ─────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={User} label="Profile" />

        {/* Avatar + identity summary */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl border border-[#2d2d4e] bg-[#0f0f1a]">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
          >
            <span className="text-lg font-bold text-white">{displayInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e8e8f0] truncate">{userName || 'Unnamed User'}</p>
            {identity?.personalityType && (
              <p className="text-xs text-violet-400 font-mono mt-0.5 truncate">{identity.personalityType}</p>
            )}
            {identity?.coreValues && identity.coreValues.length > 0 && (
              <p className="text-[10px] text-[#606080] mt-1 truncate">
                {identity.coreValues.slice(0, 4).join(' · ')}
              </p>
            )}
          </div>
          {identity && (
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-[#606080]">Tone</p>
              <p className="text-xs text-[#e8e8f0] capitalize mt-0.5">{identity.coachTone}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Input
            label="Display Name"
            placeholder="e.g. Bryson"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
          />
          <Button size="sm" onClick={handleSaveName} disabled={!nameInput.trim()} className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
            {nameSaved ? <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Saved</span> : 'Save Name'}
          </Button>
        </div>
      </Card>

      {/* ── Life Context ─────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Zap} label="Life Context" />

        {/* Mindset mode — 2 col on all sizes */}
        <p className="text-xs text-[#606080] mb-2">Mindset Mode</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {MINDSET_MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMindsetMode(m.value)}
              className={clsx(
                'flex items-start gap-2 p-3 rounded-xl border text-left transition-colors min-h-[56px]',
                mindsetMode === m.value
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-[#2d2d4e] hover:border-violet-500/20',
              )}
            >
              <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: mindsetMode === m.value ? m.color : '#2d2d4e' }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#e8e8f0] leading-snug">{m.label}</p>
                <p className="text-[10px] text-[#606080] leading-snug mt-0.5">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Season — full width rows */}
        <p className="text-xs text-[#606080] mb-2">Current Life Season</p>
        <div className="space-y-1.5">
          {SEASONS.map(s => (
            <button
              key={s.value}
              onClick={() => setSeason(s.value)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors text-left min-h-[52px]',
                currentSeason === s.value
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-[#2d2d4e] hover:border-violet-500/20',
              )}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: currentSeason === s.value ? s.color : '#2d2d4e' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#e8e8f0]">{s.label}</p>
                <p className="text-[10px] text-[#606080] truncate">{s.desc}</p>
              </div>
              {currentSeason === s.value && <ChevronRight size={12} className="text-violet-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Theme ─────────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Palette} label="Theme" />
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                onClick={() => handleTheme(t.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 py-4 rounded-xl border transition-all min-h-[88px]',
                  theme === t.value
                    ? 'border-violet-500/50 bg-violet-500/8'
                    : 'border-[#2d2d4e] hover:border-violet-500/30',
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center',
                  t.value === 'dark' ? 'bg-[#1e1e35]' : t.value === 'midnight' ? 'bg-black' : 'bg-white',
                )}>
                  <Icon size={16} className={t.value === 'light' ? 'text-amber-500' : 'text-violet-400'} />
                </div>
                <p className="text-xs font-semibold text-[#e8e8f0]">{t.label}</p>
                <p className="text-[9px] text-[#606080] text-center px-1 leading-snug">{t.desc}</p>
              </button>
            )
          })}
        </div>
      </Card>

      {/* ── AI Coach ──────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Brain} label="AI Coach" />

        <div className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 mb-4">
          <Brain size={16} className="text-violet-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-violet-400">claude-sonnet-4-6</p>
            <p className="text-[10px] text-[#606080] leading-snug">Full context of your identity, goals, habits, and reflections.</p>
          </div>
        </div>

        {/* Two paths — always stacked on mobile */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Path A — Just works */}
          <div className="p-4 rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #f97316)' }}>
                <Sparkles size={13} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e8e8f0]">Just make it work</p>
                <p className="text-[9px] text-[#606080]">Managed key — no setup needed</p>
              </div>
            </div>
            <p className="text-[11px] text-[#808090] leading-relaxed">
              Contact Vivacity Digital and we'll set up a managed AI key for you. Works instantly, nothing technical required.
            </p>
            <a
              href="mailto:hello@vivacitydigital.com.au?subject=Life OS — AI Coach Access"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 min-h-[48px]"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #f97316)' }}
            >
              <ExternalLink size={14} />
              Get access — contact us
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2d2d4e]" />
            <span className="text-[9px] text-[#404060] font-mono">OR</span>
            <div className="flex-1 h-px bg-[#2d2d4e]" />
          </div>

          {/* Path B — Bring your own key */}
          <div className="p-4 rounded-xl border border-[#2d2d4e] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Key size={13} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e8e8f0]">Bring your own key</p>
                <p className="text-[9px] text-[#606080]">Developer / self-hosted</p>
              </div>
            </div>
            <div className="relative">
              <input
                type={keyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-3 pr-10 text-xs text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-1 focus:ring-violet-500/40 font-mono min-h-[48px]"
              />
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#404060] hover:text-violet-400 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <Key size={13} />
              </button>
            </div>
            <Button size="sm" onClick={handleSaveKey} disabled={!apiKey.trim()} className="w-full min-h-[44px]">
              {keySaved ? <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Saved</span> : 'Save API Key'}
            </Button>
          </div>
        </div>

        <p className="text-[9px] text-[#404060] leading-relaxed">
          Your API key is stored only in this browser — never sent to any server.
          Get a key at <span className="text-violet-400">console.anthropic.com</span>
        </p>
      </Card>

      {/* ── Data ──────────────────────────────────────────────── */}
      <Card>
        <SectionHeader icon={Database} label="Data" />

        <div className="space-y-3">
          {/* Export */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#2d2d4e]">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#e8e8f0]">Export All Data</p>
              <p className="text-[10px] text-[#606080]">Download as JSON backup</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExport} className="flex-shrink-0 min-h-[40px]">
              {exportDone
                ? <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Done</span>
                : <span className="flex items-center gap-1.5"><Download size={12} /> Export</span>
              }
            </Button>
          </div>

          {/* Clear */}
          <div className={clsx(
            'rounded-xl border transition-colors',
            clearConfirm ? 'border-red-500/40 bg-red-500/5' : 'border-[#2d2d4e]',
          )}>
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#e8e8f0]">
                  {clearConfirm ? 'Are you sure?' : 'Clear All Data'}
                </p>
                <p className="text-[10px] text-[#606080]">
                  {clearConfirm ? 'This cannot be undone.' : 'Permanently deletes all local data'}
                </p>
              </div>
              <Button size="sm" variant="danger" onClick={handleClearData} className="flex-shrink-0 min-h-[40px]">
                <span className="flex items-center gap-1.5">
                  <Trash2 size={12} />
                  {clearConfirm ? 'Confirm' : 'Clear'}
                </span>
              </Button>
            </div>
            {clearConfirm && (
              <div className="px-3 pb-3">
                <Button size="sm" variant="secondary" onClick={() => setClearConfirm(false)} className="w-full min-h-[40px]">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── About ─────────────────────────────────────────────── */}
      <Card className="border-[#1e1e35]">
        <div className="flex items-start gap-3">
          <Shield size={14} className="text-[#404060] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#606080] mb-1">Life OS · vdapp25</p>
            <p className="text-[10px] text-[#404060] leading-relaxed">
              Built by Vivacity Digital. All data stored locally in your browser via IndexedDB.
              No accounts, no cloud sync, no tracking. Your data is yours.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
