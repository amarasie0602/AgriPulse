import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, BarChart3, Calculator, ChevronRight, Clock3, Droplet, Droplets, Leaf, MapPin, Plus, Ruler, Sprout, Warehouse, Wheat, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { LeafSprig } from '@/components/ui/LeafSprig'
import { ResourceUsageChart } from '@/components/ui/ResourceUsageChart'
import { useAuth, useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import { RESOURCE_TYPE_LABELS } from '@/types'
import type { Farm } from '@/types/farm'
import { farmService } from '@/services/farmService'
import { monthlyCarbonTrend, monthlyResourceTrends } from '@/utils/analytics'
import { estimateCarbon } from '@/utils/carbon'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
const carbonColors = ['#194e30', '#639e4d', '#99bd75', '#d5e3b7']

function DashboardStat({ icon: Icon, label, value, detail, to, tone }: { icon: LucideIcon; label: string; value: ReactNode; detail: string; to: string; tone: string }) {
  return <Link className={`nature-stat nature-stat-${tone}`} to={to}><span className="nature-stat-icon"><Icon size={30} strokeWidth={1.6} aria-hidden="true" /></span><div><span className="nature-stat-label">{label}</span><strong>{value}</strong><p>{detail}</p></div><span className="nature-stat-arrow"><ChevronRight size={15} aria-hidden="true" /></span></Link>
}
function CardHeading({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children?: ReactNode }) {
  return <div className="nature-card-heading"><Icon className="nature-heading-icon" size={25} strokeWidth={1.8} aria-hidden="true" /><div><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const { theme } = useTheme()
  const { entries, loading: resourcesLoading, error: resourceError } = useResourceEntries()
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmsError, setFarmsError] = useState<string | null>(null)
  const [farmsLoading, setFarmsLoading] = useState(true)
  const [months, setMonths] = useState(6)
  useEffect(() => {
    const controller = new AbortController()
    farmService.list(controller.signal).then(records => {
      if (!controller.signal.aborted) setFarms(records)
    }).catch(error => { if (!controller.signal.aborted) setFarmsError(error instanceof Error ? error.message : 'Could not load your farms.') })
      .finally(() => { if (!controller.signal.aborted) setFarmsLoading(false) })
    return () => controller.abort()
  }, [])

  const firstName = user?.name?.trim().split(' ')[0] || 'Farmer'
  const totalArea = farms.reduce((sum, farm) => sum + farm.farmSizeHectares, 0)
  const cropCount = new Set(farms.flatMap(farm => farm.cropTypes.map(crop => crop.toLocaleLowerCase()))).size
  const carbon = estimateCarbon(entries)
  const carbonRows = carbon.rows.filter(row => row.co2eKg > 0)
  const resourceTrends = monthlyResourceTrends(entries)
  const preferredTypes = ['WATER', 'FERTILIZER', 'ENERGY']
  const displayedTrends = [...resourceTrends].sort((a, b) => {
    const rank = (type: string) => preferredTypes.includes(type) ? preferredTypes.indexOf(type) : 3
    return rank(a.type) - rank(b.type)
  }).slice(0, 3)
  const carbonTrend = monthlyCarbonTrend(entries)
  const last = carbonTrend[carbonTrend.length - 1]?.value ?? 0
  const previous = carbonTrend[carbonTrend.length - 2]?.value ?? 0
  const change = last > 0 && previous > 0 ? (last - previous) / previous * 100 : null
  let progress = 0
  const segments = carbonRows.map((row, index) => {
    const start = progress
    progress += row.co2eKg / carbon.totalCo2eKg * 100
    return `${carbonColors[index % carbonColors.length]} ${start}% ${progress}%`
  })
  const farmValue = (value: ReactNode) => farmsLoading ? '...' : farmsError ? '—' : value
  const carbonValue = resourcesLoading ? '...' : resourceError || !carbon.hasData ? '—' : <>{number.format(carbon.totalCo2eKg / 1000)} <small>tCO₂e</small></>

  return <div className="app-page reference-dashboard">
    <header className="nature-welcome"><div><p>Welcome back,</p><h1>{firstName} <Sprout size={33} strokeWidth={1.7} aria-hidden="true" /></h1><span>Here’s what’s happening on your farms today.</span></div><div className="welcome-landscape"><LeafSprig className="welcome-leaves" /><blockquote>“Sustainable farming<br />today for a healthier<br />tomorrow.”</blockquote></div></header>
    {(resourceError || farmsError) && <Alert tone="error" surface={theme}>{resourceError || farmsError}</Alert>}
    <div className="nature-stats">
      <DashboardStat icon={Sprout} label="Total Farms" value={farmValue(farms.length)} detail="Your registered farm records" to="/farms" tone="sage" />
      <DashboardStat icon={Ruler} label="Total Area" value={farmValue(<>{number.format(totalArea)} <small>ha</small></>)} detail="Across your registered farms" to="/farms" tone="olive" />
      <DashboardStat icon={Wheat} label="Crop Varieties" value={farmValue(cropCount)} detail="Across all farms" to="/farms" tone="amber" />
      <DashboardStat icon={Leaf} label="Estimated Carbon" value={carbonValue} detail="From your saved resource log" to="/carbon" tone="moss" />
    </div>
    <div className="nature-middle-grid">
      <section className="nature-card resource-trend-card">
        <CardHeading icon={BarChart3} title="Resource Usage Trends" description="Water, crop inputs, and energy usage over time.">
          <label className="trend-period"><span className="sr-only">Resource trend period</span><select value={months} onChange={event => setMonths(Number(event.target.value))}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></label>
        </CardHeading>
        {resourcesLoading ? <div className="nature-empty" role="status">Loading your resource trends...</div> : resourceError ? <div className="nature-empty">Resource trends are temporarily unavailable.</div> : displayedTrends.length ? <ResourceUsageChart trends={displayedTrends} months={months} /> : <div className="nature-empty"><BarChart3 size={32} aria-hidden="true" /><h3>Your resource story starts here</h3><p>Record water, energy, or crop inputs to see your usage over time.</p><Link to="/resources">Record resource usage <ChevronRight size={15} /></Link></div>}
        <p className="nature-chart-note">Each line uses its labelled unit. Based on up to 200 recent entries; quantities are not combined.</p>
      </section>
      <section className="nature-card carbon-footprint-card">
        <CardHeading icon={Leaf} title="Carbon Footprint" description="Your estimated carbon footprint and breakdown." />
        <div className="carbon-visual"><div className="carbon-ring" style={{ background: segments.length && !resourceError ? `conic-gradient(${segments.join(', ')})` : 'var(--color-app-border)' }} role="img" aria-label={carbon.hasData && !resourceError ? `Estimated emissions: ${number.format(carbon.totalCo2eKg)} kg CO2e` : 'No carbon estimate available'}><div><strong>{resourcesLoading ? '...' : carbon.hasData && !resourceError ? number.format(carbon.totalCo2eKg / 1000) : '—'}</strong><span>tCO₂e</span></div></div>
          <div className="carbon-details">{change !== null && !resourceError ? <p className={`carbon-comparison ${change > 0 ? 'carbon-increase' : ''}`}><span>{change <= 0 ? <ArrowDown size={17} /> : <ArrowUp size={17} />}{Math.abs(change).toFixed(0)}%</span>{change <= 0 ? 'Lower' : 'Higher'} than last month</p> : <p className="carbon-scope">{resourcesLoading ? 'Loading resource data...' : resourceError ? 'Estimate unavailable' : carbon.hasData ? 'Based on your resource records' : 'Log fuel, energy, or crop inputs to see your estimate.'}</p>}
            <ul className="carbon-breakdown">{carbonRows.map((row, index) => <li key={row.type}><i style={{ background: carbonColors[index] }} /><span>{row.label}</span><strong>{(row.co2eKg / carbon.totalCo2eKg * 100).toFixed(0)}%</strong></li>)}</ul>
          </div>
        </div>
        <Link className="carbon-methodology" to="/carbon">Illustrative estimate · View calculation details <ChevronRight size={14} aria-hidden="true" /></Link><LeafSprig className="carbon-leaves" />
      </section>
    </div>
    <div className="nature-bottom-grid">
      <section className="nature-card your-farms-card">
        <CardHeading icon={Warehouse} title="Your Farms" description="Manage and monitor all your farm locations."><Link to="/farms">View all</Link></CardHeading>
        {farmsLoading ? <div className="nature-empty" role="status">Loading farms...</div> : farmsError ? <div className="nature-empty">Your farms could not be loaded.<Link to="/farms">Open farm directory</Link></div> : farms.length ? <ul className="dashboard-farm-list">{farms.slice(0, 3).map((farm, index) => <li key={farm.id}><Link to={`/farms?q=${encodeURIComponent(farm.farmName)}`}><img src="/images/tea-landscape.png" alt="" className={`farm-scenic-thumb farm-scenic-thumb-${index}`} /><div className="dashboard-farm-info"><h3>{farm.farmName}</h3><p><MapPin size={13} aria-hidden="true" />{farm.location}</p></div><strong>{number.format(farm.farmSizeHectares)} <small>ha</small></strong><div className="farm-crops">{farm.cropTypes.slice(0, 2).map(crop => <span key={crop}>{crop}</span>)}</div><ChevronRight size={16} className="farm-list-arrow" aria-hidden="true" /></Link></li>)}</ul> : <div className="nature-empty"><Sprout size={30} aria-hidden="true" /><h3>Room to grow</h3><p>Add your first farm and keep your land and crops in view.</p><Link to="/farms?new=1">Add your first farm <Plus size={15} /></Link></div>}
      </section>
      <section className="nature-card nature-activity-card">
        <CardHeading icon={Clock3} title="Recent Activity" description="Latest updates from your resource log."><Link to="/resources">View all</Link></CardHeading>
        {resourcesLoading ? <div className="nature-empty" role="status">Loading recent activity...</div> : resourceError ? <div className="nature-empty">Resource activity is unavailable.</div> : entries.length ? <ul className="nature-activity-list">{entries.slice(0, 4).map(entry => { const Icon = entry.resourceType === 'WATER' ? Droplets : entry.resourceType === 'ENERGY' ? Zap : entry.resourceType === 'FERTILIZER' ? Sprout : Leaf; return <li key={entry.id}><Link to="/resources"><span className={`activity-resource-icon activity-resource-${entry.resourceType.toLowerCase()}`}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span><div><h3>{RESOURCE_TYPE_LABELS[entry.resourceType]} recorded</h3><p>{number.format(entry.quantity)} {entry.unit} · {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p></div><ChevronRight size={15} aria-hidden="true" /></Link></li> })}</ul> : <div className="nature-empty"><Clock3 size={29} aria-hidden="true" /><p>Your latest resource records will appear here.</p><Link to="/resources">Log your first entry</Link></div>}
      </section>
      <section className="nature-card quick-actions-card"><CardHeading icon={Zap} title="Quick Actions" description="Common tasks to manage your farms." /><div className="nature-quick-actions"><Link to="/farms?new=1" className="quick-primary"><Plus size={21} aria-hidden="true" /><span>Add New Farm</span><ChevronRight size={16} aria-hidden="true" /></Link><Link to="/resources"><Droplet size={21} aria-hidden="true" /><span>Record Resource Usage</span><ChevronRight size={16} aria-hidden="true" /></Link><Link to="/carbon"><Calculator size={21} aria-hidden="true" /><span>Calculate Carbon Footprint</span><ChevronRight size={16} aria-hidden="true" /></Link><Link to="/analytics"><BarChart3 size={21} aria-hidden="true" /><span>View Analytics</span><ChevronRight size={16} aria-hidden="true" /></Link></div></section>
    </div>
  </div>
}
