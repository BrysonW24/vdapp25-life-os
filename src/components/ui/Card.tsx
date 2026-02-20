import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl bg-[#16162a] border border-[#2d2d4e] p-4',
        onClick && 'cursor-pointer hover:border-[#4d4d7e] transition-colors',
        className,
      )}
    >
      {children}
    </div>
  )
}
