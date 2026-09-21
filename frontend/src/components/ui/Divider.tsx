export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-bone-300" />
      <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-ink-soft" aria-hidden="true">
        {label}
      </span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-bone-300" />
    </div>
  )
}
