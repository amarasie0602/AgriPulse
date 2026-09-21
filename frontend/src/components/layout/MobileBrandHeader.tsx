import { Logo } from '@/components/ui/Logo'
import { ContourLines } from './ContourLines'

/** Compact brand header shown above the form on screens below `lg`. */
export function MobileBrandHeader() {
  return (
    <header className="relative overflow-hidden bg-linear-to-br from-forest-950 via-forest-900 to-forest-800 px-6 pt-8 pb-16 text-bone-50 sm:px-10 lg:hidden">
      <div className="bg-rows pointer-events-none absolute inset-0" aria-hidden="true" />
      <ContourLines className="pointer-events-none absolute inset-0 size-full" />
      <div
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-forest-600/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative animate-fade-in">
        <Logo tone="light" />
        <p className="mt-5 font-display text-[1.45rem] leading-snug font-medium sm:text-2xl">
          Measure. Understand.
          <span className="block text-wheat-300 italic">Grow Sustainably.</span>
        </p>
      </div>
    </header>
  )
}
