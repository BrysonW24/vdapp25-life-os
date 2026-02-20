import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'
import type { Standard } from '@/types'
import { addStandard, deleteStandard } from '@/hooks/useIdentity'

interface StandardEditorProps {
  pillarId: number
  standards: Standard[]
}

export function StandardEditor({ pillarId, standards }: StandardEditorProps) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')

  async function handleAdd() {
    if (!label.trim() || !target) return
    const metric = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    await addStandard({
      pillarId,
      label: label.trim(),
      metric,
      target: Number(target),
      unit: unit.trim() || 'per week',
    })
    setLabel('')
    setTarget('')
    setUnit('')
    setAdding(false)
  }

  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold text-[#606080] uppercase tracking-wider mb-2">Standards</p>

      {standards.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {standards.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-xs bg-[#0f0f1a] rounded-lg px-3 py-2">
              <span className="text-[#e8e8f0] flex-1">{s.label}</span>
              <span className="text-[#606080]">{s.target} {s.unit}</span>
              <button
                onClick={() => deleteStandard(s.id)}
                className="text-[#404060] hover:text-red-400 transition-colors ml-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="space-y-2 bg-[#0f0f1a] rounded-xl p-3">
          <Input
            placeholder="e.g. 4 workouts per week"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Target (e.g. 4)"
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
            <Input
              placeholder="Unit (e.g. per week)"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAdding(false)} className="flex-1">Cancel</Button>
            <Button size="sm" onClick={handleAdd} className="flex-1" disabled={!label.trim() || !target}>Add</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[#606080] hover:text-violet-400 transition-colors"
        >
          <Plus size={12} /> Add standard
        </button>
      )}
    </div>
  )
}
