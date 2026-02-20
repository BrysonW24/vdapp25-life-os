import { Modal } from '@/components/ui/Modal'
import { useAppStore } from '@/stores/appStore'
import { clsx } from 'clsx'
import type { LifeSeason } from '@/types'

const SEASONS: Array<{ value: LifeSeason; label: string; desc: string; color: string }> = [
  { value: 'foundation',   label: 'Foundation',   desc: 'Building habits, stabilizing pillars',          color: '#059669' },
  { value: 'expansion',    label: 'Expansion',    desc: 'Growing capacity, new challenges',              color: '#2563eb' },
  { value: 'domination',   label: 'Domination',   desc: 'Peak output, aggressive standards',             color: '#dc2626' },
  { value: 'exploration',  label: 'Exploration',  desc: 'Experimenting, traveling, new paths',           color: '#d97706' },
  { value: 'recovery',     label: 'Recovery',     desc: 'Rest, repair, reset after intensity',           color: '#7c3aed' },
  { value: 'reinvention',  label: 'Reinvention',  desc: 'Major life pivot, redefining identity',         color: '#0891b2' },
]

interface SeasonSelectorProps {
  open: boolean
  onClose: () => void
}

export function SeasonSelector({ open, onClose }: SeasonSelectorProps) {
  const { currentSeason, setSeason } = useAppStore()

  function handleSelect(season: LifeSeason) {
    setSeason(season)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Select Your Season">
      <p className="text-xs text-[#606080] mb-4">
        Your season shapes coaching intensity and expectations. Be honest about where you are.
      </p>
      <div className="space-y-2">
        {SEASONS.map(s => (
          <button
            key={s.value}
            onClick={() => handleSelect(s.value)}
            className={clsx(
              'w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-left',
              currentSeason === s.value
                ? 'border-violet-500/50 bg-violet-500/5'
                : 'border-[#2d2d4e] hover:border-violet-500/30',
            )}
          >
            <div
              className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
              style={{ background: currentSeason === s.value ? s.color : '#2d2d4e' }}
            />
            <div>
              <p className="text-sm font-medium text-[#e8e8f0]">{s.label}</p>
              <p className="text-xs text-[#606080]">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
