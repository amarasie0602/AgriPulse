import { Bug, Droplets, Fuel, Info, Leaf, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { DonutChart } from '@/components/ui/DonutChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { CARBON_TYPE_COLORS, estimateCarbon, formatCo2e } from '@/utils/carbon'

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

  const estimate = estimateCarbon(entries)
  const countedRows = estimate.rows.filter((row) => row.matchedQuantity > 0)

  return (
    <div className="animate-slide-up max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
          Carbon Calculator
        </h1>
        <p className="mt-1.5 text-app-ink-soft">
          An estimate of your farm's CO₂e footprint, calculated from your Resource Tracking log.
        </p>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      <Alert tone="info" surface={theme} className="text-sm">
        Illustrative emission factors, not a certified calculation. Water and other/uncategorized usage aren't
        counted toward the total.
      </Alert>

      {loading ? (
        <p className="text-app-ink-soft">Loading…</p>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Leaf}
          color={CARBON_TYPE_COLORS.FERTILIZER}
          title="No estimate yet"
          description="Log some resource usage first — fuel, energy or fertilizer entries feed this estimate."
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
          {countedRows.length > 0 ? (
            <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-5 shadow-card sm:p-6">
              <p className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Estimated impact</p>
              <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                <DonutChart
                  segments={countedRows.map((row) => ({
                    label: row.label,
                    value: row.co2eKg,
                    color: CARBON_TYPE_COLORS[row.type as keyof typeof CARBON_TYPE_COLORS],
                  }))}
                  centerValue={formatCo2e(estimate.totalCo2eKg)}
                  centerCaption="total"
                  tone={theme}
                  className="shrink-0"
                />
                <ul className="flex w-full min-w-0 flex-col gap-2">
                  {countedRows.map((row) => {
                    const Icon = RESOURCE_TYPE_ICONS[row.type]
                    const percent = estimate.totalCo2eKg > 0 ? (row.co2eKg / estimate.totalCo2eKg) * 100 : 0
                    return (
                      <li key={row.type} className="flex items-center gap-2.5">
                        <span
                          className="grid size-7 shrink-0 place-items-center rounded-lg text-white"
                          style={{ backgroundColor: CARBON_TYPE_COLORS[row.type as keyof typeof CARBON_TYPE_COLORS] }}
                        >
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-app-ink">{row.label}</p>
                          {row.unmatchedEntryCount > 0 && (
                            <p className="flex items-center gap-1 text-xs text-app-ink-soft">
                              <Info className="size-3 shrink-0" aria-hidden="true" />
                              {row.unmatchedEntryCount} not counted
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-right font-display text-sm font-medium text-app-heading">
                          {row.co2eKg.toFixed(1)} kg
                          <span className="ml-1.5 text-xs font-normal text-app-ink-soft">{percent.toFixed(0)}%</span>
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
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
    </div>
  )
}
