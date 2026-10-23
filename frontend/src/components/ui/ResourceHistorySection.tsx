import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ResourceEntry, ResourceType } from '@/types'
import { resourceHistory, validHistoryEntry, type HistoryPeriod } from '@/utils/resourceHistory'
import { TrendChart } from './TrendChart'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 })
export function ResourceHistorySection({ entries, category, totalLoaded }: { entries: ResourceEntry[]; category: string; totalLoaded: number }) {
  const [period, setPeriod] = useState<HistoryPeriod>('day')
  const histories = resourceHistory(entries, period).filter(series => !category || series.type === category as ResourceType)
  const invalid = entries.filter(entry => !validHistoryEntry(entry)).length
  return <section className="resource-history-section" aria-labelledby="resource-history-title">
    <header className="history-section-heading"><div><h2 id="resource-history-title">Resource usage trends</h2><p>Recorded consumption by {period}. Different units stay separate; gaps mean no record.</p></div><label>Group by<select aria-label="Trend grouping" value={period} onChange={event => setPeriod(event.target.value as HistoryPeriod)}><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option></select></label></header>
    <p className="history-coverage">Based on {totalLoaded} loaded resource {totalLoaded === 1 ? 'record' : 'records'}{totalLoaded >= 200 ? ' (the latest 200; older records are not included)' : ''}. Dates use the recorded usage date, not the date an entry was created.{invalid > 0 && ` ${invalid} invalid records excluded.`}</p>
    <div className="resource-history-grid">{histories.map(series => <article key={`${series.id}:${period}`} className="resource-history-card" data-resource={series.type} data-unit={series.unit}>
      <header><div><h3>{series.label}</h3><p>{series.recordCount} {series.recordCount === 1 ? 'record' : 'records'} · {series.periodCount} recorded {period}{series.periodCount === 1 ? '' : 's'}</p></div><div className="history-total"><strong>{number.format(series.total)}</strong><span>{series.unit} recorded</span></div></header>
      {series.recordCount ? <>
        {series.periodCount === 1 && <p className="history-limited">Limited history: one recorded {period}. More dated records are needed to show a trend.</p>}
        <TrendChart points={series.points} unit={series.unit} label={`${series.label} consumption by ${period}`} />
      </> : <div className="history-empty"><p>No {series.label.toLowerCase()} records in this selection.</p><span>Add usage with a date and quantity to begin tracking history.</span><Link to="/resources#resource-entry">Record usage</Link></div>}
    </article>)}</div>
  </section>
}
