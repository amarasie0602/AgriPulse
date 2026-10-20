import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</header>
}
export function PageAction({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="page-action" to={to}>{children}<ArrowUpRight size={16} aria-hidden="true" /></Link>
}
export function MetricCard({ icon: Icon, label, value, detail, accent = false }: { icon: LucideIcon; label: string; value: ReactNode; detail: string; accent?: boolean }) {
  return <article className={`metric-card${accent ? ' metric-accent' : ''}`}><div className="metric-label"><span>{label}</span><span className="metric-icon"><Icon size={18} aria-hidden="true" /></span></div><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></article>
}
export function WorkspaceNote({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="workspace-note"><span className="eyebrow">Farm intelligence</span><h2>{title}</h2><p>{children}</p></aside>
}
