import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <Icon size={32} className="text-[#2d2d4e] mx-auto mb-3" />
      <p className="text-sm font-medium text-[#606080]">{title}</p>
      <p className="text-xs text-[#404060] mt-1 max-w-xs mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  )
}
