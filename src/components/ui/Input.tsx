import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-xs text-[#808090] mb-1.5">{label}</label>}
      <input
        {...props}
        className={clsx(
          'w-full rounded-xl border bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors',
          error ? 'border-red-500/50' : 'border-[#2d2d4e]',
          className,
        )}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

export function Textarea({ label, hint, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="block text-xs text-[#808090] mb-1.5">{label}</label>}
      {hint && <p className="text-xs text-[#404060] mb-1.5">{hint}</p>}
      <textarea
        {...props}
        className={clsx(
          'w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none',
          className,
        )}
      />
    </div>
  )
}
