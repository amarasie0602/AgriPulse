import { BarChart3, Bug, Droplets, Fuel, Info, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { DonutChart } from '@/components/ui/DonutChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { Sparkline, TrendChart } from '@/components/ui/TrendChart'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { monthlyCarbonTrend, monthlyResourceTrends } from '@/utils/analytics'
import { estimateCarbon, formatCo2e } from '@/utils/carbon'
import { RESOURCE_TYPE_COLORS } from '@/utils/resourceColors'

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  WATER: Droplets,
  ENERGY: Zap,
  FERTILIZER: Sprout,
  PESTICIDE: Bug,
  FUEL: Fuel,
  OTHER: Package,
}

export default function Analytics() {
  useDocumentTitle('Analytics')
  const { theme } = useTheme()
  const { entries, loading, error } = useResourceEntries()

  const carbonTrend = monthlyCarbonTrend(entries)
  const resourceTrends = monthlyResourceTrends(entries)
  const totalCo2eKg = carbonTrend.reduce((sum, point) => sum + point.value, 0)
  const estimate = estimateCarbon(entries)
  const sourceRows = estimate.rows.filter((row) => row.matchedQuantity > 0)

  return (
    <div className="animate-slide-up max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
          Analytics
        </h1>
        <p className="mt-1.5 text-app-ink-soft">Trends across your resource usage and estimated carbon impact.</p>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      {loading ? (
        <p className="text-app-ink-soft">Loading…</p>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          color={RESOURCE_TYPE_COLORS.ENERGY}
          title="No trends yet"
          description="Log some resource usage first — trends build up as entries come in."
          action={
            <Link
              to="/resources"
              className="shrink-0 rounded text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
            >
              Go to Resource Tracking
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-5 shadow-card lg:col-span-3">
              <p className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">
                Carbon impact over time
              </p>
              <p className="mt-1 font-display text-2xl font-medium text-app-heading">{formatCo2e(totalCo2eKg)}</p>
              <p className="text-sm text-app-ink-soft">total estimated across {carbonTrend.length} month(s)</p>
              {carbonTrend.some((point) => point.value > 0) ? (
                <TrendChart points={carbonTrend} tone={theme} unit="kg CO₂e" className="mt-3" />
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-app-ink-soft">
                  <Info className="size-3.5 shrink-0" aria-hidden="true" />
                  No fuel, energy, fertilizer or pesticide entries yet — see the Carbon Calculator for details.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-5 shadow-card lg:col-span-2">
              <p className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Carbon sources</p>
              {sourceRows.length > 0 ? (
                <div className="mt-3 flex items-center justify-center gap-4">
                  <DonutChart
                    segments={sourceRows.map((row) => ({
                      label: row.label,
                      value: row.co2eKg,
                      color: RESOURCE_TYPE_COLORS[row.type],
                    }))}
                    centerValue={`${sourceRows.length}`}
                    centerCaption={sourceRows.length === 1 ? 'source' : 'sources'}
                    tone={theme}
                    size={128}
                    className="shrink-0"
                  />
                  <ul className="flex min-w-0 flex-col gap-1.5">
                    {sourceRows.map((row) => (
                      <li key={row.type} className="flex items-center gap-2 text-sm">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: RESOURCE_TYPE_COLORS[row.type] }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-app-ink-soft">{row.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-app-ink-soft">
                  <Info className="size-3.5 shrink-0" aria-hidden="true" />
                  No carbon-relevant entries yet.
                </p>
              )}
            </div>
          </div>

          {resourceTrends.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">
                Resource usage trends
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {resourceTrends.map((trend) => {
                  const Icon = RESOURCE_TYPE_ICONS[trend.type]
                  const color = RESOURCE_TYPE_COLORS[trend.type]
                  return (
                    <div
                      key={trend.type}
                      className="rounded-2xl border border-app-border/70 border-l-[3px] bg-app-surface/70 p-4 shadow-card transition-transform hover:-translate-y-0.5"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-app-ink-soft">{trend.label}</p>
                          <p className="font-display text-lg font-medium text-app-heading">
                            {trend.total} {trend.unit} total
                          </p>
                        </div>
                      </div>
                      <Sparkline points={trend.points} tone={theme} unit={trend.unit} className="mt-3" />
                      {trend.excludedCount > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-app-ink-soft">
                          <Info className="size-3 shrink-0" aria-hidden="true" />
                          {trend.excludedCount} {trend.excludedCount === 1 ? 'entry' : 'entries'} in a different unit,
                          not shown
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
