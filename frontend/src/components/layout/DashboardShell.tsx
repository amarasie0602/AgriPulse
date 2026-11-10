import { useEffect, useRef, useState } from 'react'
import { ChevronDown, CircleHelp, LogOut, Menu, Search, Sprout, X } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Dialog } from '@/components/ui/Dialog'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { SidebarNav } from './SidebarNav'
import { usePreferences } from '@/hooks/usePreferences'

const labels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/resources': 'Resource log',
  '/carbon': 'Emissions estimate',
  '/analytics': 'Analytics',
  '/profile': 'Farm profile',
  '/farms': 'Farm management',
  '/crops': 'Crop plans',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
}

export function DashboardShell() {
  const { user, logout } = useAuth()
  const { preferences } = usePreferences()
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
    window.scrollTo({ top: 0, left: 0 })
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
<div className="brand"><div className="brand-mark"><Sprout size={24} aria-hidden="true" /></div><div><b>AgriPulse</b><span>Farm management</span></div></div>
      <SidebarNav onNavigate={() => setMenuOpen(false)} />
      <div className="sidebar-tools sidebar-bottom">
        <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true) }}><CircleHelp size={19} aria-hidden="true" />Help & support</button>
      <div className="side-user"><div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'F'}</div><div><b>{user?.name || 'Farmer account'}</b><small>Signed in to AgriPulse</small></div></div></div>
    </>
  )

  return (
    <div data-motion={preferences.motion ? 'on' : 'off'} className="workspace-shell">
      <aside className="desktop-sidebar sidebar" aria-label="Workspace navigation">{sidebar}</aside>
      {menuOpen && (
        <div className="mobile-navigation">
          <button className="drawer-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} tabIndex={-1} />
          <aside ref={drawerRef} className="mobile-sidebar sidebar mobile-open" role="dialog" aria-modal="true" aria-label="Workspace navigation">
            <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={20} aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="workspace-content main-shell" inert={menuOpen}>
        <header className="workspace-topbar topbar"><div className="field-breadcrumb breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{labels[pathname] || 'Workspace'}</strong></div>
          <div className="mobile-page-title"><button ref={menuButtonRef} className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu size={21} aria-hidden="true" /></button><span>{labels[pathname] || 'Workspace'}</span></div>
          <form className="workspace-search search-box" role="search" onSubmit={event => { event.preventDefault(); navigate('/farms?q=' + encodeURIComponent(search.trim())) }}>
            <label className="sr-only" htmlFor="workspace-search-input">Search farm directory</label><Search size={18} aria-hidden="true" /><input id="workspace-search-input" type="search" placeholder="Search farms, locations, or crops..." value={search} onChange={event => setSearch(event.target.value)} />
          </form>
          <div className="topbar-account top-actions"><ThemeToggle /><details className="account-menu top-user"><summary aria-label="Account menu"><span className="account-avatar avatar small">{user?.name?.trim().charAt(0).toUpperCase() || 'F'}</span><span className="account-name">{user?.name?.split(' ')[0] || 'Farmer'}</span><ChevronDown size={15} aria-hidden="true" /></summary><div><button type="button" onClick={logout}><LogOut size={15} aria-hidden="true" />Sign out</button></div></details></div>
        </header>
        <main ref={contentRef} className="workspace-main page-content" tabIndex={0} aria-label={labels[pathname] || 'Workspace'}>
          <Outlet />
        </main>
      </div>
      {helpOpen && <Dialog title="Your AgriPulse workspace" description="A quick guide to managing your farm information." onClose={() => setHelpOpen(false)}><dl className="farm-detail-grid"><div><dt>Farm Management</dt><dd>Create and manage individual farm records.</dd></div><div><dt>Resource Tracking</dt><dd>Record water, energy, fuel, and crop inputs.</dd></div><div><dt>Carbon & analytics</dt><dd>Explore estimates and trends from your saved resource log.</dd></div><div><dt>Farm Profile</dt><dd>Keep your accountâ€™s default farm details current.</dd></div></dl></Dialog>}
    </div>
  )
}
