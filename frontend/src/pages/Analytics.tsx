import { BarChart3, Bug, Droplets, Fuel, Info, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Sparkline, TrendChart } from '@/components/ui/TrendChart'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { monthlyCarbonTrend, monthlyResourceTrends } from '@/utils/analytics'
import { formatCo2e } from '@/utils/carbon'

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

  return (
    <div className="animate-slide-up max-w-4xl space-y-8">
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
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-app-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 shrink-0 text-app-link" aria-hidden="true" />
            <p className="text-app-ink-soft">Log some resource usage first — trends build up as entries come in.</p>
          </div>
          <Link
            to="/resources"
            className="shrink-0 rounded text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
          >
            Go to Resource Tracking
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">
                  Carbon impact over time
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-app-heading">{formatCo2e(totalCo2eKg)}</p>
                <p className="text-sm text-app-ink-soft">total estimated across {carbonTrend.length} month(s)</p>
              </div>
            </div>
            {carbonTrend.some((point) => point.value > 0) ? (
              <TrendChart points={carbonTrend} tone={theme} unit="kg CO₂e" className="mt-4" />
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-app-ink-soft">
                <Info className="size-3.5 shrink-0" aria-hidden="true" />
                No fuel, energy, fertilizer or pesticide entries yet — see the Carbon Calculator for details.
              </p>
            )}
          </div>

          {resourceTrends.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">
                Resource usage trends
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {resourceTrends.map((trend) => {
                  const Icon = RESOURCE_TYPE_ICONS[trend.type]
                  return (
                    <div key={trend.type} className="rounded-2xl border border-app-border/70 bg-app-surface/70 p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-lg border border-app-border bg-app-chip text-app-link">
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
