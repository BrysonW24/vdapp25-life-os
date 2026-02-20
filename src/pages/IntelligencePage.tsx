import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IntelligenceSpider } from '@/components/visualizations/IntelligenceSpider'
import { useAlignments, useOverallScore } from '@/hooks/useIntelligence'
import { Brain, TrendingUp, TrendingDown, Minus, Compass } from 'lucide-react'
import { clsx } from 'clsx'
import type { AlignmentState } from '@/types'

const ALIGNMENT_CONFIG: Record<AlignmentState, { label: string; color: string; icon: typeof TrendingUp }> = {
  aligned:    { label: 'Aligned',    color: '#059669', icon: TrendingUp },
  improving:  { label: 'Improving',  color: '#2563eb', icon: TrendingUp },
  drifting:   { label: 'Drifting',   color: '#d97706', icon: Minus },
  avoiding:   { label: 'Avoiding',   color: '#dc2626', icon: TrendingDown },
  regressing: { label: 'Regressing', color: '#dc2626', icon: TrendingDown },
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

export function IntelligencePage() {
  const alignments = useAlignments()
  const overallScore = useOverallScore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#e8e8f0]">Intelligence</h1>
        <p className="text-[#606080] text-sm mt-1">Gap analysis — declared vs observed</p>
      </div>

      {alignments.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No pillars defined"
          description="Declare your identity and add pillars with standards to see your alignment scores"
          actionLabel="Go to Identity"
        />
      ) : (
        <>
          {/* Overall alignment spider */}
          <Card>
            <p className="text-xs font-semibold text-[#606080] uppercase tracking-wider mb-3">Overall Alignment</p>
            {alignments.length >= 2 ? (
              <>
                <IntelligenceSpider alignments={alignments} overallScore={overallScore} />
                <p className="text-xs text-[#606080] text-center mt-2">
                  {overallScore >= 70 ? 'Largely aligned' : overallScore >= 50 ? 'Drifting in key areas' : 'Significant gaps detected'}
                  {' '}— {alignments.length} pillar{alignments.length !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-[#404060] text-center py-4">Add 2+ pillars to see the alignment spider</p>
            )}
          </Card>

          {/* Pillar breakdown */}
          <div className="space-y-3">
            {alignments.map(pillar => {
              const { label, color } = ALIGNMENT_CONFIG[pillar.alignmentState]
              const TrendIcon = TREND_ICON[pillar.trend]

              return (
                <Card key={pillar.pillarId}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pillar.pillarColor }} />
                        <p className="text-sm font-semibold text-[#e8e8f0]">{pillar.pillarName}</p>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}20`, color }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Standards breakdown */}
                      {pillar.standards.length > 0 ? (
                        <div className="space-y-1 mt-2">
                          {pillar.standards.map(sa => (
                            <div key={sa.standard.id} className="flex items-center gap-3 text-xs">
                              <span className="text-[#606080] flex-1 truncate">{sa.standard.label}</span>
                              <span className="text-[#a0a0c0] tabular-nums">{sa.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#404060] mt-1">
                          {pillar.habitCount > 0
                            ? `${pillar.completedHabitCount}/${pillar.habitCount} habits today`
                            : 'No standards or habits linked'}
                        </p>
                      )}

                      <div className="mt-2 h-1.5 rounded-full bg-[#1e1e35] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pillar.score}%`, background: color }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color }}>{pillar.score}</span>
                      <TrendIcon
                        size={12}
                        className={clsx(
                          pillar.trend === 'up' && 'text-emerald-400',
                          pillar.trend === 'down' && 'text-red-400',
                          pillar.trend === 'flat' && 'text-[#606080]',
                        )}
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Gap engine explainer */}
      <Card className="border-[#1e1e35]">
        <div className="flex items-start gap-3">
          <Brain size={16} className="text-[#404060] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#606080] mb-1">About the Gap Engine</p>
            <p className="text-xs text-[#404060] leading-relaxed">
              The Gap Engine compares your declared standards against observed habit data over the last 4 weeks.
              Classification: Aligned ({'\u2265'}80) → Improving ({'\u2265'}60 + trending up) → Drifting ({'\u2265'}40) → Avoiding → Regressing ({'<'}40 + down).
              As you log habits and reflections, scores update in real time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
