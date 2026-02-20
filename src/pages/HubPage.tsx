import { Card } from '@/components/ui/Card'
import { PillarDonut } from '@/components/visualizations/PillarDonut'
import { useIdentity, usePillars } from '@/hooks/useIdentity'
import { useActiveHabits, useTodayLogs } from '@/hooks/useHabits'
import { useTodayReflection } from '@/hooks/useReflections'
import { useActiveAlerts } from '@/hooks/useAdvisory'
import { useActiveGoals } from '@/hooks/useGoals'
import { useAlignments, useOverallScore } from '@/hooks/useIntelligence'
import { useAllHabitLogs } from '@/hooks/useHabits'
import { useAppStore } from '@/stores/appStore'
import { calcStreak } from '@/lib/streaks'
import { Sparkles, Target, Repeat2, BookOpen, TrendingUp, Zap, Flame, CheckCircle2, Sun, Moon, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

const SEASON_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  expansion: 'Expansion',
  domination: 'Domination',
  exploration: 'Exploration',
  recovery: 'Recovery',
  reinvention: 'Reinvention',
}

export function HubPage() {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const habits = useActiveHabits()
  const todayLogs = useTodayLogs()
  const allLogs = useAllHabitLogs()
  const amDone = useTodayReflection('daily-am')
  const pmDone = useTodayReflection('daily-pm')
  const activeAlerts = useActiveAlerts()
  const activeGoals = useActiveGoals()
  const alignments = useAlignments()
  const overallScore = useOverallScore()
  const { currentSeason } = useAppStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const completedToday = todayLogs.filter(l => l.completed).length

  // Top 3 streaks
  const streaks = habits
    .map(h => ({ habit: h, streak: calcStreak(h.id, allLogs) }))
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)

  // Top 3 alerts
  const topAlerts = activeAlerts.slice(0, 3)

  // No identity — show setup prompt
  if (!identity) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[#606080] text-sm">{greeting}</p>
          <h1 className="text-2xl font-bold text-[#e8e8f0] mt-0.5">Your Operating System</h1>
          <p className="text-[#606080] text-xs mt-1">Identity · Execution · Intelligence · Advisory</p>
        </div>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Get Started</p>
          <p className="text-sm text-[#c0c0e0]">
            Begin by declaring your identity — who you are, who you want to become, and what standards you hold yourself to.
          </p>
          <Link to="/identity">
            <button className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Declare your identity →
            </button>
          </Link>
        </Card>

        <Card className="border-violet-500/20 bg-violet-500/5">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Core Philosophy</p>
          <p className="text-sm text-[#c0c0e0] leading-relaxed">
            Most apps optimize <span className="text-[#e8e8f0] font-medium">convenience</span>.
            This optimizes <span className="text-violet-400 font-semibold">character</span>.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with score */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#606080] text-sm">{greeting}</p>
          <h1 className="text-2xl font-bold text-[#e8e8f0] mt-0.5">Command Centre</h1>
          <p className="text-[#606080] text-xs mt-1">
            {SEASON_LABELS[currentSeason]} Season · {pillars.length} pillar{pillars.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mini alignment donut */}
        {alignments.length > 0 && (
          <Link to="/intelligence" className="flex-shrink-0">
            <PillarDonut alignments={alignments} overallScore={overallScore} />
          </Link>
        )}
      </div>

      {/* Today's Focus */}
      <Card>
        <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider mb-3">Today's Focus</p>
        <div className="grid grid-cols-3 gap-3">
          {/* Habits progress */}
          <Link to="/habits" className="text-center">
            <div className={clsx(
              'rounded-xl p-2 mx-auto w-10 h-10 flex items-center justify-center mb-1',
              completedToday === habits.length && habits.length > 0
                ? 'bg-emerald-500/20'
                : 'bg-[#1e1e35]',
            )}>
              <Repeat2 size={16} className={completedToday === habits.length && habits.length > 0 ? 'text-emerald-400' : 'text-[#606080]'} />
            </div>
            <p className="text-sm font-bold text-[#e8e8f0]">{completedToday}/{habits.length}</p>
            <p className="text-[10px] text-[#606080]">Habits</p>
          </Link>

          {/* AM Reflection */}
          <Link to="/reflect" className="text-center">
            <div className={clsx(
              'rounded-xl p-2 mx-auto w-10 h-10 flex items-center justify-center mb-1',
              amDone ? 'bg-amber-500/20' : 'bg-[#1e1e35]',
            )}>
              {amDone
                ? <CheckCircle2 size={16} className="text-amber-400" />
                : <Sun size={16} className="text-[#606080]" />
              }
            </div>
            <p className="text-sm font-bold text-[#e8e8f0]">{amDone ? 'Done' : '—'}</p>
            <p className="text-[10px] text-[#606080]">Morning</p>
          </Link>

          {/* PM Reflection */}
          <Link to="/reflect" className="text-center">
            <div className={clsx(
              'rounded-xl p-2 mx-auto w-10 h-10 flex items-center justify-center mb-1',
              pmDone ? 'bg-violet-500/20' : 'bg-[#1e1e35]',
            )}>
              {pmDone
                ? <CheckCircle2 size={16} className="text-violet-400" />
                : <Moon size={16} className="text-[#606080]" />
              }
            </div>
            <p className="text-sm font-bold text-[#e8e8f0]">{pmDone ? 'Done' : '—'}</p>
            <p className="text-[10px] text-[#606080]">Evening</p>
          </Link>
        </div>
      </Card>

      {/* Active Challenges */}
      {topAlerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider">Active Challenges</p>
            <Link to="/advisory" className="text-[10px] text-violet-400">{activeAlerts.length} total →</Link>
          </div>
          <div className="space-y-2">
            {topAlerts.map(alert => (
              <Link key={alert.id} to="/advisory">
                <Card className="!p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={12} className={
                      alert.severity === 'challenge' ? 'text-red-400'
                      : alert.severity === 'warning' ? 'text-amber-400'
                      : alert.severity === 'opportunity' ? 'text-blue-400'
                      : 'text-violet-400'
                    } />
                    <p className="text-xs font-medium text-[#e8e8f0] truncate flex-1">{alert.title}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Streak Leaders */}
      {streaks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider mb-2">Streak Leaders</p>
          <Card>
            <div className="space-y-2">
              {streaks.map(({ habit, streak }) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: habit.color }} />
                  <p className="text-xs text-[#e8e8f0] flex-1 truncate">{habit.title}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Flame size={12} />
                    <span className="text-xs font-bold">{streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/identity" label="Identity" icon={Zap} color="#7c3aed" badge={pillars.length > 0 ? `${pillars.length}` : undefined} />
          <QuickAction to="/goals" label="Goals" icon={Target} color="#2563eb" badge={activeGoals.length > 0 ? `${activeGoals.length}` : undefined} />
          <QuickAction to="/habits" label="Habits" icon={Repeat2} color="#059669" badge={habits.length > 0 ? `${completedToday}/${habits.length}` : undefined} />
          <QuickAction to="/reflect" label="Reflect" icon={BookOpen} color="#d97706" />
          <QuickAction to="/advisory" label="Advisory" icon={Sparkles} color="#dc2626" badge={activeAlerts.length > 0 ? `${activeAlerts.length}` : undefined} />
          <QuickAction to="/intelligence" label="Intel" icon={TrendingUp} color="#0891b2" badge={alignments.length > 0 ? `${overallScore}%` : undefined} />
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, label, icon: Icon, color, badge }: {
  to: string
  label: string
  icon: typeof Zap
  color: string
  badge?: string
}) {
  return (
    <Link to={to}>
      <Card className="h-full hover:border-[#4d4d7e] transition-colors">
        <div className="flex items-start gap-3">
          <div className="rounded-xl p-2 flex-shrink-0" style={{ background: `${color}20` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e8e8f0]">{label}</p>
            {badge && <p className="text-[10px] text-[#606080] mt-0.5">{badge}</p>}
          </div>
        </div>
      </Card>
    </Link>
  )
}
