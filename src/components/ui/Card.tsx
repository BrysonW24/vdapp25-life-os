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
        'rounded-sm bg-[#141414] border border-[#252525] p-4',
        onClick && 'cursor-pointer hover:border-[#4A4640] transition-colors duration-200',
        className,
      )}
    >
      {children}
    </div>
  )
}
