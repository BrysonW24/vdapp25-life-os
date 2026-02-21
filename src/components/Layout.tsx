import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { SeasonSelector } from '@/components/SeasonSelector'
import { useAppStore } from '@/stores/appStore'
import {
  Home,
  User,
  Target,
  Repeat2,
  BookOpen,
  Sparkles,
  Brain,
} from 'lucide-react'

const NAV = [
  { to: '/',           label: 'Hub',        icon: Home },
  { to: '/identity',   label: 'Identity',   icon: User },
  { to: '/goals',      label: 'Goals',      icon: Target },
  { to: '/habits',     label: 'Habits',     icon: Repeat2 },
  { to: '/reflect',    label: 'Reflect',    icon: BookOpen },
  { to: '/advisory',   label: 'Advisory',   icon: Sparkles },
  { to: '/intelligence', label: 'Intel',   icon: Brain },
]

const SEASON_LABELS: Record<string, string> = {
  foundation: 'FND',
  expansion: 'EXP',
  domination: 'DOM',
  exploration: 'XPL',
  recovery: 'RCV',
  reinvention: 'RNV',
}

export function Layout() {
  const { currentSeason } = useAppStore()
  const [seasonOpen, setSeasonOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0C0C0C' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#252525] px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="w-5 h-5 rounded-none bg-[#FF6B35] flex items-center justify-center">
          <span className="text-[9px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
        </div>
        <span className="text-sm font-semibold text-[#F0EDE8] tracking-tight">Life OS</span>
        <div className="flex-1" />
        <button
          onClick={() => setSeasonOpen(true)}
          className="text-[10px] font-medium text-[#8A847C] border border-[#252525] px-2 py-0.5 rounded-none hover:text-[#F0EDE8] hover:border-[#4A4640] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {SEASON_LABELS[currentSeason] ?? currentSeason}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full pb-24">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#252525] flex justify-around px-1 py-1.5 safe-pb" style={{ background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(12px)' }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[9px] font-medium transition-colors duration-200',
                isActive
                  ? 'text-[#FF6B35]'
                  : 'text-[#4A4640] hover:text-[#8A847C]',
              )
            }
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <SeasonSelector open={seasonOpen} onClose={() => setSeasonOpen(false)} />
    </div>
  )
}
