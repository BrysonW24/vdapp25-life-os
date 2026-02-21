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
      <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4">
        <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Structural Integrity
        </p>
        <p className="text-xs text-[#606080] mt-2">Declare pillars to activate.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] p-4" style={{ borderTop: `2px solid ${CHART_COLORS.brand}` }}>
      <p className="text-[10px] font-medium tracking-[0.15em] text-[#606080] uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
        Structural Integrity
      </p>
      <div className="space-y-2">
        {alignments.map(a => {
          const color = getStateColor(a.alignmentState)
          return (
            <div key={a.pillarId} className="flex items-center gap-3">
              <span className="text-[10px] w-16 truncate flex-shrink-0 text-[#808090]" style={{ fontFamily: 'var(--font-mono)' }}>
                {a.pillarName}
              </span>
              <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: CHART_COLORS.surfaceLight }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${a.score}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
              <span className="text-[11px] font-bold w-7 text-right flex-shrink-0 text-[#e8e8f0]" style={{ fontFamily: 'var(--font-mono)' }}>
                {a.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
