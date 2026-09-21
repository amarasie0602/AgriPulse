import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

/** Minimal signed-in frame. Navigation for future modules will live here. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="bg-grain min-h-dvh bg-bone-100">
      <header className="border-b border-bone-300/80 bg-bone-50/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[0.7rem] font-semibold tracking-widest text-ink-soft uppercase">{user.role}</p>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={logout}
              leftIcon={<LogOut className="size-4" aria-hidden="true" />}
              className="h-10 px-4 text-sm"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>
    </div>
  )
}
