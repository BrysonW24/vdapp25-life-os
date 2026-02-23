import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { SeasonSelector } from '@/components/SeasonSelector'
import { CoachPanel } from '@/components/coach/CoachPanel'
import { useAppStore } from '@/stores/appStore'
import {
  Home,
  User,
  Target,
  Repeat2,
  BookOpen,
  Sparkles,
  Brain,
  Eye,
  ChevronRight,
  Settings,
} from 'lucide-react'

const NAV = [
  { to: '/',           label: 'Hub',        icon: Home,     desc: 'Command center' },
  { to: '/identity',   label: 'Identity',   icon: User,     desc: 'Who you are' },
  { to: '/goals',      label: 'Goals',      icon: Target,   desc: 'What you pursue' },
  { to: '/habits',     label: 'Habits',     icon: Repeat2,  desc: 'Daily execution' },
  { to: '/reflect',    label: 'Reflect',    icon: BookOpen,  desc: 'Self-review' },
  { to: '/advisory',   label: 'Advisory',   icon: Sparkles, desc: 'Your mirror' },
  { to: '/intelligence', label: 'Intel',   icon: Brain,    desc: 'Gap detection' },
]

// Items shown in the mobile bottom nav (subset — Visualizations replaces Intel on mobile)
const MOBILE_NAV = [
  { to: '/',           label: 'Hub',     icon: Home },
  { to: '/goals',      label: 'Goals',   icon: Target },
  { to: '/habits',     label: 'Habits',  icon: Repeat2 },
  { to: '/reflect',    label: 'Reflect', icon: BookOpen },
  { to: '/advisory',   label: 'Mirror',  icon: Sparkles },
]

const SEASON_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  expansion: 'Expansion',
  domination: 'Domination',
  exploration: 'Exploration',
  recovery: 'Recovery',
  reinvention: 'Reinvention',
}

const SEASON_SHORT: Record<string, string> = {
  foundation: 'FND',
  expansion: 'EXP',
  domination: 'DOM',
  exploration: 'XPL',
  recovery: 'RCV',
  reinvention: 'RNV',
}

const MODE_LABELS: Record<string, string> = {
  terminal: 'Terminal',
  alignment: 'Alignment',
  arena: 'Arena',
  'command-center': 'Command',
}

