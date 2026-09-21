import type { ReactNode } from 'react'
import { BrandPanel } from './BrandPanel'
import { MobileBrandHeader } from './MobileBrandHeader'

/** Split-screen shell shared by the login and registration pages. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-bone-50 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to form
      </a>

      <BrandPanel />
      <MobileBrandHeader />

      <main
        id="auth-form"
        className="bg-grain relative -mt-6 flex min-h-[calc(100dvh-8rem)] items-start justify-center rounded-t-[1.75rem] bg-bone-100 px-4 pt-8 pb-12 sm:px-8 lg:mt-0 lg:min-h-dvh lg:items-center lg:rounded-none lg:px-10 lg:py-12"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_100%_0%,rgb(231_201_138/0.22),transparent_60%),radial-gradient(40rem_30rem_at_0%_100%,rgb(143_174_134/0.18),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-[26rem] animate-slide-up sm:max-w-md">{children}</div>
      </main>
    </div>
  )
}
