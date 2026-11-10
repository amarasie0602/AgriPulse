import { Link } from 'react-router-dom'
import { BarChart3, Droplets, Leaf, Sprout, Warehouse, Ruler, ChevronRight } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { MetricCard } from '@/components/ui/Workspace'
import { FieldOverview } from '@/components/ui/FieldOverview'
import { ResourceUsageChart } from '@/components/ui/ResourceUsageChart'
import { FarmFilter } from '@/components/ui/FarmFilter'
import { TextField } from '@/components/ui/TextField'
import { Photo } from '@/components/ui/Photo'
import { cropPhoto } from '@/utils/media'
import { useAuth, useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import { useFarmDirectory } from '@/hooks/useFarmDirectory'
import { scopeResourceEntries } from '@/utils/reportScope'
import { monthlyResourceTrends } from '@/utils/analytics'
import { estimateCarbon, formatCo2e } from '@/utils/carbon'
import { RESOURCE_TYPE_LABELS } from '@/types'
import { useState } from 'react'
const number=new Intl.NumberFormat(undefined,{maximumFractionDigits:2})
export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const {user}=useAuth(),{theme}=useTheme(),directory=useFarmDirectory()
  const {entries,loading,error}=useResourceEntries()
  const [farm,setFarm]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[months,setMonths]=useState(6)
  const resources=scopeResourceEntries(entries,farm,from,to)
  const farms=directory.farms.filter(item=>!farm||item.id===farm)
  const crops=directory.crops.filter(item=>(!farm||item.farmId===farm)&&item.stage!=='Harvested')
  const carbon=estimateCarbon(resources),trends=monthlyResourceTrends(resources)
  const amount=(type:string,unit:string)=>{const matched=resources.filter(e=>e.resourceType===type&&e.unit.trim().toLowerCase()===unit.toLowerCase());return matched.length?<>{number.format(matched.reduce((s,e)=>s+e.quantity,0))} <small>{unit}</small></>:'—'}
  return <div className="app-page operational-dashboard">
    <FieldOverview name={user?.name.trim().split(' ')[0]||'Farmer'} />
    <section className="report-controls" aria-label="Dashboard reporting filters"><FarmFilter farms={directory.farms} loading={directory.loading} tone={theme} value={farm} onChange={setFarm}/><TextField tone={theme} label="From date" type="date" value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/><TextField tone={theme} label="To date" type="date" value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></section>
    <p className="report-scope">{farm==='unassigned'?'Unassigned resource records; no farm or crop area is attributed.':farm?farms[0]?.farmName||'Selected farm':'All farms and unassigned records'} · {from||'Earliest loaded record'} to {to||'latest loaded record'}. Resource reports use the latest 200 loaded records. Farm area and crop counts are current directory values.</p>
    {(error||directory.error)&&<Alert tone="error" surface={theme}>{error||directory.error}</Alert>}
    <div className="metrics-grid dashboard-metrics"><MetricCard icon={Warehouse} label="Farms" value={directory.loading?'...':directory.error?'Unavailable':farms.length} detail="In the selected farm scope"/><MetricCard icon={Ruler} label="Registered land" value={directory.loading?'...':directory.error?'Unavailable':<>{number.format(farms.reduce((s,f)=>s+f.farmSizeHectares,0))} <small>ha</small></>} detail="Farm area, not a cultivated-area estimate"/><MetricCard icon={Sprout} label="Active crop records" value={directory.loading?'...':directory.error?'Unavailable':crops.length} detail="Stages recorded as not yet harvested"/><MetricCard icon={Droplets} label="Recorded water" value={loading?'...':error?'Unavailable':amount('WATER','L')} detail="Selected dates; litre records only"/><MetricCard icon={BarChart3} label="Recorded electricity" value={loading?'...':error?'Unavailable':amount('ENERGY','kWh')} detail="Selected dates; kWh records only"/><MetricCard icon={Leaf} label="Estimated emissions" value={loading?'...':error?'Unavailable':carbon.hasData?formatCo2e(carbon.totalCo2eKg):'—'} detail="Selected inputs; illustrative factors"/></div>
    <div className="nature-middle-grid"><section className="nature-card panel"><div className="panel-heading"><div><h2>Resource consumption</h2><p>Compare recorded periods in one resource and unit.</p></div><label className="trend-period"><span className="sr-only">Resource trend period</span><select value={months} onChange={e=>setMonths(Number(e.target.value))}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></label></div>{loading?<p role="status">Loading resource history...</p>:error?<p>Resource history unavailable.</p>:trends.length?<ResourceUsageChart trends={trends} months={months}/>:<div className="nature-empty"><h3>No resource records in this selection</h3><p>Change the filters or record usage with its date and unit.</p><Link to="/resources#resource-entry">Record usage →</Link></div>}</section>
    <section className="nature-card panel impact-summary"><div className="panel-heading"><div><h2>Environmental impact</h2><p>Based on matching source units, not field measurements.</p></div><Link to="/carbon">Methodology</Link></div>{carbon.hasData&&!error?<><div className="impact-total"><strong>{formatCo2e(carbon.totalCo2eKg)}</strong><span>illustrative estimate</span></div><ul className="impact-sources">{carbon.rows.filter(r=>r.matchedQuantity>0).map(row=><li key={row.type}><div><span>{row.label}</span><strong>{number.format(row.co2eKg)} <small>kg CO2e</small></strong></div><progress value={row.co2eKg} max={carbon.totalCo2eKg} aria-label={row.label}/></li>)}</ul></>:<div className="nature-empty"><p>{loading?'Loading estimate...':error?'Estimate unavailable.':'No supported inputs available for an estimate.'}</p></div>}<p className="nature-chart-note">Water and uncategorized inputs are excluded. {carbon.totalUnmatchedEntries} entries have unsupported units. Review factor assumptions before using these figures.</p></section></div>
    <section className="dashboard-season"><header className="section-heading"><h2>Active crops</h2><Link to="/crops">All crop plans →</Link></header>{directory.loading?<p role="status">Loading crops...</p>:crops.length?<div className="season-photo-grid">{[...crops].sort((a,b)=>a.harvestDate.localeCompare(b.harvestDate)).slice(0,4).map(crop=><article key={crop.id}><Photo asset={cropPhoto(crop)}/><div><h3><Link to={'/crops?crop='+crop.id}>{crop.name}</Link></h3><p>{crop.stage} · {directory.farms.find(f=>f.id===crop.farmId)?.farmName}</p><span>{number.format(crop.areaHectares)} ha · Planned harvest {crop.harvestDate}</span></div></article>)}</div>:<p className="season-empty">No active crops in this farm scope. Add a farm and its crop plans to begin.</p>}</section>
    <div className="nature-bottom-grid"><section className="nature-card panel"><div className="panel-heading"><h2>Farm directory</h2><Link to="/farms">Manage farms</Link></div>{farms.length?<ul className="operational-farm-list">{farms.map(f=><li key={f.id}><Link to={'/farms?q='+encodeURIComponent(f.farmName)}><div><strong>{f.farmName}</strong><span>{f.location}</span></div><span>{number.format(f.farmSizeHectares)} ha</span><ChevronRight size={15}/></Link></li>)}</ul>:<p>No farms in this scope.</p>}</section><section className="nature-card panel"><div className="panel-heading"><h2>Recent resource records</h2><Link to="/resources">View log</Link></div>{loading?<p role="status">Loading records...</p>:resources.length?<ul className="operational-records">{resources.slice(0,5).map(e=><li key={e.id}><div><strong>{RESOURCE_TYPE_LABELS[e.resourceType]}</strong><span>{e.farmId?directory.farms.find(f=>f.id===e.farmId)?.farmName||'Farm unavailable':'Unassigned'} · {e.date.slice(0,10)}</span></div><strong>{number.format(e.quantity)} {e.unit}</strong></li>)}</ul>:<p>No resource records in this selection.</p>}</section></div>
  </div>
}