export function Layout() {
  const { currentSeason, mindsetMode, userName } = useAppStore()
  const [seasonOpen, setSeasonOpen] = useState(false)
  const navigate = useNavigate()

  const avatarInitial = (userName || 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a' }}>
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 z-40 border-r border-[#2d2d4e]"
        style={{ background: 'rgba(15,15,26,0.97)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(124,58,237,0.25)' }}
          >
            <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-[#e8e8f0] tracking-tight">Life OS</span>
            <p className="text-[8px] text-[#404060] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              v0.1
            </p>
          </div>
        </div>

        {/* Season + Mode badge */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setSeasonOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2d2d4e] hover:border-violet-500/30 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-violet-500" style={{ boxShadow: '0 0 8px rgba(124,58,237,0.5)' }} />
            <div className="flex-1 text-left">
              <p className="text-[10px] text-[#808090]" style={{ fontFamily: 'var(--font-mono)' }}>
                {SEASON_LABELS[currentSeason]} · {MODE_LABELS[mindsetMode]}
              </p>
            </div>
            <ChevronRight size={10} className="text-[#404060]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-[8px] tracking-[0.2em] uppercase text-[#404060] px-3 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            System
          </p>
          {NAV.map(({ to, label, icon: Icon, desc }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-[#808090] hover:text-[#e8e8f0] hover:bg-[#1e1e35]',
                )
              }
            >
              <Icon size={15} strokeWidth={1.5} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium">{label}</p>
                <p className="text-[8px] text-[#404060] group-hover:text-[#606080] transition-colors truncate">{desc}</p>
              </div>
            </NavLink>
          ))}

          {/* Visualizations — standout card */}
          <div className="pt-3 mt-3" style={{ borderTop: '1px solid #2d2d4e' }}>
            <NavLink
              to="/visualizations"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-violet-600/15 border border-violet-500/30'
                    : 'border border-[#2d2d4e] hover:border-violet-500/30',
                )
              }
            >
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }} />
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #FF6B35)' }}
              >
                <Eye size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-semibold text-[#e8e8f0]">Visualizations</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400" style={{ fontFamily: 'var(--font-mono)' }}>
                    94
                  </span>
                </div>
                <p className="text-[8px] text-[#606080]">Life intelligence gallery</p>
              </div>
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#2d2d4e] flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 flex-1 p-2 rounded-lg hover:bg-[#1e1e35] transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">{avatarInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#808090] group-hover:text-[#e8e8f0] transition-colors truncate">
                {userName || 'Set your name'}
              </p>
              <p className="text-[8px] text-[#404060] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                vdapp25
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg text-[#404060] hover:text-[#e8e8f0] hover:bg-[#1e1e35] transition-colors"
          >
            <Settings size={13} />
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[#2d2d4e] px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(15,15,26,0.92)', backdropFilter: 'blur(12px)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
            </div>
            <span className="text-sm font-semibold text-[#e8e8f0] tracking-tight">Life OS</span>
          </div>

          <div className="flex-1" />

          {/* Mindset mode badge — desktop only */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: mindsetMode === 'arena' ? '#FF6B35' : mindsetMode === 'terminal' ? '#22c55e' : mindsetMode === 'alignment' ? '#3b82f6' : '#8b5cf6',
              boxShadow: `0 0 6px ${mindsetMode === 'arena' ? 'rgba(255,107,53,0.5)' : 'rgba(124,58,237,0.5)'}`,
            }} />
            {MODE_LABELS[mindsetMode]} Mode
          </div>

          {/* Season badge */}
          <button
            onClick={() => setSeasonOpen(true)}
            className="text-[10px] font-medium text-[#808090] border border-[#2d2d4e] px-2 py-0.5 rounded-lg hover:text-[#e8e8f0] hover:border-violet-500/30 transition-colors duration-200"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {SEASON_SHORT[currentSeason] ?? currentSeason}
          </button>

          {/* Avatar → Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors"
            style={{ boxShadow: '0 0 10px rgba(124,58,237,0.2)' }}
            title={userName ? `${userName} · Settings` : 'Settings'}
          >
            <span className="text-[10px] font-bold text-white">{avatarInitial}</span>
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 px-3 sm:px-4 py-5 sm:py-6 max-w-2xl mx-auto w-full pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ═══ Mobile Bottom Nav ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#2d2d4e] flex items-end justify-around px-1 pb-safe safe-pb"
        style={{ background: 'rgba(15,15,26,0.97)', backdropFilter: 'blur(16px)' }}
      >
        {/* Left 2 items */}
        {MOBILE_NAV.slice(0, 2).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-2 py-2.5 text-[9px] font-medium transition-colors duration-200 min-w-[44px] min-h-[44px] justify-center',
                isActive ? 'text-violet-400' : 'text-[#505070] hover:text-[#808090]',
              )
            }
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Icon size={17} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}

        {/* Centre — Visualizations FAB */}
        <NavLink
          to="/visualizations"
          className={({ isActive }) =>
            clsx(
              'relative flex flex-col items-center gap-1 -mt-4 transition-all duration-200',
              isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100',
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={clsx(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200',
                  isActive
                    ? 'scale-105'
                    : 'hover:scale-105',
                )}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #FF6B35)',
                  boxShadow: isActive
                    ? '0 0 24px rgba(124,58,237,0.55), 0 0 12px rgba(255,107,53,0.3)'
                    : '0 0 16px rgba(124,58,237,0.35), 0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <Eye size={22} className="text-white" strokeWidth={1.5} />
              </div>
              <span
                className={clsx('text-[8px] font-semibold pb-1', isActive ? 'text-violet-400' : 'text-[#606080]')}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                CHARTS
              </span>
            </>
          )}
        </NavLink>

        {/* Right 3 items */}
        {MOBILE_NAV.slice(2).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-2 py-2.5 text-[9px] font-medium transition-colors duration-200 min-w-[44px] min-h-[44px] justify-center',
                isActive ? 'text-violet-400' : 'text-[#505070] hover:text-[#808090]',
              )
            }
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Icon size={17} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <SeasonSelector open={seasonOpen} onClose={() => setSeasonOpen(false)} />
      <CoachPanel />
    </div>
  )
}
