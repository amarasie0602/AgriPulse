import { cn } from '@/utils/cn'

export function Divider({ label, tone = 'light' }: { label: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'

  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className={cn('h-px flex-1 bg-linear-to-r from-transparent', dark ? 'to-white/20' : 'to-bone-300')} />
      <span
        className={cn(
          'text-[0.7rem] font-semibold tracking-[0.2em]',
          dark ? 'text-moss-300/70' : 'text-ink-soft',
        )}
        aria-hidden="true"
      >
        {label}
      </span>
      <span className={cn('h-px flex-1 bg-linear-to-l from-transparent', dark ? 'to-white/20' : 'to-bone-300')} />
    </div>
  )
}
