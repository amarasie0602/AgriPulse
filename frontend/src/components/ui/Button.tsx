import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline-dark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  /** Replaces the label while `loading` is true. */
  loadingText?: string
  fullWidth?: boolean
  leftIcon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forest-900 text-bone-50 shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_10px_24px_-10px_rgb(12_42_32/0.7)] ' +
    'hover:bg-forest-800 active:bg-forest-950 disabled:bg-forest-900/60',
  secondary:
    'border border-bone-300 bg-bone-50/70 text-ink hover:border-forest-600/40 hover:bg-white ' +
    'disabled:text-ink-soft/70 disabled:hover:border-bone-300 disabled:hover:bg-bone-50/70',
  ghost: 'text-forest-700 hover:bg-forest-900/5',
  // Warm gold CTA for dark surfaces (e.g. the login console) — matches the platform's gold accent.
  gold:
    'bg-linear-to-b from-wheat-300 to-wheat-500 text-forest-950 shadow-[0_1px_0_rgb(255_255_255/0.4)_inset,0_10px_28px_-10px_rgb(201_154_75/0.65)] ' +
    'hover:brightness-105 active:brightness-95 disabled:opacity-60',
  // Secondary action on a dark surface.
  'outline-dark':
    'border border-white/15 bg-white/[0.06] text-bone-50 backdrop-blur-sm hover:border-white/25 hover:bg-white/[0.1] ' +
    'disabled:text-bone-100/50 disabled:hover:border-white/15 disabled:hover:bg-white/[0.06]',
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  className,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2.5 rounded-xl px-5 text-[0.95rem] font-semibold',
        'transition-[background-color,border-color,box-shadow,transform] duration-200',
        'active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4.5 animate-spin" aria-hidden="true" /> : leftIcon}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
