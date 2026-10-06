import { useState, type FormEvent } from 'react'
import { LandPlot, MapPin, Plus, Ruler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle, useFarms, useTheme } from '@/hooks'

interface FormState {
  name: string
  location: string
  totalAreaHectares: string
}

function emptyForm(): FormState {
  return { name: '', location: '', totalAreaHectares: '' }
}

export default function Farms() {
  useDocumentTitle('Farms')
  const { theme } = useTheme()
  const { farms, loading, error, createFarm } = useFarms()

  const [form, setForm] = useState<FormState>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    if (name.length < 2) {
      setFormError('Farm name must be at least 2 characters.')
      return
    }

    const totalAreaHectares = Number(form.totalAreaHectares)
    if (!form.totalAreaHectares.trim() || Number.isNaN(totalAreaHectares) || totalAreaHectares < 0) {
      setFormError('Enter a valid farm size in hectares.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await createFarm({
        name,
        location: form.location.trim() || undefined,
        totalAreaHectares,
      })
      setForm(emptyForm())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this farm. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
          Farms
        </h1>
        <p className="mt-1.5 text-app-ink-soft">Track each farm and the fields inside it.</p>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card sm:grid-cols-2"
      >
        <TextField
          label="Farm name"
          tone={theme}
          leftIcon={LandPlot}
          placeholder="Green Valley Farm"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          disabled={submitting}
          className="sm:col-span-2"
        />

        <TextField
          label="Location"
          optional
          tone={theme}
          leftIcon={MapPin}
          placeholder="Kandy, Sri Lanka"
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          disabled={submitting}
        />

        <TextField
          label="Total area"
          tone={theme}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          leftIcon={Ruler}
          placeholder="e.g. 12.5"
          hint="In hectares"
          value={form.totalAreaHectares}
          onChange={(event) => setForm((current) => ({ ...current, totalAreaHectares: event.target.value }))}
          disabled={submitting}
        />

        {formError && (
          <div className="sm:col-span-2">
            <Alert tone="error" surface={theme}>
              {formError}
            </Alert>
          </div>
        )}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            variant={theme === 'dark' ? 'gold' : 'primary'}
            loading={submitting}
            loadingText="Adding…"
            leftIcon={!submitting ? <Plus className="size-4.5" aria-hidden="true" /> : undefined}
          >
            Add farm
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Your farms</h2>

        {loading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : farms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-app-border p-6 text-center text-app-ink-soft">
            No farms yet — add your first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {farms.map((farm) => (
              <li key={farm.id}>
                <Link
                  to={`/farms/${farm.id}`}
                  className="flex items-center gap-3 rounded-xl border border-app-border/70 bg-app-surface/60 p-3.5 transition-colors hover:bg-app-accent/5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-app-border bg-app-chip text-app-link">
                    <LandPlot className="size-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-app-ink">{farm.name}</p>
                    <p className="truncate text-sm text-app-ink-soft">
                      {farm.totalAreaHectares} ha
                      {farm.location ? ` · ${farm.location}` : ''}
                      {` · ${farm.fields.length} ${farm.fields.length === 1 ? 'field' : 'fields'}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
