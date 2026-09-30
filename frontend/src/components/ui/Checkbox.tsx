import { useId, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  /** `dark` is for glass panels over a dark background (e.g. the login console). */
  tone?: 'light' | 'dark'
}

export function Checkbox({ label, tone = 'light', id, className, ...inputProps }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const dark = tone === 'dark'

  return (
    <label htmlFor={inputId} className={cn('group inline-flex cursor-pointer items-center gap-2.5', className)}>
      <span className="relative flex size-5 shrink-0">
        <input id={inputId} type="checkbox" className="peer sr-only" {...inputProps} />
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-md border transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
            dark
              ? 'border-white/25 bg-white/[0.06] peer-checked:border-wheat-300 peer-checked:bg-wheat-300 peer-focus-visible:outline-wheat-300'
              : 'border-bone-300 bg-white/80 group-hover:border-forest-600/50 peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-focus-visible:outline-forest-600',
          )}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className={cn(
            'pointer-events-none relative m-auto size-3 scale-50 opacity-0 transition duration-150 peer-checked:scale-100 peer-checked:opacity-100',
            dark ? 'text-forest-950' : 'text-bone-50',
          )}
        />
      </span>
      <span className={cn('text-sm select-none', dark ? 'text-bone-100/80' : 'text-ink-soft')}>{label}</span>
    </label>
  )
}
