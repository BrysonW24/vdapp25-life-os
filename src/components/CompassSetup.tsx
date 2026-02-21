import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useAppStore } from '@/stores/appStore'
import { usePillars, useIdentity } from '@/hooks/useIdentity'
import type { CompassMapping } from '@/types'

const AXES: Array<{ axis: 'B' | 'E' | 'S' | 'W'; defaultLabel: string; keywords: string[] }> = [
  { axis: 'B', defaultLabel: 'Builder', keywords: ['work', 'career', 'creation', 'business', 'build', 'craft'] },
  { axis: 'E', defaultLabel: 'Energy', keywords: ['health', 'fitness', 'energy', 'body', 'spirit', 'mind', 'mental'] },
  { axis: 'S', defaultLabel: 'Social', keywords: ['family', 'social', 'relationship', 'community', 'network', 'people', 'love'] },
  { axis: 'W', defaultLabel: 'Wealth', keywords: ['wealth', 'finance', 'money', 'capital', 'freedom', 'income', 'invest'] },
]

function autoMatch(pillarName: string, keywords: string[]): boolean {
  const lower = pillarName.toLowerCase()
  return keywords.some(k => lower.includes(k))
}

interface CompassSetupProps {
  open: boolean
  onClose: () => void
}

export function CompassSetup({ open, onClose }: CompassSetupProps) {
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const { compassMappings, setCompassMappings } = useAppStore()

  const [mappings, setMappings] = useState<CompassMapping[]>([])

  useEffect(() => {
    if (!open) return

    if (compassMappings.length === 4) {
      setMappings(compassMappings)
      return
    }

    const defaults: CompassMapping[] = AXES.map(({ axis, defaultLabel, keywords }) => {
      const matched = pillars
        .filter(p => autoMatch(p.name, keywords))
        .map(p => p.id)
      return { axis, label: defaultLabel, pillarIds: matched }
    })

    const assigned = new Set(defaults.flatMap(d => d.pillarIds))
    const unmatched = pillars.filter(p => !assigned.has(p.id))
    unmatched.forEach(p => {
      const smallest = defaults.reduce((min, d) =>
        d.pillarIds.length < min.pillarIds.length ? d : min
      )
      smallest.pillarIds.push(p.id)
    })

    setMappings(defaults)
  }, [open, pillars, compassMappings])

  const updateLabel = (axis: string, label: string) => {
    setMappings(prev => prev.map(m => m.axis === axis ? { ...m, label } : m))
  }

  const togglePillar = (axis: string, pillarId: number) => {
    setMappings(prev => prev.map(m => {
      if (m.axis !== axis) {
        return { ...m, pillarIds: m.pillarIds.filter(id => id !== pillarId) }
      }
      const has = m.pillarIds.includes(pillarId)
      return {
        ...m,
        pillarIds: has
          ? m.pillarIds.filter(id => id !== pillarId)
          : [...m.pillarIds, pillarId],
      }
    }))
  }

  const handleSave = () => {
    setCompassMappings(mappings)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Configure Compass">
      <div className="space-y-5">
        <p className="text-xs text-[#606080]" style={{ fontFamily: 'var(--font-mono)' }}>
          Map pillars to B.E.S.W. axes.
        </p>

        {mappings.map(m => (
          <div key={m.axis} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold w-5 text-violet-500" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{m.axis}</span>
              <Input
                value={m.label}
                onChange={e => updateLabel(m.axis, e.target.value)}
                className="flex-1"
                placeholder={`Label for ${m.axis}`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pl-7">
              {pillars.map(p => {
                const active = m.pillarIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePillar(m.axis, p.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors duration-200 ${
                      active
                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                        : 'border-[#2d2d4e] bg-[#0f0f1a] text-[#606080] hover:text-[#808090]'
                    }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">Apply</Button>
        </div>
      </div>
    </Modal>
  )
}
