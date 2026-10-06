import { useState, type FormEvent } from 'react'
import { Bug, Calendar, Droplets, Fuel, Package, Plus, Sprout, Trash2, Zap, type LucideIcon } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle, useResourceEntries, useTheme } from '@/hooks'
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_DEFAULT_UNIT,
  RESOURCE_TYPE_LABELS,
  type ResourceType,
} from '@/types'
import { RESOURCE_TYPE_COLORS } from '@/utils/resourceColors'

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  WATER: Droplets,
  ENERGY: Zap,
  FERTILIZER: Sprout,
  PESTICIDE: Bug,
  FUEL: Fuel,
  OTHER: Package,
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

interface FormState {
  resourceType: ResourceType
  quantity: string
  unit: string
  date: string
  notes: string
}

function emptyForm(): FormState {
  return { resourceType: 'WATER', quantity: '', unit: RESOURCE_TYPE_DEFAULT_UNIT.WATER, date: todayIsoDate(), notes: '' }
}

export default function ResourceTracking() {
  useDocumentTitle('Resource Tracking')
  const { theme } = useTheme()
  const { entries, summary, loading, error, addEntry, removeEntry } = useResourceEntries()

  const [form, setForm] = useState<FormState>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  function handleTypeChange(resourceType: ResourceType) {
    setForm((current) => ({
      ...current,
      resourceType,
      // Only swap the unit if it's still the previous type's default — respects a manual edit.
      unit: current.unit === RESOURCE_TYPE_DEFAULT_UNIT[current.resourceType] ? RESOURCE_TYPE_DEFAULT_UNIT[resourceType] : current.unit,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const quantity = Number(form.quantity)
    if (!form.quantity.trim() || Number.isNaN(quantity) || quantity <= 0) {
      setFormError('Enter a quantity greater than 0.')
      return
    }
    if (!form.unit.trim()) {
      setFormError('Unit is required.')
      return
    }
    if (!form.date) {
      setFormError('Date is required.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await addEntry({
        resourceType: form.resourceType,
        quantity,
        unit: form.unit.trim(),
        date: form.date,
        notes: form.notes.trim() || undefined,
      })
      setForm(emptyForm())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    try {
      await removeEntry(id)
    } catch {
      // The list simply won't change; useResourceEntries surfaces load errors separately.
    } finally {
      setRemovingId(null)
    }
  }

  const summaryTypes = RESOURCE_TYPES.filter((type) => summary[type] !== undefined)

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-app-heading sm:text-4xl">
          Resource Tracking
        </h1>
        <p className="mt-1.5 text-app-ink-soft">Log water, energy, and input usage to build a picture over time.</p>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      {summaryTypes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {summaryTypes.map((type) => {
            const Icon = RESOURCE_TYPE_ICONS[type]
            const color = RESOURCE_TYPE_COLORS[type]
            return (
              <div
                key={type}
                className="rounded-2xl border border-app-border/70 border-l-[3px] bg-app-surface/70 p-4 shadow-card transition-transform hover:-translate-y-0.5"
                style={{ borderLeftColor: color }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-app-ink-soft">{RESOURCE_TYPE_LABELS[type]}</p>
                </div>
                <p className="mt-2 font-display text-2xl font-medium text-app-heading">
                  {summary[type]} <span className="text-base font-sans font-medium text-app-ink-soft">total</span>
                </p>
              </div>
            )
          })}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card sm:grid-cols-2"
      >
        <Select
          label="Resource Type"
          tone={theme}
          value={form.resourceType}
          onChange={(event) => handleTypeChange(event.target.value as ResourceType)}
          disabled={submitting}
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {RESOURCE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>

        <TextField
          label="Date"
          tone={theme}
          type="date"
          leftIcon={Calendar}
          value={form.date}
          max={todayIsoDate()}
          onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          disabled={submitting}
        />

        <TextField
          label="Quantity"
          tone={theme}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          placeholder="e.g. 500"
          value={form.quantity}
          onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
          disabled={submitting}
        />

        <TextField
          label="Unit"
          tone={theme}
          placeholder="e.g. L, kWh, kg"
          value={form.unit}
          onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
          disabled={submitting}
        />

        <TextField
          label="Notes"
          optional
          tone={theme}
          className="sm:col-span-2"
          placeholder="Optional detail, e.g. which field"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
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
            Add entry
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Recent entries</h2>

        {loading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-app-border p-6 text-center text-app-ink-soft">
            No entries yet — add your first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const Icon = RESOURCE_TYPE_ICONS[entry.resourceType]
              const color = RESOURCE_TYPE_COLORS[entry.resourceType]
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-app-border/70 bg-app-surface/60 p-3.5 transition-colors hover:bg-app-surface/90"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-app-ink">
                      {entry.quantity} {entry.unit}{' '}
                      <span className="font-normal text-app-ink-soft">· {RESOURCE_TYPE_LABELS[entry.resourceType]}</span>
                    </p>
                    <p className="truncate text-sm text-app-ink-soft">
                      {new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      {entry.notes ? ` · ${entry.notes}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    disabled={removingId === entry.id}
                    aria-label="Delete entry"
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-app-ink-soft transition-colors hover:bg-app-danger-bg hover:text-app-danger-text disabled:opacity-50"
                  >
                    <Trash2 className="size-4.5" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
