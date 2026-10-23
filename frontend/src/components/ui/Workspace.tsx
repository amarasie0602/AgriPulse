import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action && <div className="heading-action">{action}</div>}</header>
}
export function PageAction({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="page-action" to={to}>{children}<ArrowUpRight size={16} aria-hidden="true" /></Link>
}
export function MetricCard({ icon: Icon, label, value, detail, accent = false, to }: { icon: LucideIcon; label: string; value: ReactNode; detail: string; accent?: boolean; to?: string }) {
  return <article className={`metric-card${accent ? ' metric-accent' : ''}`}><div className="metric-top"><span className={`metric-icon ${accent ? 'green' : 'sage'}`}><Icon size={19} aria-hidden="true" /></span>{to && <Link className="metric-more" to={to} aria-label={`View ${label.toLowerCase()}`}><ArrowUpRight size={16} aria-hidden="true" /></Link>}</div><p className="metric-label">{label}</p><div className="metric-value">{value}</div><div className="metric-foot"><span>{detail}</span></div></article>
}
export function WorkspaceNote({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="workspace-note"><span className="eyebrow">RESOURCE LOG</span><h2>{title}</h2><p>{children}</p></aside>
}
