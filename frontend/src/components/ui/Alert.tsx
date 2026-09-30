import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'error' | 'success' | 'info'

interface AlertProps {
  tone: Tone
  children: ReactNode
  className?: string
  /** `dark` is for glass panels over a dark background (e.g. the login console). */
  surface?: 'light' | 'dark'
}

const lightStyles: Record<Tone, string> = {
  error: 'border-danger-border bg-danger-bg text-danger-text',
  success: 'border-moss-300 bg-moss-200/50 text-forest-800',
  info: 'border-wheat-300/70 bg-wheat-300/20 text-forest-900',
}

const darkStyles: Record<Tone, string> = {
  error: 'border-rose-400/30 bg-rose-950/30 text-rose-200',
  success: 'border-moss-400/30 bg-moss-400/10 text-moss-200',
  info: 'border-wheat-300/30 bg-wheat-300/10 text-wheat-200',
}

const icons: Record<Tone, typeof Info> = { error: CircleAlert, success: CircleCheck, info: Info }

export function Alert({ tone, children, className, surface = 'light' }: AlertProps) {
  const Icon = icons[tone]
  const styles = surface === 'dark' ? darkStyles[tone] : lightStyles[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex animate-fade-in items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-snug backdrop-blur-sm',
        styles,
        className,
      )}
    >
      <Icon className="mt-px size-4.5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
