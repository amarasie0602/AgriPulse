import type { ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FloatingStatCardProps {
  label: string
  value: string
  unit?: string
  /** e.g. "12.4%" — rendered with an upward arrow. */
  delta?: string
  className?: string
  children?: ReactNode
}

/** Glass card used on the login brand panel. Always shows illustrative sample data. */
export function FloatingStatCard({ label, value, unit, delta, className, children }: FloatingStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-glass backdrop-blur-xl',
        'bg-linear-to-b from-white/[0.10] to-white/[0.03]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-moss-300 uppercase">{label}</p>
        <span className="rounded-full border border-white/15 px-1.5 py-px text-[0.55rem] font-semibold tracking-widest text-moss-300/80 uppercase">
          Sample
        </span>
      </div>

      <div className="mt-2 flex items-end gap-2">
        <span className="font-display text-[2.1rem] leading-none font-medium text-bone-50">{value}</span>
        {unit && <span className="pb-0.5 text-sm font-medium text-moss-300">{unit}</span>}
        {delta && (
          <span className="mb-0.5 ml-auto inline-flex items-center gap-0.5 rounded-full bg-moss-400/15 px-2 py-0.5 text-xs font-semibold text-moss-200">
            <ArrowUp className="size-3" aria-hidden="true" />
            {delta}
          </span>
        )}
      </div>

      {children}
    </div>
  )
}
