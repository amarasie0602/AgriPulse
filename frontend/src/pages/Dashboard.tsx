import { ArrowRight, BarChart3, CircleAlert, Droplets, MapPin, Sprout } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useAuth, useDocumentTitle, useProfile, useResourceEntries, useTheme } from '@/hooks'
import { RESOURCE_TYPE_LABELS } from '@/types'

const UPCOMING_MODULES = [
  {
    icon: Sprout,
    title: 'Carbon Calculator',
    description: 'Estimate the CO₂e impact of your farm activities and inputs.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Trends and comparisons across your resource and impact data.',
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { profile, loading, error } = useProfile()
  const { summary, loading: resourcesLoading } = useResourceEntries()
  const navigate = useNavigate()
  useDocumentTitle('Dashboard')

  const firstName = user?.name?.trim().split(' ')[0] || 'there'
  const profileIncomplete = !loading && profile && (!profile.farmName || !profile.location || !profile.farmSizeHectares)
  const summaryEntries = Object.entries(summary) as [keyof typeof RESOURCE_TYPE_LABELS, number][]

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-app-ink-soft">
          {profile?.farmName ? profile.farmName : 'Your sustainability workspace is being prepared.'}
        </p>
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
            {summaryEntries.map(([type, total]) => (
              <div key={type} className="rounded-2xl border border-app-border/70 bg-app-surface/70 p-4">
                <p className="text-sm font-semibold text-app-ink-soft">{RESOURCE_TYPE_LABELS[type]}</p>
                <p className="mt-1 font-display text-xl font-medium text-app-heading">{total} total</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Coming to your workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {UPCOMING_MODULES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-app-border/70 bg-app-surface/60 p-5 text-left"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-app-border bg-app-chip text-app-link">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-semibold text-app-heading">{title}</p>
              <p className="mt-1 text-sm text-app-ink-soft">{description}</p>
              <span className="mt-3 inline-block rounded-full border border-app-border bg-app-bg px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-app-ink-soft uppercase">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
