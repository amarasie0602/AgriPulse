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
}

export function TextField({
  label,
  error,
  hint,
  optional,
  leftIcon: LeftIcon,
  trailing,
  id,
  className,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
        <span>{label}</span>
        {optional && <span className="text-xs font-medium text-ink-soft">Optional</span>}
      </label>

      <div className="group relative">
        {LeftIcon && (
          <LeftIcon
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1/2 left-3.5 size-[1.15rem] -translate-y-1/2 transition-colors duration-200',
              error ? 'text-clay-600' : 'text-ink-soft group-focus-within:text-forest-700',
            )}
          />
        )}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-xl border bg-white/70 text-[0.95rem] text-ink shadow-[0_1px_2px_rgb(12_42_32/0.04)]',
            'placeholder:text-ink-soft/55 transition-[border-color,box-shadow,background-color] duration-200',
            'hover:bg-white focus:bg-white focus:outline-none',
            LeftIcon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-clay-500/70 focus:border-clay-600 focus:ring-4 focus:ring-clay-500/15'
              : 'border-bone-300 hover:border-forest-600/30 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12',
          )}
          {...inputProps}
        />

        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}

      <div aria-live="polite">
        {error && (
          <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-[0.8rem] font-medium text-danger-text">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
