import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all',
        {
          'bg-violet-600 hover:bg-violet-500 text-white': variant === 'primary',
          'bg-[#1e1e35] hover:bg-[#2d2d4e] text-[#e8e8f0] border border-[#2d2d4e]': variant === 'secondary',
          'text-[#a0a0c0] hover:text-[#e8e8f0] hover:bg-[#1e1e35]': variant === 'ghost',
          'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20': variant === 'danger',
        },
        {
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className,
      )}
    >
      {children}
    </button>
  )
}
