import { useAlignments } from '@/hooks/useIntelligence'
import { CHART_COLORS } from './theme'

function getStateColor(state: string): string {
  switch (state) {
    case 'aligned': return CHART_COLORS.aligned
    case 'improving': return CHART_COLORS.improving
    case 'drifting': return CHART_COLORS.drifting
    case 'avoiding':
    case 'regressing': return CHART_COLORS.avoiding
    default: return CHART_COLORS.textMuted
  }
}

export function StructuralIntegrity() {
  const alignments = useAlignments()

  if (alignments.length === 0) {
    return (
      <div className="border border-[#252525] bg-[#141414] p-4 rounded-sm">
        <p className="text-[9px] font-medium tracking-[0.15em] text-[#4A4640] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Structural Integrity
        </p>
        <p className="text-xs mt-2" style={{ color: CHART_COLORS.textMuted }}>Declare pillars to activate.</p>
      </div>
    )
  }

  return (
    <div className="border border-[#252525] bg-[#141414] p-4 rounded-sm" style={{ borderTop: `1px solid ${CHART_COLORS.brand}` }}>
      <p className="text-[9px] font-medium tracking-[0.15em] text-[#4A4640] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Structural Integrity
      </p>
      <div className="space-y-[3px]">
        {alignments.map(a => {
          const color = getStateColor(a.alignmentState)
          return (
            <div key={a.pillarId} className="flex items-center gap-3">
              <span className="text-[9px] w-16 truncate flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textSecondary }}>
                {a.pillarName}
              </span>
              <div className="flex-1 h-[4px] rounded-none" style={{ background: CHART_COLORS.surfaceLight }}>
                <div
                  className="h-full rounded-none transition-all duration-500"
                  style={{ width: `${a.score}%`, background: color, opacity: 0.85 }}
                />
              </div>
              <span className="text-[10px] font-bold w-6 text-right flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: CHART_COLORS.textPrimary }}>
                {a.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
