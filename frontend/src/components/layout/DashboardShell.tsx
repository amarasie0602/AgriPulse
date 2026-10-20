import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, CircleHelp, Leaf, LogOut, Menu, Search, Settings, X } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Dialog } from '@/components/ui/Dialog'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { SidebarNav } from './SidebarNav'

const labels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/resources': 'Resource tracking',
  '/carbon': 'Carbon calculator',
  '/analytics': 'Analytics',
  '/profile': 'Farm profile',
  '/farms': 'Farm management',
}

export function DashboardShell() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const drawer = drawerRef.current
    const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
    focusable()[0]?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      menuButtonRef.current?.focus()
    }
  }, [menuOpen])

  const sidebar = (
    <>
      <div className="sidebar-brand"><Logo tone="light" /><span>Sustainable Farms<br />Brighter Tomorrow</span></div>
      <SidebarNav onNavigate={() => setMenuOpen(false)} />
      <div className="sidebar-tools">
        <Link to="/resources" onClick={() => setMenuOpen(false)}><Bell size={19} aria-hidden="true" />Recent activity</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}><Settings size={19} aria-hidden="true" />Farm settings</Link>
        <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true) }}><CircleHelp size={19} aria-hidden="true" />Help & support</button>
      </div>
      <div className="sidebar-landscape"><div><Leaf size={24} aria-hidden="true" /><strong>Farming Today</strong><span>for a Greener Tomorrow</span></div></div>
    </>
  )

  return (
    <div className="workspace-shell">
      <aside className="desktop-sidebar" aria-label="Workspace navigation">{sidebar}</aside>
      {menuOpen && (
        <div className="mobile-navigation">
          <button className="drawer-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} tabIndex={-1} />
          <aside ref={drawerRef} className="mobile-sidebar" role="dialog" aria-modal="true" aria-label="Workspace navigation">
            <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={20} aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="workspace-content" inert={menuOpen}>
        <header className="workspace-topbar">
          <div className="mobile-page-title"><button ref={menuButtonRef} className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu size={21} aria-hidden="true" /></button><span>{labels[pathname] || 'Workspace'}</span></div>
          <form className="workspace-search" role="search" onSubmit={event => { event.preventDefault(); navigate('/farms?q=' + encodeURIComponent(search.trim())) }}>
            <label className="sr-only" htmlFor="workspace-search-input">Search farm directory</label><Search size={18} aria-hidden="true" /><input id="workspace-search-input" type="search" placeholder="Search farms, locations, or crops..." value={search} onChange={event => setSearch(event.target.value)} />
          </form>
          <div className="topbar-account"><Link to="/resources" className="topbar-activity" title="View recent resource activity" aria-label="View recent resource activity"><Bell size={21} aria-hidden="true" /></Link><ThemeToggle /><details className="account-menu"><summary><span className="account-avatar">{user?.name?.trim().charAt(0).toUpperCase() || 'F'}</span><span className="account-name">{user?.name?.split(' ')[0] || 'Farmer'}</span><ChevronDown size={15} aria-hidden="true" /></summary><div><Link to="/profile" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>Farm profile</Link><button type="button" onClick={logout}><LogOut size={15} aria-hidden="true" />Sign out</button></div></details></div>
        </header>
        <main ref={contentRef} className="workspace-main" tabIndex={0} aria-label={labels[pathname] || 'Workspace'}>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>AGRIPULSE / OPERATIONS</span>
          <span>Grow with a clearer perspective.</span>
        </footer>
      </div>
      {helpOpen && <Dialog title="Your AgriPulse workspace" description="A quick guide to managing your farm information." onClose={() => setHelpOpen(false)}><dl className="farm-detail-grid"><div><dt>Farm Management</dt><dd>Create and manage individual farm records.</dd></div><div><dt>Resource Tracking</dt><dd>Record water, energy, fuel, and crop inputs.</dd></div><div><dt>Carbon & analytics</dt><dd>Explore estimates and trends from your saved resource log.</dd></div><div><dt>Farm Profile</dt><dd>Keep your account’s default farm details current.</dd></div></dl></Dialog>}
    </div>
  )
}
