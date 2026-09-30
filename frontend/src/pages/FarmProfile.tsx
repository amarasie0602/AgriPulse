import { useEffect, useState, type FormEvent } from 'react'
import { MapPin, Ruler, Sprout } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ChipInput } from '@/components/ui/ChipInput'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle, useProfile } from '@/hooks'
import { validateFarmName } from '@/utils/validators'

const AUTH_PROVIDER_LABEL: Record<string, string> = {
  local: 'Email & password',
  google: 'Google',
  both: 'Email & password, and Google',
}

interface FormState {
  farmName: string
  location: string
  farmSizeHectares: string
  cropTypes: string[]
}

const EMPTY_FORM: FormState = { farmName: '', location: '', farmSizeHectares: '', cropTypes: [] }

export default function FarmProfile() {
  useDocumentTitle('Farm Profile')
  const { profile, loading, error, updateProfile } = useProfile()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [farmNameError, setFarmNameError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Populate the form once the profile has loaded — a plain effect, since
  // this is a one-time sync from server state into local editable state.
  useEffect(() => {
    if (!profile) return
    setForm({
      farmName: profile.farmName ?? '',
      location: profile.location ?? '',
      farmSizeHectares: profile.farmSizeHectares?.toString() ?? '',
      cropTypes: profile.cropTypes,
    })
  }, [profile])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nameError = validateFarmName(form.farmName)
    setFarmNameError(nameError)
    if (nameError) return

    const size = form.farmSizeHectares.trim() ? Number(form.farmSizeHectares) : undefined
    if (size !== undefined && (Number.isNaN(size) || size < 0)) {
      setSubmitError('Enter a valid farm size in hectares.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setSaved(false)
    try {
      await updateProfile({
        farmName: form.farmName.trim() || undefined,
        location: form.location.trim() || undefined,
        farmSizeHectares: size,
        cropTypes: form.cropTypes,
      })
      setSaved(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save your changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-ink-soft">Loading your farm profile…</p>
  }

  return (
    <div className="animate-slide-up max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-forest-900">
          Farm Profile
        </h1>
        <p className="mt-1.5 text-ink-soft">This powers the modules being built next — keep it up to date.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-bone-300/70 bg-bone-50/80 p-6 shadow-card">
        <TextField
          label="Farm Name"
          value={form.farmName}
          onChange={(event) => setForm((current) => ({ ...current, farmName: event.target.value }))}
          onBlur={() => setFarmNameError(validateFarmName(form.farmName))}
          error={farmNameError}
          leftIcon={Sprout}
          placeholder="Green Valley Farm"
          disabled={submitting}
        />

        <TextField
          label="Location"
          optional
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          leftIcon={MapPin}
          placeholder="Kandy, Sri Lanka"
          disabled={submitting}
        />

        <TextField
          label="Farm Size"
          optional
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          value={form.farmSizeHectares}
          onChange={(event) => setForm((current) => ({ ...current, farmSizeHectares: event.target.value }))}
          leftIcon={Ruler}
          placeholder="e.g. 12.5"
          hint="In hectares"
          disabled={submitting}
        />

        <ChipInput
          label="Crop Types"
          values={form.cropTypes}
          onChange={(cropTypes) => setForm((current) => ({ ...current, cropTypes }))}
          placeholder="Type a crop and press Enter"
          hint="Up to 12"
          disabled={submitting}
        />

        {submitError && <Alert tone="error">{submitError}</Alert>}
        {saved && !submitError && <Alert tone="success">Your farm profile has been saved.</Alert>}

        <Button type="submit" loading={submitting} loadingText="Saving…">
          Save changes
        </Button>
      </form>

      {profile && (
        <div className="rounded-2xl border border-bone-300/70 bg-bone-50/60 p-6">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase">Account</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-soft">Email</dt>
              <dd className="font-medium text-ink">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Role</dt>
              <dd className="font-medium text-ink">{profile.role}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Signed in with</dt>
              <dd className="font-medium text-ink">{AUTH_PROVIDER_LABEL[profile.authProvider] ?? profile.authProvider}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
