import { ArrowRight, Bug, CircleAlert, Droplets, Fuel, MapPin, Package, Sprout, Zap, type LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Sparkline } from '@/components/ui/TrendChart'
import { useAuth, useDocumentTitle, useProfile, useResourceEntries, useTheme } from '@/hooks'
import { RESOURCE_TYPE_LABELS, type ResourceType } from '@/types'
import { monthlyCarbonTrend } from '@/utils/analytics'
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

  return (
    <div className="animate-slide-up space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              theme === 'dark'
                ? 'radial-gradient(120% 140% at 0% 0%, rgba(224,168,62,0.16), transparent 55%), radial-gradient(120% 140% at 100% 100%, rgba(91,156,95,0.14), transparent 55%)'
                : 'radial-gradient(120% 140% at 0% 0%, rgba(224,168,62,0.14), transparent 55%), radial-gradient(120% 140% at 100% 100%, rgba(91,156,95,0.12), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-app-ink-soft">
            {profile?.farmName ? profile.farmName : 'Your sustainability workspace is being prepared.'}
          </p>
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

      {!loading && profile && !profileIncomplete && (
        <div className="rounded-2xl border border-app-border/70 bg-app-surface/80 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl font-medium text-app-heading">{profile.farmName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-app-ink-soft">
                <MapPin className="size-4" aria-hidden="true" />
                {profile.location}
                {profile.farmSizeHectares ? ` · ${profile.farmSizeHectares} ha` : ''}
              </p>
            </div>
            <Link
              to="/profile"
              className="rounded text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
            >
              Edit profile
            </Link>
          </div>
          {profile.cropTypes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.cropTypes.map((crop) => (
                <span key={crop} className="rounded-full bg-app-accent/8 px-2.5 py-1 text-xs font-medium text-app-heading">
                  {crop}
                </span>
              ))}
            </div>
          )}
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
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-app-border p-5">
            <Droplets className="size-5 shrink-0 text-app-link" aria-hidden="true" />
            <p className="text-app-ink-soft">No usage logged yet — start tracking water, energy, or other inputs.</p>
          </div>
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
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-app-border p-5">
            <Sprout className="size-5 shrink-0 text-app-link" aria-hidden="true" />
            <p className="text-app-ink-soft">
              Log fuel, energy, fertilizer or pesticide usage to see an estimated CO₂e footprint.
            </p>
          </div>
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
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-app-border p-5">
            <Droplets className="size-5 shrink-0 text-app-link" aria-hidden="true" />
            <p className="text-app-ink-soft">Trends build up once you've logged usage across more than one month.</p>
          </div>
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
