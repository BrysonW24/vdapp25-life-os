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
        'rounded-xl bg-[#16162a] border border-[#2d2d4e] p-4',
        onClick && 'cursor-pointer hover:border-violet-500/30 transition-colors duration-200',
        className,
      )}
    >
      {children}
    </div>
  )
}
