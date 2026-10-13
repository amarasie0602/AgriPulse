import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  /** Theme-independent accent color for the icon's circle, e.g. a RESOURCE_TYPE_COLORS value. */
  color: string
  title: string
  description: ReactNode
  action?: ReactNode
  className?: string
}

/** A friendlier empty-state card: a big icon in a soft colored circle instead of a plain bordered row. */
export function EmptyState({ icon: Icon, color, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-app-border p-7 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left',
        className,
      )}
    >
      <span
        className="grid size-14 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className="size-6.5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-app-heading">{title}</p>
        <p className="mt-0.5 text-sm text-app-ink-soft">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
