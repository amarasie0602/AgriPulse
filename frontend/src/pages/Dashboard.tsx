import { ArrowRight, Bug, CircleAlert, Droplets, Fuel, MapPin, Package, Sprout, TrendingUp, Zap, type LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { AerialFieldBackdrop } from '@/components/layout/AerialFieldBackdrop'
import { FarmSnapshot } from '@/components/layout/FarmSnapshot'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Sparkline } from '@/components/ui/TrendChart'
import { useAuth, useDocumentTitle, useProfile, useResourceEntries, useTheme } from '@/hooks'
import { RESOURCE_TYPE_LABELS, type ResourceType } from '@/types'
import { monthlyCarbonTrend } from '@/utils/analytics'
import { estimateCarbon, formatCo2e } from '@/utils/carbon'
import { RESOURCE_TYPE_COLORS } from '@/utils/resourceColors'
import { estimateSustainabilityScore } from '@/utils/sustainability'

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  WATER: Droplets,
  ENERGY: Zap,
  FERTILIZER: Sprout,
  PESTICIDE: Bug,
  FUEL: Fuel,
  OTHER: Package,
}

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Green/amber/red, matching the rest of the app's health-status convention. */
function scoreGradient(score: number): [string, string] {
  if (score >= 70) return ['#3b7a60', '#8fae86']
  if (score >= 40) return ['#c99a4b', '#e0a83e']
  return ['#9f3a3a', '#c2504a']
}

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { profile, loading, error } = useProfile()
  const { entries, summary, loading: resourcesLoading } = useResourceEntries()
  const navigate = useNavigate()
  useDocumentTitle('Dashboard')

  const firstName = user?.name?.trim().split(' ')[0] || 'there'
  const profileIncomplete = !loading && profile && (!profile.farmName || !profile.location || !profile.farmSizeHectares)
  const summaryEntries = Object.entries(summary) as [keyof typeof RESOURCE_TYPE_LABELS, number][]
  const carbonEstimate = estimateCarbon(entries)
  const carbonTrend = monthlyCarbonTrend(entries)
  const hasTrendData = carbonTrend.some((point) => point.value > 0)
  const sustainability = estimateSustainabilityScore(carbonTrend)
  const changeLabel =
    sustainability.changePercent === null
      ? 'Log usage across two months to see a trend.'
      : `${sustainability.changePercent <= 0 ? '↓' : '↑'} ${Math.abs(sustainability.changePercent).toFixed(1)}% carbon footprint vs last month`

  return (
    <div className="animate-slide-up space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-forest-700/60 shadow-card">
        <AerialFieldBackdrop className="absolute inset-0 size-full" />
        <div className="relative p-6 sm:p-8">
          <p className="text-sm font-medium text-moss-300">{timeGreeting()}</p>
          <h1 className="mt-1 font-display text-3xl leading-tight font-medium tracking-tight text-bone-50 sm:text-4xl">
            {profile?.farmName || `${firstName}'s farm`}
          </h1>
          {profile?.location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-moss-300">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {profile.location}
              {profile.farmSizeHectares ? ` · ${profile.farmSizeHectares} ha` : ''}
            </p>
          )}

          <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <ProgressRing
              value={sustainability.score}
              gradient={scoreGradient(sustainability.score)}
              label="Sustainability score"
              caption="/ 100"
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.08em] text-moss-300 uppercase">Sustainability score</p>
              <p className="mt-1 text-sm text-bone-100/85">{changeLabel}</p>
              <p className="mt-1 text-xs text-moss-300/70">Illustrative, based on your carbon footprint trend</p>
            </div>
          </div>

          {!loading && profile && profile.cropTypes.length > 0 && (
            <FarmSnapshot cropTypes={profile.cropTypes} farmSizeHectares={profile.farmSizeHectares} className="mt-7" />
          )}
        </div>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      {profileIncomplete && (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-wheat-300/60 bg-wheat-300/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-clay-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-app-heading">Complete your farm profile</p>
              <p className="mt-0.5 text-sm text-app-ink-soft">
                Add your farm name, location and size so future modules can use it.
              </p>
            </div>
          </div>
          <Button
            variant={theme === 'dark' ? 'gold' : 'primary'}
            className="shrink-0"
            onClick={() => navigate('/profile')}
          >
            Complete profile
          </Button>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Resource usage</h2>
          <Link
            to="/resources"
            className="flex items-center gap-1 text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
          >
            {summaryEntries.length > 0 ? 'View log' : 'Add an entry'}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {resourcesLoading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : summaryEntries.length === 0 ? (
          <EmptyState
            icon={Droplets}
            color={RESOURCE_TYPE_COLORS.WATER}
            title="No usage logged yet"
            description="Start tracking water, energy, or other inputs to see them here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {summaryEntries.map(([type, total]) => {
              const Icon = RESOURCE_TYPE_ICONS[type]
              const color = RESOURCE_TYPE_COLORS[type]
              return (
                <div
                  key={type}
                  className="rounded-2xl border border-app-border/70 border-l-[3px] bg-app-surface/70 p-4 shadow-card transition-transform hover:-translate-y-0.5"
                  style={{ borderLeftColor: color }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-app-ink-soft">{RESOURCE_TYPE_LABELS[type]}</p>
                  </div>
                  <p className="mt-2 font-display text-xl font-medium text-app-heading">{total} total</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Carbon impact</h2>
          <Link
            to="/carbon"
            className="flex items-center gap-1 text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
          >
            {carbonEstimate.hasData ? 'View calculator' : 'Estimate it'}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {resourcesLoading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : !carbonEstimate.hasData ? (
          <EmptyState
            icon={Sprout}
            color={RESOURCE_TYPE_COLORS.FERTILIZER}
            title="No carbon estimate yet"
            description="Log fuel, energy, fertilizer or pesticide usage to see an estimated CO₂e footprint."
          />
        ) : (
          <div className="rounded-2xl border border-app-border/70 border-l-[3px] border-l-clay-500 bg-app-surface/70 p-4 shadow-card transition-transform hover:-translate-y-0.5">
            <p className="text-sm font-semibold text-app-ink-soft">Estimated total</p>
            <p className="mt-1 font-display text-xl font-medium text-app-heading">
              {formatCo2e(carbonEstimate.totalCo2eKg)}
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Trends</h2>
          <Link
            to="/analytics"
            className="flex items-center gap-1 text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
          >
            View analytics
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {resourcesLoading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : !hasTrendData ? (
          <EmptyState
            icon={TrendingUp}
            color={RESOURCE_TYPE_COLORS.ENERGY}
            title="No trends yet"
            description="Trends build up once you've logged usage across more than one month."
          />
        ) : (
          <div className="rounded-2xl border border-app-border/70 border-l-[3px] border-l-wheat-500 bg-app-surface/70 p-4 shadow-card transition-transform hover:-translate-y-0.5">
            <p className="text-sm font-semibold text-app-ink-soft">Carbon impact, by month</p>
            <Sparkline points={carbonTrend} tone={theme} unit="kg CO₂e" className="mt-2" />
          </div>
        )}
      </div>
    </div>
  )
}
