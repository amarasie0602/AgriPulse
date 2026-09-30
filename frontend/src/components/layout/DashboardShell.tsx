import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { SidebarNav } from './SidebarNav'

/** Signed-in app frame: a persistent sidebar (drawer on mobile) around a page outlet. */
export function DashboardShell() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const logoTone = theme === 'dark' ? 'light' : 'dark'

  return (
    <div className="bg-grain min-h-dvh bg-app-bg transition-colors duration-200 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-app-border/80 bg-app-surface/80 p-5 lg:flex lg:flex-col">
        <Logo tone={logoTone} className="px-1" />
        <div className="mt-8 flex-1">
          <SidebarNav />
        </div>
        <UserCard name={user?.name} role={user?.role} onSignOut={logout} />
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-app-border/80 bg-app-surface/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo tone={logoTone} />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="grid size-10 place-items-center rounded-lg text-app-ink-soft hover:bg-app-accent/5"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
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
          <div className="animate-slide-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-app-surface p-5 shadow-glass">
            <div className="flex items-center justify-between">
              <Logo tone={logoTone} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg text-app-ink-soft hover:bg-app-accent/5"
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
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-app-border/70 bg-app-chip/60 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-app-accent text-sm font-semibold text-app-accent-contrast">
        {name?.trim().charAt(0).toUpperCase() || '?'}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-app-ink">{name}</p>
        <p className="text-[0.65rem] font-semibold tracking-widest text-app-ink-soft uppercase">{role}</p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <ThemeToggle />
      </div>
      <button
        type="button"
        onClick={onSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-app-ink-soft transition-colors hover:bg-app-accent/8"
      >
        <LogOut className="size-4.5" aria-hidden="true" />
      </button>
    </div>
  )
}
