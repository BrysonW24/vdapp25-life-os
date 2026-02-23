import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
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
  { to: '/reflect',    label: 'Reflect',    icon: BookOpen, desc: 'Self-review' },
  { to: '/advisory',   label: 'Advisory',   icon: Sparkles, desc: 'Your mirror' },
  { to: '/intelligence', label: 'Intel',    icon: Brain,    desc: 'Gap detection' },
]

// Mobile bottom nav — 6 items including Visualizations
const MOBILE_NAV = [
  { to: '/',              label: 'Hub',     icon: Home,     accent: false },
  { to: '/goals',         label: 'Goals',   icon: Target,   accent: false },
  { to: '/habits',        label: 'Habits',  icon: Repeat2,  accent: false },
  { to: '/reflect',       label: 'Reflect', icon: BookOpen, accent: false },
  { to: '/visualizations',label: 'Charts',  icon: Eye,      accent: true  },
  { to: '/advisory',      label: 'Mirror',  icon: Sparkles, accent: false },
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

const MODE_COLORS: Record<string, string> = {
  arena: '#FF6B35',
  terminal: '#22c55e',
  alignment: '#3b82f6',
  'command-center': '#8b5cf6',
}

export function Layout() {
  const { currentSeason, mindsetMode, userName } = useAppStore()
  const [seasonOpen, setSeasonOpen] = useState(false)
  const navigate = useNavigate()

  const avatarInitial = (userName || 'U')[0].toUpperCase()
  const modeColor = MODE_COLORS[mindsetMode] ?? '#8b5cf6'

  return (
    <div className="min-h-screen flex layout-root">
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 z-40 sidebar">
        {/* Logo — click to go home */}
        <Link to="/" className="px-5 py-5 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ boxShadow: '0 0 16px rgba(124,58,237,0.25)' }}
          >
            <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight nav-text">Life OS</span>
            <p className="text-[8px] nav-text-dim tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              v0.1
            </p>
          </div>
        </Link>

        {/* Season + Mode badge */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setSeasonOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg nav-border hover:border-violet-500/30 transition-colors"
          >
            <div className="w-2 h-2 rounded-full" style={{ background: modeColor, boxShadow: `0 0 8px ${modeColor}80` }} />
            <div className="flex-1 text-left">
              <p className="text-[10px] nav-text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                {SEASON_LABELS[currentSeason]} · {MODE_LABELS[mindsetMode]}
              </p>
            </div>
            <ChevronRight size={10} className="nav-text-dim" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-[8px] tracking-[0.2em] uppercase nav-text-dim px-3 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
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
                    : 'nav-text-secondary hover:nav-text nav-hover',
                )
              }
            >
              <Icon size={15} strokeWidth={1.5} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium">{label}</p>
                <p className="text-[8px] nav-text-dim group-hover:nav-text-secondary transition-colors truncate">{desc}</p>
              </div>
            </NavLink>
          ))}

          {/* Visualizations — standout card */}
          <div className="pt-3 mt-3 nav-border-top">
            <NavLink
              to="/visualizations"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-violet-600/15 border border-violet-500/30'
                    : 'nav-border hover:border-violet-500/30',
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
                  <p className="text-[11px] font-semibold nav-text">Visualizations</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400" style={{ fontFamily: 'var(--font-mono)' }}>
                    94
                  </span>
                </div>
                <p className="text-[8px] nav-text-dim">Life intelligence gallery</p>
              </div>
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 nav-border-top flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 flex-1 p-2 rounded-lg nav-hover transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">{avatarInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] nav-text-secondary group-hover:nav-text transition-colors truncate">
                {userName || 'Set your name'}
              </p>
              <p className="text-[8px] nav-text-dim tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                vdapp25
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg nav-text-dim hover:nav-text nav-hover transition-colors"
          >
            <Settings size={13} />
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 header-bar px-4 flex items-center gap-2.5" style={{ height: 52 }}>
          {/* Mobile logo — click to go home */}
          <Link to="/" className="lg:hidden flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
            </div>
            <span className="text-sm font-semibold nav-text tracking-tight">Life OS</span>
          </Link>

          <div className="flex-1" />

          {/* Mode pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg header-pill">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: modeColor, boxShadow: `0 0 5px ${modeColor}` }}
            />
            <span className="text-[9px] font-medium nav-text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
              {MODE_LABELS[mindsetMode]}
            </span>
          </div>

          {/* Season badge — opens season selector */}
          <button
            onClick={() => setSeasonOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg header-pill hover:border-violet-500/40 transition-colors duration-200"
          >
            <span className="text-[9px] font-medium nav-text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
              {SEASON_SHORT[currentSeason] ?? currentSeason}
            </span>
            <ChevronRight size={9} className="nav-text-dim" />
          </button>

          {/* Avatar pill → Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg header-pill hover:border-violet-500/40 transition-colors duration-200 group"
            title={userName ? `${userName} · Settings` : 'Settings'}
          >
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500 transition-colors"
              style={{ boxShadow: '0 0 8px rgba(124,58,237,0.3)' }}
            >
              <span className="text-[9px] font-bold text-white">{avatarInitial}</span>
            </div>
            {userName && (
              <span className="text-[9px] font-medium nav-text-secondary hidden md:block truncate max-w-[80px]">
                {userName}
              </span>
            )}
            <Settings size={11} className="nav-text-dim group-hover:text-violet-400 transition-colors" />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 px-3 sm:px-4 py-5 sm:py-6 max-w-2xl mx-auto w-full pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ═══ Mobile Bottom Nav ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 mobile-nav flex items-center justify-around px-1 safe-pb" style={{ height: 58 }}>
        {MOBILE_NAV.map(({ to, label, icon: Icon, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-1.5 py-2 text-[9px] font-medium transition-colors duration-200 min-w-[44px] min-h-[44px] justify-center rounded-lg',
                isActive
                  ? accent ? 'text-violet-400' : 'text-violet-400'
                  : accent ? 'text-violet-500/70 hover:text-violet-400' : 'mobile-nav-item',
              )
            }
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {({ isActive }) => (
              <>
                {accent && !isActive
                  ? <Eye size={17} strokeWidth={1.5} style={{ color: '#8b5cf6' }} />
                  : <Icon size={17} strokeWidth={1.5} />
                }
                <span className={accent && !isActive ? 'text-violet-500/80 italic' : ''}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <SeasonSelector open={seasonOpen} onClose={() => setSeasonOpen(false)} />
      <CoachPanel />
    </div>
  )
}
