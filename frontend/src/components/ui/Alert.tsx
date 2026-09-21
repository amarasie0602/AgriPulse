import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'error' | 'success' | 'info'

interface AlertProps {
  tone: Tone
  children: ReactNode
  className?: string
}

const tones = {
  error: {
    styles: 'border-danger-border bg-danger-bg text-danger-text',
    Icon: CircleAlert,
  },
  success: {
    styles: 'border-moss-300 bg-moss-200/50 text-forest-800',
    Icon: CircleCheck,
  },
  info: {
    styles: 'border-wheat-300/70 bg-wheat-300/20 text-forest-900',
    Icon: Info,
  },
} satisfies Record<Tone, { styles: string; Icon: typeof Info }>

export function Alert({ tone, children, className }: AlertProps) {
  const { styles, Icon } = tones[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex animate-fade-in items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-snug',
        styles,
        className,
      )}
    >
      <Icon className="mt-px size-4.5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
