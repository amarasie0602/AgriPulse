import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { TextField, type TextFieldProps } from '@/components/ui/TextField'

type PasswordInputProps = Omit<TextFieldProps, 'type' | 'leftIcon' | 'trailing' | 'label'> & {
  label?: string
}

/** Password field with a lock icon and an accessible show/hide toggle. */
export function PasswordInput({ label = 'Password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const ToggleIcon = visible ? EyeOff : Eye

  return (
    <TextField
      {...props}
      label={label}
      type={visible ? 'text' : 'password'}
      leftIcon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label="Show password"
          aria-pressed={visible}
          className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-forest-900/5 hover:text-forest-800"
        >
          <ToggleIcon className="size-[1.1rem]" aria-hidden="true" />
        </button>
      }
    />
  )
}
