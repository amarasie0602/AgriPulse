import { useId, useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ChipInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  hint?: string
  disabled?: boolean
  /** `dark` is for glass panels over a dark background. */
  tone?: 'light' | 'dark'
  maxItems?: number
}

/** A labelled list of short tags (e.g. crop types) backed by a single text input. */
export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  hint,
  disabled,
  tone = 'light',
  maxItems = 12,
}: ChipInputProps) {
  const [draft, setDraft] = useState('')
  const inputId = useId()
  const dark = tone === 'dark'

  function commitDraft() {
    const value = draft.trim()
    setDraft('')
    if (!value || values.length >= maxItems || values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      return
    }
    onChange([...values, value])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label htmlFor={inputId} className={cn('mb-1.5 block text-sm font-semibold', dark && 'text-bone-100')}>
        {label}
      </label>

      <div
        className={cn(
          'flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border px-2.5 py-2 transition-colors focus-within:outline-none',
          dark
            ? 'border-white/15 bg-white/[0.06] focus-within:border-wheat-300/70 focus-within:ring-4 focus-within:ring-wheat-300/15'
            : 'border-bone-300 bg-white/70 focus-within:border-forest-600 focus-within:ring-4 focus-within:ring-forest-600/12',
        )}
      >
        {values.map((value, index) => (
          <span
            key={value}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium',
              dark ? 'bg-white/10 text-bone-50' : 'bg-forest-900/8 text-forest-900',
            )}
          >
            {value}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${value}`}
                className={cn('rounded-full p-0.5', dark ? 'hover:bg-white/15' : 'hover:bg-forest-900/10')}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
          </span>
        ))}

        {values.length < maxItems && !disabled && (
          <input
            id={inputId}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitDraft}
            placeholder={values.length === 0 ? placeholder : undefined}
            className={cn(
              'min-w-[8rem] flex-1 bg-transparent text-[0.95rem] outline-none',
              dark ? 'text-bone-50 placeholder:text-bone-100/35' : 'text-ink placeholder:text-ink-soft/55',
            )}
          />
        )}

        {!disabled && draft && (
          <button
            type="button"
            onClick={commitDraft}
            aria-label="Add"
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full',
              dark ? 'bg-wheat-300 text-forest-950' : 'bg-forest-900 text-bone-50',
            )}
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {hint && <p className={cn('mt-1.5 text-xs', dark ? 'text-moss-300/80' : 'text-ink-soft')}>{hint}</p>}
    </div>
  )
}
