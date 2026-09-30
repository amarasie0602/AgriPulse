import type { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'
import { AerialFieldBackdrop } from './AerialFieldBackdrop'

const NAV_CONCEPTS = ['Monitor', 'Analyze', 'Grow', 'Preserve']

/**
 * Full-screen dark botanical shell shared by the console-style Login and
 * Register pages: aerial field backdrop, branding, headline, and a decorative
 * nav strip, with a slot in the middle for each page's own content.
 */
export function ConsoleAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-forest-950 text-bone-50">
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-bone-50 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-lg"
      >
        Skip to form
      </a>

      <AerialFieldBackdrop className="pointer-events-none absolute inset-0" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay" aria-hidden="true" />

      <div className="relative z-10 flex min-h-dvh flex-col px-4 py-6 sm:px-8 sm:py-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Logo tone="light" />
        </header>

        <div className="mx-auto mt-6 max-w-xl text-center animate-fade-in sm:mt-8">
          <p className="mb-3 inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.22em] text-moss-300 uppercase">
            <span className="h-px w-6 bg-wheat-500/70" aria-hidden="true" />
            Smart Farm Sustainability
            <span className="h-px w-6 bg-wheat-500/70" aria-hidden="true" />
          </p>
          <h1 className="font-display text-[1.9rem] leading-[1.12] font-medium tracking-tight sm:text-[2.4rem]">
            Data for <span className="text-wheat-300 italic">Healthier Farms.</span>
          </h1>
          <p className="mt-2.5 text-sm text-moss-200/85 sm:text-base">
            Real-time insights. Sustainable outcomes.
          </p>
        </div>

        <main id="auth-form" className="flex flex-1 items-center justify-center py-10 sm:py-12">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 pb-1 text-[0.65rem] font-semibold tracking-[0.28em] text-moss-300/60 uppercase sm:gap-4">
          {NAV_CONCEPTS.map((concept, index) => (
            <span key={concept} className="flex items-center gap-3 sm:gap-4">
              {index > 0 && <span className="text-moss-300/30" aria-hidden="true">·</span>}
              {concept}
            </span>
          ))}
        </footer>
      </div>
    </div>
  )
}
