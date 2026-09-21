import { useId, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, id, className, ...inputProps }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className={`group inline-flex cursor-pointer items-center gap-2.5 ${className ?? ''}`}>
      <span className="relative flex size-5 shrink-0">
        <input id={inputId} type="checkbox" className="peer sr-only" {...inputProps} />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-md border border-bone-300 bg-white/80 transition-colors duration-200 group-hover:border-forest-600/50 peer-checked:border-forest-800 peer-checked:bg-forest-800 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest-600"
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none relative m-auto size-3 scale-50 text-bone-50 opacity-0 transition duration-150 peer-checked:scale-100 peer-checked:opacity-100"
        />
      </span>
      <span className="text-sm text-ink-soft select-none">{label}</span>
    </label>
  )
}
