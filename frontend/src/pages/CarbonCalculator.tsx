import { useState } from 'react'
import { FarmFilter } from '@/components/ui/FarmFilter'
import { TextField } from '@/components/ui/TextField'
import { useFarmDirectory } from '@/hooks/useFarmDirectory'
import { scopeResourceEntries } from '@/utils/reportScope'
import { TrendChart } from '@/components/ui/TrendChart'
import { monthlyCarbonTrend } from '@/utils/analytics'
import { PageHeader, PageAction } from '@/components/ui/Workspace'
import { Bug, Droplets, Fuel, Info, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { EMISSION_FACTORS, FACTOR_VERSION, estimateCarbon, formatCo2e } from '@/utils/carbon'

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  WATER: Droplets,
  ENERGY: Zap,
  FERTILIZER: Sprout,
  PESTICIDE: Bug,
  FUEL: Fuel,
  OTHER: Package,
}

export default function CarbonCalculator() {
  useDocumentTitle('Carbon Calculator')
  const { theme } = useTheme()
  const { entries, loading, error } = useResourceEntries()

  const directory = useFarmDirectory()
  const [farm,setFarm] = useState(''), [from,setFrom] = useState(''), [to,setTo] = useState('')
  const selectedEntries = scopeResourceEntries(entries,farm,from,to)
  const estimate = estimateCarbon(selectedEntries)
  const history = monthlyCarbonTrend(selectedEntries)
  let cumulative = 0
  const colors = ['#234e37','#729653','#b0c38a','#c9ad76']
  const segments = estimate.rows.filter(row => row.co2eKg > 0).map((row,index) => {const start=cumulative;cumulative+=row.co2eKg/estimate.totalCo2eKg*100;return `${colors[index%colors.length]} ${start}% ${cumulative}%`})
  const countedRows = estimate.rows.filter((row) => row.matchedQuantity > 0)

  return (
    <div className="app-page carboncalculator-page animate-slide-up space-y-8">
      <PageHeader eyebrow="ENVIRONMENTAL IMPACT" title={`Carbon calculator`} description="Understand where your emissions come from and what contributes most." action={<PageAction to="/resources">Manage resource log</PageAction>} />

      <section className="report-controls" aria-label="Carbon reporting filters"><FarmFilter farms={directory.farms} tone={theme} value={farm} onChange={setFarm} loading={directory.loading}/><TextField label="From date" tone={theme} type="date" value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/><TextField label="To date" tone={theme} type="date" value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></section>
      {directory.error && <Alert tone="error" surface={theme}>{directory.error}</Alert>}
      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      <section className="carbon-report-summary" aria-label="Carbon estimate summary"><div className="carbon-report-total"><span className="eyebrow">ESTIMATED EMISSIONS</span><strong>{loading ? '...' : error ? 'Unavailable' : formatCo2e(estimate.totalCo2eKg)}</strong><p>From up to 200 recent resource records. An illustrative estimate, not a certified footprint.</p><Link to="/resources">Review source records <Info size={15} aria-hidden="true" /></Link></div><div className="carbon-report-context">{estimate.hasData && !error && <div className="emissions-donut" role="img" aria-label={`Total estimated emissions: ${formatCo2e(estimate.totalCo2eKg)}`} style={{background:`conic-gradient(${segments.join(',')})`}}><div><strong>{formatCo2e(estimate.totalCo2eKg)}</strong><span>Estimated</span></div></div>}<div><span>Contributing sources</span><strong>{loading ? '...' : error ? 'Unavailable' : countedRows.length}</strong></div><div><span>Resource records reviewed</span><strong>{loading ? '...' : error ? 'Unavailable' : selectedEntries.length}</strong></div><p>Record inputs in their matching units. AgriPulse applies the existing factor for each supported source.</p></div></section>
      <Alert tone="info" surface={theme}>
        These figures use unverified project defaults, retained for comparison with existing estimates. They are illustrative, not a certified footprint. Water and uncategorized inputs are excluded. </Alert>

      {loading ? (
        <p className="text-app-ink-soft">Loading…</p>
      ) : selectedEntries.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-app-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-app-ink-soft">Log some resource usage first — fuel, energy or fertilizer entries feed this estimate.</p>
          <Link
            to="/resources"
            className="shrink-0 rounded text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
          >
            Go to Resource Tracking
          </Link>
        </div>
      ) : (
        <>
          {countedRows.length > 0 ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Breakdown</h2>
              <ul className="emissions-list flex flex-col gap-2">
                {countedRows.map((row) => {
                  const Icon = RESOURCE_TYPE_ICONS[row.type]
                  return (
                    <li
                      key={row.type}
                      className="flex items-center gap-3 rounded-xl border border-app-border/70 bg-app-surface/60 p-3.5"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-chip text-app-link">
                        <Icon className="size-4.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-app-ink">
                          {row.label}{' '}
                          <span className="font-normal text-app-ink-soft">
                            · {row.matchedQuantity} {row.unit} × {row.factorKgCo2ePerUnit} kg CO₂e/{row.unit}
                          </span>
                        </p>
                        {row.unmatchedEntryCount > 0 && (
                          <p className="flex items-center gap-1 text-sm text-app-ink-soft">
                            <Info className="size-3.5 shrink-0" aria-hidden="true" />
                            {row.unmatchedEntryCount} {row.unmatchedEntryCount === 1 ? 'entry' : 'entries'} logged in
                            a different unit, not counted
                          </p>
                        )}
                      </div>
                      <div className="emission-share"><span>{estimate.totalCo2eKg > 0 ? Math.round(row.co2eKg / estimate.totalCo2eKg * 100) : 0}%</span><div><i style={{ width: `${estimate.totalCo2eKg > 0 ? row.co2eKg / estimate.totalCo2eKg * 100 : 0}%` }} /></div></div>
                      <p className="shrink-0 font-display text-lg font-medium text-app-heading">
                        {row.co2eKg.toFixed(1)} <span className="font-sans text-sm font-medium">kg</span>
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <Alert tone="info" surface={theme}>
              None of your logged entries match a carbon-relevant type and unit yet (fuel in L, energy in kWh,
              fertilizer in kg, or pesticide in L). Add one on the{' '}
              <Link to="/resources" className="font-semibold underline underline-offset-2">
                Resource Tracking
              </Link>{' '}
              page to see it here.
            </Alert>
          )}
        </>
      )}
      <section className="factor-methodology"><h2>Calculation assumptions</h2><p>Quantity × factor = estimated kg CO2e. Factor set: {FACTOR_VERSION}. No regional, supplier, lifecycle-boundary or source-year verification is available for these legacy defaults. Do not use this report for compliance or carbon-credit claims.</p><div className="resource-table-scroll"><table className="resource-record-table"><caption>Legacy factor register — all sources unverified</caption><thead><tr><th>Source assumption</th><th>Factor</th><th>Limitations</th></tr></thead><tbody>{EMISSION_FACTORS.map(factor=><tr key={factor.type}><td>{factor.label}</td><td>{factor.kgCo2ePerUnit} kg CO2e/{factor.unit}</td><td>{factor.assumption}</td></tr>)}</tbody></table></div><p>Fuel is assumed to be diesel; generic fertilizer records are assumed to represent nitrogen fertilizer. Product composition and application emissions are not recorded. Unsupported units are excluded without conversion. Missing months remain gaps.</p></section>
      {!loading && !error && history.length > 0 && <section className="analytics-carbon-history"><h2>Emissions over time</h2><p className="nature-chart-note">Monthly totals from recorded inputs. Missing months are gaps, not zero emissions.</p><TrendChart points={history} unit="kg CO2e" label="Historical estimated carbon emissions" /></section>}
    </div>
  )
}
