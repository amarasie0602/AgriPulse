import { FarmFilter } from '@/components/ui/FarmFilter'
import { useFarmDirectory } from '@/hooks/useFarmDirectory'
import { scopeResourceEntries } from '@/utils/reportScope'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Droplets, Sprout } from 'lucide-react'
import { PageHeader, PageAction, MetricCard } from '@/components/ui/Workspace'
import { LandUse } from '@/components/ui/LandUse'
import { TextField } from '@/components/ui/TextField'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { TrendChart } from '@/components/ui/TrendChart'
import { ResourceHistorySection } from '@/components/ui/ResourceHistorySection'
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from '@/types'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import { monthlyCarbonTrend } from '@/utils/analytics'
import { formatCo2e } from '@/utils/carbon'

export default function Analytics() {
  useDocumentTitle('Analytics')
  const { theme } = useTheme()
  const { entries, loading, error } = useResourceEntries()
  const directory = useFarmDirectory()
  const [farm, setFarm] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')
  const selectedEntries = scopeResourceEntries(entries, farm, from, to).filter(entry => !category || entry.resourceType === category)
  const carbonTrend = monthlyCarbonTrend(selectedEntries)
  const totalCo2eKg = carbonTrend.reduce((sum, point) => sum + (point.value ?? 0), 0)
  return <div className="app-page analytics-page">
    <PageHeader eyebrow="MEASURE & UNDERSTAND" title="Farm analytics" description="Review recorded resource consumption and estimated environmental impact." action={<PageAction to="/resources">Log resource usage</PageAction>} />
    <section aria-label="Resource analytics filters" className="resource-filters"><FarmFilter farms={directory.farms} tone={theme} value={farm} onChange={setFarm} loading={directory.loading}/><TextField label="From date" tone={theme} type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} /><TextField label="To date" tone={theme} type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /><Select label="Resource category" tone={theme} value={category} onChange={event => setCategory(event.target.value)}><option value="">All resources</option>{RESOURCE_TYPES.map(type => <option key={type} value={type}>{RESOURCE_TYPE_LABELS[type]}</option>)}</Select></section>
    <p className="report-scope">Resource metrics and charts use the selected dates within the latest 200 loaded records. Land and crop distribution show current directory areas within the farm scope.</p>
    <div className="metrics-grid"><MetricCard icon={Sprout} label="Estimated emissions" value={loading ? '...' : error ? 'Unavailable' : formatCo2e(totalCo2eKg)} detail="Illustrative estimate from selected records" accent /><MetricCard icon={BarChart3} label="Tracked resources" value={loading ? '...' : error ? 'Unavailable' : new Set(selectedEntries.map(entry => entry.resourceType)).size} detail="Categories in selected records" /><MetricCard icon={Droplets} label="Resource records" value={loading ? '...' : error ? 'Unavailable' : selectedEntries.length} detail="Selected from the latest 200 records" /></div>
    <LandUse farmId={farm} farms={directory.farms} crops={directory.crops} loading={directory.loading} error={directory.error} />
    {directory.error && <Alert tone="error" surface={theme}>{directory.error}</Alert>}
    {error ? <Alert tone="error" surface={theme}>{error}</Alert> : loading ? <p role="status">Loading resource history...</p> : <>
      {!selectedEntries.length && <div className="history-no-results"><p>{entries.length ? 'No records match these filters.' : 'No resource records yet.'}</p>{entries.length ? <button type="button" onClick={() => { setFrom(''); setTo(''); setCategory(''); setFarm('') }}>Clear filters</button> : <Link to="/resources#resource-entry">Record resource usage</Link>}</div>}
      <ResourceHistorySection entries={selectedEntries} category={category} totalLoaded={entries.length} />
      <section className="analytics-carbon-history"><header><h2>Carbon impact over time</h2><strong>{formatCo2e(totalCo2eKg)}</strong><p>Monthly estimates using the same factors as the carbon calculator. Missing months are gaps.</p></header>{carbonTrend.some(point => (point.value ?? 0) > 0) ? <TrendChart points={carbonTrend} unit="kg CO2e" label="Monthly estimated emissions" /> : <p>No supported inputs available for an emissions estimate. <Link to="/carbon">Review calculation details</Link></p>}</section>
    </>}
  </div>
}
