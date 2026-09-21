import { Logo } from '@/components/ui/Logo'
import { ContourLines } from './ContourLines'
import { FieldVisualization } from './FieldVisualization'
import { FloatingStatCard } from './FloatingStatCard'

/** Sparkline points for the sample efficiency trend. */
const SPARKLINE = 'M0 26 C 10 24, 14 18, 24 19 S 38 12, 48 13 S 62 6, 72 7 S 88 2, 100 3'

/** Desktop-only brand side of the auth screens. All figures are illustrative samples. */
export function BrandPanel() {
  return (
    <aside
      aria-label="About AgriPulse"
      className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-forest-950 via-forest-900 to-forest-800 p-12 text-bone-50 lg:flex xl:p-16"
    >
      {/* Background layers */}
      <div className="bg-rows pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-forest-600/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-24 size-[30rem] rounded-full bg-wheat-500/10 blur-3xl"
        aria-hidden="true"
      />
      <ContourLines className="pointer-events-none absolute inset-x-0 top-0 h-[55%] w-full animate-float-slow" />
      <FieldVisualization className="pointer-events-none absolute inset-0 size-full" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 animate-fade-in">
        <Logo tone="light" />
      </div>

      <div className="relative z-10 max-w-lg animate-slide-up">
        <p className="mb-5 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] text-moss-300 uppercase">
          <span className="h-px w-8 bg-wheat-500/70" aria-hidden="true" />
          Smart Farm Sustainability
        </p>
        <h2 className="font-display text-[2.9rem] leading-[1.06] font-medium tracking-tight xl:text-[3.4rem]">
          Measure. Understand.
          <br />
          <span className="text-wheat-300 italic">Grow Sustainably.</span>
        </h2>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-moss-200/90">
          A smarter way to understand farm resources and sustainability.
        </p>
      </div>

      <div className="relative z-10">
        <div className="relative h-60 xl:h-64">
          <FloatingStatCard
            label="Resource efficiency"
            value="78%"
            delta="12.4%"
            className="absolute top-0 left-0 w-64 animate-float"
          >
            <svg viewBox="0 0 100 30" className="mt-3 h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={SPARKLINE}
                fill="none"
                stroke="#e7c98a"
                strokeWidth="1.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </FloatingStatCard>

          <FloatingStatCard
            label="Estimated impact"
            value="4.82"
            unit="t CO₂e"
            className="absolute right-0 bottom-0 w-64 animate-float-slow"
          >
            <div className="mt-3.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
              <span className="w-[46%] bg-wheat-300" />
              <span className="w-[31%] bg-moss-400" />
              <span className="w-[23%] bg-clay-500" />
            </div>
            <ul className="mt-2.5 flex gap-3 text-[0.65rem] font-medium text-moss-300">
              <li className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-wheat-300" aria-hidden="true" />
                Energy
              </li>
              <li className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-moss-400" aria-hidden="true" />
                Water
              </li>
              <li className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-clay-500" aria-hidden="true" />
                Inputs
              </li>
            </ul>
          </FloatingStatCard>
        </div>

        <p className="mt-6 text-xs text-moss-300/80">Figures shown are illustrative sample data.</p>
      </div>
    </aside>
  )
}
