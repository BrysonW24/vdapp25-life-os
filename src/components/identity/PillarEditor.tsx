import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Pillar } from '@/types'

const PILLAR_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#db2777', '#4f46e5',
]

interface PillarEditorProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; color: string }) => void
  initial?: Pillar
}

export function PillarEditor({ open, onClose, onSave, initial }: PillarEditorProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? PILLAR_COLORS[0])

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), color })
    setName('')
    setDescription('')
    setColor(PILLAR_COLORS[0])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Pillar' : 'Add Pillar'}>
      <div className="space-y-4">
        <Input
          label="Pillar Name"
          placeholder="e.g. Health, Finance, Learning"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div>
          <label className="block text-xs text-[#808090] mb-1.5">Description</label>
          <textarea
            rows={2}
            placeholder="What does this pillar represent in your life?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#808090] mb-2">Color</label>
          <div className="flex gap-2">
            {PILLAR_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                  opacity: color === c ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} className="flex-1" disabled={!name.trim()}>
            {initial ? 'Update' : 'Add Pillar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
