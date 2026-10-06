import { Bug, Droplets, Fuel, Info, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { estimateCarbon, formatCo2e } from '@/utils/carbon'

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
    <div className="animate-slide-up max-w-3xl space-y-8">
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

      <Alert tone="info" surface={theme}>
        These figures use standard, illustrative emission factors — a helpful guide, not a certified
        calculation. Water and other/uncategorized usage aren't counted toward the total below.
      </Alert>

      {loading ? (
        <p className="text-app-ink-soft">Loading…</p>
      ) : entries.length === 0 ? (
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
          <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card">
            <p className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">
              Estimated impact
            </p>
            <p className="mt-2 font-display text-4xl font-medium text-app-heading sm:text-5xl">
              {formatCo2e(estimate.totalCo2eKg)}
            </p>
            <p className="mt-1 text-sm text-app-ink-soft">{estimate.totalCo2eKg.toFixed(1)} kg CO₂e total</p>
          </div>

          {countedRows.length > 0 ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Breakdown</h2>
              <ul className="flex flex-col gap-2">
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
    </div>
  )
}
