import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { CircleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  /** Marks the field as optional in the label. */
  optional?: boolean
  leftIcon?: LucideIcon
  /** Interactive element rendered inside the right edge (e.g. a show/hide toggle). */
  trailing?: ReactNode
  /** `dark` is for glass panels over a dark background (e.g. the login console). */
  tone?: 'light' | 'dark'
}

export function TextField({
  label,
  error,
  hint,
  optional,
  leftIcon: LeftIcon,
  trailing,
  tone = 'light',
  id,
  className,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const dark = tone === 'dark'

  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={cn(
          'mb-1.5 flex items-baseline justify-between text-sm font-semibold',
          dark && 'text-bone-100',
        )}
      >
        <span>{label}</span>
        {optional && (
          <span className={cn('text-xs font-medium', dark ? 'text-moss-300/80' : 'text-ink-soft')}>Optional</span>
        )}
      </label>

      <div className="group relative">
        {LeftIcon && (
          <LeftIcon
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1/2 left-3.5 size-[1.15rem] -translate-y-1/2 transition-colors duration-200',
              error
                ? dark
                  ? 'text-rose-300'
                  : 'text-clay-600'
                : dark
                  ? 'text-moss-300/70 group-focus-within:text-wheat-300'
                  : 'text-ink-soft group-focus-within:text-forest-700',
            )}
          />
        )}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-xl border text-[0.95rem] transition-[border-color,box-shadow,background-color] duration-200',
            'focus:outline-none',
            LeftIcon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            dark
              ? cn(
                  'bg-white/[0.06] text-bone-50 placeholder:text-bone-100/35 backdrop-blur-sm',
                  'hover:bg-white/[0.09] focus:bg-white/[0.09]',
                  error
                    ? 'border-rose-400/50 focus:border-rose-300 focus:ring-4 focus:ring-rose-400/15'
                    : 'border-white/15 hover:border-white/25 focus:border-wheat-300/70 focus:ring-4 focus:ring-wheat-300/15',
                )
              : cn(
                  'bg-white/70 text-ink shadow-[0_1px_2px_rgb(12_42_32/0.04)] placeholder:text-ink-soft/55',
                  'hover:bg-white focus:bg-white',
                  error
                    ? 'border-clay-500/70 focus:border-clay-600 focus:ring-4 focus:ring-clay-500/15'
                    : 'border-bone-300 hover:border-forest-600/30 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12',
                ),
          )}
          {...inputProps}
        />

        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>

      {hint && !error && (
        <p id={hintId} className={cn('mt-1.5 text-xs', dark ? 'text-moss-300/80' : 'text-ink-soft')}>
          {hint}
        </p>
      )}

      <div aria-live="polite">
        {error && (
          <p
            id={errorId}
            className={cn(
              'mt-1.5 flex items-start gap-1.5 text-[0.8rem] font-medium',
              dark ? 'text-rose-300' : 'text-danger-text',
            )}
          >
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
