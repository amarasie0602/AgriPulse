import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { SidebarNav } from './SidebarNav'

/** Signed-in app frame: a persistent sidebar (drawer on mobile) around a page outlet. */
export function DashboardShell() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-grain min-h-dvh bg-bone-100 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-bone-300/80 bg-bone-50/80 p-5 lg:flex lg:flex-col">
        <Logo className="px-1" />
        <div className="mt-8 flex-1">
          <SidebarNav />
        </div>
        <UserCard name={user?.name} role={user?.role} onSignOut={logout} />
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-bone-300/80 bg-bone-50/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-forest-900/5"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm"
          />
          <div className="animate-slide-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-bone-50 p-5 shadow-glass">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-forest-900/5"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flex-1">
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
            </div>
            <UserCard name={user?.name} role={user?.role} onSignOut={logout} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function UserCard({ name, role, onSignOut }: { name?: string; role?: string; onSignOut: () => void }) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-bone-300/70 bg-white/60 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest-900 text-sm font-semibold text-bone-50">
        {name?.trim().charAt(0).toUpperCase() || '?'}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-[0.65rem] font-semibold tracking-widest text-ink-soft uppercase">{role}</p>
      </div>
      <Button
        variant="ghost"
        onClick={onSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="h-9 w-9 shrink-0 !px-0"
      >
        <LogOut className="size-4.5" aria-hidden="true" />
      </Button>
    </div>
  )
}
