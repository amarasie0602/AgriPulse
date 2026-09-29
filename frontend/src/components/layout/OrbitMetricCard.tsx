import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface OrbitMetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  /** e.g. "-24%" or "+6%" — shown as a small badge. */
  delta?: string
  className?: string
  children?: ReactNode
}

/**
 * Small telemetry readout orbiting the Smart Field Console. Always sample
 * data — labelled as such so it's never mistaken for a live reading.
 */
export function OrbitMetricCard({ icon: Icon, label, value, unit, delta, className, children }: OrbitMetricCardProps) {
  return (
    <div
      className={cn(
        'w-44 rounded-2xl border border-white/12 bg-white/[0.05] p-3.5 shadow-glass backdrop-blur-xl',
        'bg-linear-to-b from-white/[0.08] to-white/[0.02]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-wheat-300">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="rounded-full border border-white/15 px-1.5 py-px text-[0.55rem] font-semibold tracking-widest text-moss-300/80 uppercase">
          Sample
        </span>
      </div>

      <p className="mt-2.5 text-[0.65rem] font-semibold tracking-[0.12em] text-moss-300 uppercase">{label}</p>

      <div className="mt-0.5 flex items-end gap-1.5">
        <span className="font-display text-xl leading-none font-medium text-bone-50">{value}</span>
        {unit && <span className="pb-0.5 text-xs font-medium text-moss-300">{unit}</span>}
        {delta && (
          <span className="mb-0.5 ml-auto text-[0.7rem] font-semibold text-wheat-300">{delta}</span>
        )}
      </div>

      {children}
    </div>
  )
}
