import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Leaf, Droplets } from 'lucide-react'
import { PageHeader } from '@/components/ui/Workspace'
import { Alert } from '@/components/ui/Alert'
import { useAuth, useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import { cropService } from '@/services/cropService'
import { RESOURCE_TYPE_LABELS } from '@/types'
import type { Crop } from '@/types/crop'
export default function Notifications() {
  useDocumentTitle('Notifications')
  const { user } = useAuth(), { theme } = useTheme()
  const { entries, loading, error } = useResourceEntries()
  const [crops, setCrops] = useState<Crop[]>([]), [cropError, setCropError] = useState('')
  const [cropsLoading, setCropsLoading] = useState(true)
  const [filter, setFilter] = useState('all'), [message, setMessage] = useState('')
  const storageKey = `agripulse.read-notifications.${user?.id}`
  const [read, setRead] = useState<string[]>(() => { try { const v = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [] } catch { return [] } })
  useEffect(() => { const controller = new AbortController(); cropService.list(controller.signal).then(records => { if (!controller.signal.aborted) setCrops(records) }).catch(e => { if (!controller.signal.aborted) setCropError(e.message || 'Crop reminders unavailable.') }).finally(() => { if (!controller.signal.aborted) setCropsLoading(false) }); return () => controller.abort() }, [])
  const today = new Date(); today.setHours(0,0,0,0)
  const notices = [...entries.map(entry => ({ id:`resource:${entry.id}`, kind:'resource', title:`${RESOURCE_TYPE_LABELS[entry.resourceType]} recorded`, detail:`${entry.quantity.toLocaleString()} ${entry.unit} · Usage date ${entry.date.slice(0,10)}`, date:entry.createdAt, to:'/resources', note:'Saved resource record' })), ...crops.filter(crop => crop.stage !== 'Harvested' && new Date(crop.harvestDate + 'T00:00:00').getTime() - today.getTime() <= 30 * 86400000).map(crop => ({ id:`crop:${crop.id}:${crop.harvestDate}:${crop.stage}`, kind:'crop', title:`Review harvest plan: ${crop.name}`, detail:`${crop.stage} · Planned harvest ${crop.harvestDate}`, date:crop.harvestDate + 'T12:00:00', to:'/crops', note:'Reminder based on your crop plan' }))].sort((a,b) => b.date.localeCompare(a.date))
  const visible = notices.filter(n => filter === 'all' || (filter === 'unread' ? !read.includes(n.id) : n.kind === filter))
  function mark(ids: string[]) { const next = [...new Set([...read,...ids])]; try { localStorage.setItem(storageKey, JSON.stringify(next)); setRead(next); setMessage('Read status saved in this browser.') } catch { setMessage('Unable to save read status in this browser.') } }
  return <div className="app-page notifications-page"><PageHeader eyebrow="YOUR FARM RECORDS" title="Notifications" description="Saved activity and harvest-plan reminders. Read status is stored in this browser; no email or push delivery is connected." />
    {(error || cropError) && <Alert tone="error" surface={theme}>{error || cropError}</Alert>}
    <div className="notification-toolbar"><div className="filter-tabs" aria-label="Notification filters">{[['all','All'],['unread','Unread'],['resource','Resources'],['crop','Crop plans']].map(([value,label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><button className="text-link" disabled={!notices.some(n => !read.includes(n.id))} onClick={() => mark(notices.map(n => n.id))}>Mark all read</button></div>
    {loading || cropsLoading ? <p role="status">Loading activity...</p> : !visible.length ? <div className="workspace-empty"><Leaf size={30} /><h2>{filter === 'unread' ? 'You are up to date' : 'No activity in this selection'}</h2><p>Resource records and harvest plans will appear here when available.</p></div> : <ul className="notification-list">{visible.map(n => <li key={n.id} className={read.includes(n.id) ? 'is-read' : ''}><span className="notice-icon">{n.kind === 'resource' ? <Droplets size={20} /> : <Leaf size={20} />}</span><div><h2>{n.title}</h2><p>{n.detail}</p><small>{n.note} · {new Date(n.date).toLocaleDateString()}</small><Link to={n.to}>Review {n.kind === 'resource' ? 'resource log' : 'crop plans'} →</Link></div>{!read.includes(n.id) ? <button onClick={() => mark([n.id])} aria-label={`Mark ${n.title} as read`}><Check size={18} /></button> : <span className="read-label">Read</span>}</li>)}</ul>}<p role="status" className="settings-status">{message}</p>
  </div>
}
