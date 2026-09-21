import { LogoMark } from './Logo'

/** Shown while the stored session is being restored. */
export function FullScreenLoader() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-bone-100">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-12 animate-pulse" />
        <p className="text-sm font-medium text-ink-soft">Preparing your workspace…</p>
      </div>
    </div>
  )
}
