import { useState } from 'react'
import type { ResourceTypeTrend } from '@/utils/analytics'
import { TrendChart } from './TrendChart'

/** Compare dates within one resource/unit at a time; mixed units never share a vertical scale. */
export function ResourceUsageChart({ trends, months }: { trends: ResourceTypeTrend[]; months: number }) {
  const [selected, setSelected] = useState('')
  const series = trends.find(trend => `${trend.type}:${trend.unit}` === selected) ?? trends[0]
  if (!series) return null
  const now = new Date()
  const cutoff = new Date(Date.UTC(now.getFullYear(), now.getMonth() - months + 1, 1)).toISOString().slice(0, 10)
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)).toISOString().slice(0, 10)
  const points = series.points.filter(point => point.key >= cutoff && point.key < end)
  const observations = points.filter(point => point.value !== null)
  return <div className="dashboard-resource-history">
    <label>Resource<select aria-label="Dashboard chart resource" value={`${series.type}:${series.unit}`} onChange={event => setSelected(event.target.value)}>{trends.map(trend => <option key={`${trend.type}:${trend.unit}`} value={`${trend.type}:${trend.unit}`}>{trend.label} ({trend.unit})</option>)}</select></label>
    {observations.length === 1 && <p className="history-limited">One recorded month. More history is needed to show a trend.</p>}
    {observations.length ? <TrendChart key={`${series.type}:${series.unit}:${months}`} points={points} unit={series.unit} label={`${series.label} monthly consumption`} /> : <p className="history-empty">No {series.label.toLowerCase()} records in the last {months} months.</p>}
  </div>
}
