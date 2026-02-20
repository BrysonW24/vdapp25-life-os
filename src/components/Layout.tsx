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
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#2d2d4e] bg-[#0a0a0f]/90 backdrop-blur-md px-4 py-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">L</span>
        </div>
        <span className="font-semibold text-[#e8e8f0] tracking-tight">Life OS</span>
        <button
          onClick={() => setSeasonOpen(true)}
          className="ml-auto text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg hover:bg-violet-500/20 transition-colors"
        >
          {SEASON_LABELS[currentSeason] ?? currentSeason}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-5 max-w-3xl mx-auto w-full pb-24">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-[#2d2d4e] flex justify-around px-2 py-2 safe-pb">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-violet-400'
                  : 'text-[#606080] hover:text-[#a0a0c0]',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <SeasonSelector open={seasonOpen} onClose={() => setSeasonOpen(false)} />
    </div>
  )
}
