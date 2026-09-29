import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  /** `dark` is for glass panels over a dark background. */
  tone?: 'light' | 'dark'
  children: ReactNode
}

export function Select({ label, error, tone = 'light', id, className, children, ...selectProps }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const dark = tone === 'dark'

  return (
    <div className={className}>
      <label htmlFor={selectId} className={cn('mb-1.5 block text-sm font-semibold', dark && 'text-bone-100')}>
        {label}
      </label>

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-[0.95rem] transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none',
            dark
              ? cn(
                  'bg-white/[0.06] text-bone-50 backdrop-blur-sm hover:bg-white/[0.09] focus:bg-white/[0.09]',
                  error
                    ? 'border-rose-400/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-400/15'
                    : 'border-white/15 hover:border-white/25 focus:border-wheat-300/70 focus:ring-4 focus:ring-wheat-300/15',
                )
              : cn(
                  'bg-white/70 text-ink shadow-[0_1px_2px_rgb(12_42_32/0.04)] hover:bg-white focus:bg-white',
                  error
                    ? 'border-clay-500/70 focus:border-clay-600 focus:ring-4 focus:ring-clay-500/15'
                    : 'border-bone-300 hover:border-forest-600/30 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12',
                ),
          )}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2',
            dark ? 'text-moss-300/70' : 'text-ink-soft',
          )}
        />
      </div>

      {error && (
        <p className={cn('mt-1.5 text-[0.8rem] font-medium', dark ? 'text-rose-300' : 'text-danger-text')}>{error}</p>
      )}
    </div>
  )
}
