import { Bug, Droplets, Fuel, Info, Leaf, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { ContourLines } from '@/components/layout/ContourLines'
import { DonutChart } from '@/components/ui/DonutChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import type { ResourceType } from '@/types'
import { monthOverMonthChange, monthlyCarbonTrend } from '@/utils/analytics'
import { CARBON_TYPE_COLORS, estimateCarbon, formatCo2e } from '@/utils/carbon'

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  WATER: Droplets,
  ENERGY: Zap,
  FERTILIZER: Sprout,
  PESTICIDE: Bug,
  FUEL: Fuel,
  OTHER: Package,
}

/** Evenly-spaced points around a circle of the given radius, starting at the top. */
function orbitPosition(index: number, count: number, radius: number): { x: number; y: number } {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

export default function CarbonCalculator() {
  useDocumentTitle('Carbon Calculator')
  const { theme } = useTheme()
  const { entries, loading, error } = useResourceEntries()

  const estimate = estimateCarbon(entries)
  const countedRows = estimate.rows.filter((row) => row.matchedQuantity > 0)
  const changePercent = monthOverMonthChange(monthlyCarbonTrend(entries))

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
            <div className="relative overflow-hidden rounded-2xl border border-forest-700/60 shadow-card">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(90% 90% at 50% 0%, rgba(91,156,95,0.16), transparent 60%)' }}
                aria-hidden="true"
              />
              <ContourLines className="pointer-events-none absolute inset-0 size-full opacity-50" />

              <div className="relative flex flex-col items-center gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-around">
                <div className="relative grid shrink-0 place-items-center" style={{ width: 300, height: 300 }}>
                  <DonutChart
                    segments={countedRows.map((row) => ({
                      label: row.label,
                      value: row.co2eKg,
                      color: CARBON_TYPE_COLORS[row.type as keyof typeof CARBON_TYPE_COLORS],
                    }))}
                    centerValue={formatCo2e(estimate.totalCo2eKg)}
                    centerCaption="estimated total"
                    tone="dark"
                    size={176}
                  />
                  {countedRows.map((row, index) => {
                    const Icon = RESOURCE_TYPE_ICONS[row.type]
                    const color = CARBON_TYPE_COLORS[row.type as keyof typeof CARBON_TYPE_COLORS]
                    const { x, y } = orbitPosition(index, countedRows.length, 128)
                    return (
                      <div
                        key={row.type}
                        className="absolute flex flex-col items-center gap-1"
                        style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                      >
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-full text-white ring-4 ring-forest-900"
                          style={{ backgroundColor: color }}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-forest-950/70 px-1.5 py-0.5 text-[0.65rem] font-medium whitespace-nowrap text-bone-100">
                          {row.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="w-full max-w-sm">
                  <p className="text-xs font-semibold tracking-[0.08em] text-moss-300 uppercase">
                    Estimated carbon footprint
                  </p>
                  <p className="mt-1 text-sm text-bone-100/85">
                    {changePercent === null
                      ? 'Log usage across two months to see a trend.'
                      : `${changePercent <= 0 ? '↓' : '↑'} ${Math.abs(changePercent).toFixed(1)}% vs your previous period`}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {countedRows.map((row) => {
                      const percent = estimate.totalCo2eKg > 0 ? (row.co2eKg / estimate.totalCo2eKg) * 100 : 0
                      return (
                        <li key={row.type} className="flex items-center gap-2.5">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: CARBON_TYPE_COLORS[row.type as keyof typeof CARBON_TYPE_COLORS] }}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm text-bone-100/90">{row.label}</span>
                          <span className="shrink-0 text-sm font-medium text-bone-50">
                            {row.co2eKg.toFixed(1)} kg <span className="text-bone-100/60">· {percent.toFixed(0)}%</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
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
