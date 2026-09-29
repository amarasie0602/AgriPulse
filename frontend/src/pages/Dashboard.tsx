import { BarChart3, CircleAlert, Droplets, MapPin, Sprout } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useAuth, useDocumentTitle, useProfile } from '@/hooks'

const UPCOMING_MODULES = [
  {
    icon: Droplets,
    title: 'Resource Tracking',
    description: 'Log and visualize water, energy, and input usage over time.',
  },
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
  const { profile, loading, error } = useProfile()
  const navigate = useNavigate()
  useDocumentTitle('Dashboard')

  const firstName = user?.name?.trim().split(' ')[0] || 'there'
  const profileIncomplete = !loading && profile && (!profile.farmName || !profile.location || !profile.farmSizeHectares)

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-forest-900 sm:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-ink-soft">
          {profile?.farmName ? profile.farmName : 'Your sustainability workspace is being prepared.'}
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {profileIncomplete && (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-wheat-300/60 bg-wheat-300/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-clay-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-forest-900">Complete your farm profile</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Add your farm name, location and size so future modules can use it.
              </p>
            </div>
          </div>
          <Button variant="primary" className="shrink-0" onClick={() => navigate('/profile')}>
            Complete profile
          </Button>
        </div>
      )}

      {!loading && profile && !profileIncomplete && (
        <div className="rounded-2xl border border-bone-300/70 bg-bone-50/80 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl font-medium text-forest-900">{profile.farmName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin className="size-4" aria-hidden="true" />
                {profile.location}
                {profile.farmSizeHectares ? ` · ${profile.farmSizeHectares} ha` : ''}
              </p>
            </div>
            <Link
              to="/profile"
              className="rounded text-sm font-semibold text-forest-700 underline-offset-4 hover:text-forest-900 hover:underline"
            >
              Edit profile
            </Link>
          </div>
          {profile.cropTypes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.cropTypes.map((crop) => (
                <span key={crop} className="rounded-full bg-forest-900/8 px-2.5 py-1 text-xs font-medium text-forest-900">
                  {crop}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase">Coming to your workspace</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {UPCOMING_MODULES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-bone-300/70 bg-bone-50/60 p-5 text-left"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-bone-300 bg-white text-forest-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-semibold text-forest-900">{title}</p>
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
              <span className="mt-3 inline-block rounded-full border border-bone-300 bg-bone-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-soft uppercase">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
