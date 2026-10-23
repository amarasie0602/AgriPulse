import { BarChart3, Droplets, LayoutDashboard, Warehouse, Sprout, UserRound, Leaf, ChevronRight, Bell, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const groups = [
  { label: 'FARM OPERATIONS', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farms', label: 'Farms', icon: Warehouse },
    { to: '/crops', label: 'Crop plans', icon: Sprout },
    { to: '/resources', label: 'Resource log', icon: Droplets },
  ] },
  { label: 'INSIGHTS', items: [
    { to: '/carbon', label: 'Emissions estimate', icon: Leaf },
    { to: '/analytics', label: 'Farm analytics', icon: BarChart3 },
  ] },
  { label: 'ACCOUNT', items: [{ to: '/profile', label: 'Farm Profile', icon: UserRound }, { to: '/notifications', label: 'Notifications', icon: Bell }, { to: '/settings', label: 'Settings', icon: Settings }] },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return <nav aria-label="Dashboard" className="field-navigation">{groups.map(group => <div key={group.label} className="field-nav-group nav-group"><p>{group.label}</p><ul>{group.items.map(({ to, label, icon: Icon }) => <li key={to}><NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={to} onClick={onNavigate}><Icon size={18} aria-hidden="true" /><span>{label}</span><ChevronRight className="field-nav-arrow" size={13} aria-hidden="true" /></NavLink></li>)}</ul></div>)}</nav>
}
