import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { TextField, type TextFieldProps } from '@/components/ui/TextField'
import { cn } from '@/utils/cn'

type PasswordInputProps = Omit<TextFieldProps, 'type' | 'leftIcon' | 'trailing' | 'label'> & {
  label?: string
}

/** Password field with a lock icon and an accessible show/hide toggle. */
export function PasswordInput({ label = 'Password', tone = 'light', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const ToggleIcon = visible ? EyeOff : Eye
  const dark = tone === 'dark'

  return (
    <TextField
      {...props}
      label={label}
      tone={tone}
      type={visible ? 'text' : 'password'}
      leftIcon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label="Show password"
          aria-pressed={visible}
          className={cn(
            'grid size-9 place-items-center rounded-lg transition-colors',
            dark ? 'text-moss-300/80 hover:bg-white/10 hover:text-wheat-300' : 'text-ink-soft hover:bg-forest-900/5 hover:text-forest-800',
          )}
        >
          <ToggleIcon className="size-[1.1rem]" aria-hidden="true" />
        </button>
      }
    />
  )
}
