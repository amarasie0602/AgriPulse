import { Sprout } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { useAuth, useDocumentTitle } from '@/hooks'

/** Placeholder only — the real workspace is built in later stages. */
export default function Dashboard() {
  const { user } = useAuth()
  useDocumentTitle('Dashboard')

  return (
    <AppShell>
      <section className="mx-auto flex max-w-xl animate-slide-up flex-col items-center py-24 text-center sm:py-32">
        <span className="mb-6 grid size-14 place-items-center rounded-2xl border border-bone-300 bg-bone-50 text-forest-700 shadow-card">
          <Sprout className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-4xl leading-tight font-medium tracking-tight text-forest-900 sm:text-5xl">
          Welcome to AgriPulse
        </h1>
        <p className="mt-4 text-lg text-ink-soft">Your sustainability workspace is being prepared.</p>
        {user && <p className="mt-8 text-sm text-ink-soft">Signed in as {user.email}</p>}
      </section>
    </AppShell>
  )
}
