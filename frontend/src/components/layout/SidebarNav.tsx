import { BarChart3, Droplets, LayoutDashboard, Sprout, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/resources', label: 'Resource Tracking', icon: Droplets },
  { to: '/carbon', label: 'Carbon Calculator', icon: Sprout },
  { to: '/profile', label: 'Farm Profile', icon: UserRound },
]

/** Listed so the sidebar shows what's coming without linking anywhere yet. */
const COMING_SOON_ITEMS: NavItem[] = [{ to: '', label: 'Analytics', icon: BarChart3 }]

interface SidebarNavProps {
  /** Called after a real nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void
}

/** Nav content shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-app-accent text-app-accent-contrast shadow-[0_1px_0_rgb(255_255_255/0.12)_inset]'
                    : 'text-app-ink-soft hover:bg-app-accent/5 hover:text-app-ink',
                )
              }
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-2 px-3.5 text-[0.65rem] font-semibold tracking-[0.16em] text-app-ink-soft/70 uppercase">
          Coming soon
        </p>
        <ul className="flex flex-col gap-1">
          {COMING_SOON_ITEMS.map(({ label, icon: Icon }) => (
            <li key={label}>
              <span
                aria-disabled="true"
                title="Not built yet"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-app-ink-soft/50"
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
