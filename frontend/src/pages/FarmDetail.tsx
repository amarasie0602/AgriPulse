import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, MapPin, Plus, Ruler, Sprout, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle, useFarm, useTheme } from '@/hooks'
import { farmService } from '@/services'

interface FarmForm {
  name: string
  location: string
  totalAreaHectares: string
}

interface FieldForm {
  name: string
  areaHectares: string
  crop: string
}

function emptyFieldForm(): FieldForm {
  return { name: '', areaHectares: '', crop: '' }
}

export default function FarmDetail() {
  const { farmId } = useParams<{ farmId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { farm, loading, error, updateFarm, addField, removeField } = useFarm(farmId)

  useDocumentTitle(farm?.name ?? 'Farm')

  const [farmForm, setFarmForm] = useState<FarmForm>({ name: '', location: '', totalAreaHectares: '' })
  const [farmError, setFarmError] = useState<string | null>(null)
  const [farmSaved, setFarmSaved] = useState(false)
  const [savingFarm, setSavingFarm] = useState(false)
  const [removing, setRemoving] = useState(false)

  const [fieldForm, setFieldForm] = useState<FieldForm>(emptyFieldForm())
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [savingField, setSavingField] = useState(false)
  const [removingFieldId, setRemovingFieldId] = useState<string | null>(null)

  useEffect(() => {
    if (!farm) return
    setFarmForm({
      name: farm.name,
      location: farm.location ?? '',
      totalAreaHectares: farm.totalAreaHectares.toString(),
    })
  }, [farm])

  async function handleSaveFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = farmForm.name.trim()
    if (name.length < 2) {
      setFarmError('Farm name must be at least 2 characters.')
      return
    }

    const totalAreaHectares = Number(farmForm.totalAreaHectares)
    if (!farmForm.totalAreaHectares.trim() || Number.isNaN(totalAreaHectares) || totalAreaHectares < 0) {
      setFarmError('Enter a valid farm size in hectares.')
      return
    }

    setSavingFarm(true)
    setFarmError(null)
    setFarmSaved(false)
    try {
      await updateFarm({
        name,
        location: farmForm.location.trim() || undefined,
        totalAreaHectares,
      })
      setFarmSaved(true)
    } catch (err) {
      setFarmError(err instanceof Error ? err.message : 'Could not save this farm. Please try again.')
    } finally {
      setSavingFarm(false)
    }
  }

  async function handleRemoveFarm() {
    if (!farmId) return
    setRemoving(true)
    try {
      await farmService.remove(farmId)
      navigate('/farms')
    } catch (err) {
      setFarmError(err instanceof Error ? err.message : 'Could not delete this farm.')
      setRemoving(false)
    }
  }

  async function handleAddField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = fieldForm.name.trim()
    if (name.length < 2) {
      setFieldError('Field name must be at least 2 characters.')
      return
    }

    const areaHectares = Number(fieldForm.areaHectares)
    if (!fieldForm.areaHectares.trim() || Number.isNaN(areaHectares) || areaHectares < 0) {
      setFieldError('Enter a valid field area in hectares.')
      return
    }

    setSavingField(true)
    setFieldError(null)
    try {
      await addField({
        name,
        areaHectares,
        crop: fieldForm.crop.trim() || undefined,
      })
      setFieldForm(emptyFieldForm())
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Could not save this field. Please try again.')
    } finally {
      setSavingField(false)
    }
  }

  async function handleRemoveField(fieldId: string) {
    setRemovingFieldId(fieldId)
    try {
      await removeField(fieldId)
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Could not delete this field.')
    } finally {
      setRemovingFieldId(null)
    }
  }

  if (loading) {
    return <p className="text-app-ink-soft">Loading this farm…</p>
  }

  if (!farm) {
    return (
      <div className="animate-slide-up space-y-4">
        <Link
          to="/farms"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to farms
        </Link>
        <Alert tone="error" surface={theme}>
          {error ?? 'This farm could not be found.'}
        </Alert>
      </div>
    )
  }

  const usedArea = farm.fields.reduce((sum, field) => sum + field.areaHectares, 0)

  return (
    <div className="animate-slide-up max-w-2xl space-y-8">
      <div>
        <Link
          to="/farms"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-link underline-offset-4 hover:text-app-heading hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to farms
        </Link>
        <h1 className="mt-3 font-display text-3xl leading-tight font-medium tracking-tight text-app-heading">
          {farm.name}
        </h1>
        <p className="mt-1.5 text-app-ink-soft">
          {usedArea} of {farm.totalAreaHectares} ha in fields
          {farm.location ? ` · ${farm.location}` : ''}
        </p>
      </div>

      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSaveFarm} noValidate className="space-y-5 rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card">
        <TextField
          label="Farm name"
          tone={theme}
          value={farmForm.name}
          onChange={(event) => setFarmForm((current) => ({ ...current, name: event.target.value }))}
          disabled={savingFarm}
        />
        <TextField
          label="Location"
          optional
          tone={theme}
          leftIcon={MapPin}
          value={farmForm.location}
          onChange={(event) => setFarmForm((current) => ({ ...current, location: event.target.value }))}
          disabled={savingFarm}
        />
        <TextField
          label="Total area"
          tone={theme}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          leftIcon={Ruler}
          hint="In hectares"
          value={farmForm.totalAreaHectares}
          onChange={(event) => setFarmForm((current) => ({ ...current, totalAreaHectares: event.target.value }))}
          disabled={savingFarm}
        />

        {farmError && (
          <Alert tone="error" surface={theme}>
            {farmError}
          </Alert>
        )}
        {farmSaved && !farmError && (
          <Alert tone="success" surface={theme}>
            Farm details saved.
          </Alert>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant={theme === 'dark' ? 'gold' : 'primary'} loading={savingFarm} loadingText="Saving…">
            Save farm
          </Button>
          <Button type="button" variant="ghost" onClick={() => void handleRemoveFarm()} disabled={removing || savingFarm}>
            {removing ? 'Deleting…' : 'Delete farm'}
          </Button>
        </div>
      </form>

      <form
        onSubmit={handleAddField}
        noValidate
        className="grid gap-4 rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card sm:grid-cols-2"
      >
        <h2 className="font-display text-xl font-medium text-app-heading sm:col-span-2">Add a field</h2>
        <TextField
          label="Field name"
          tone={theme}
          placeholder="North paddock"
          value={fieldForm.name}
          onChange={(event) => setFieldForm((current) => ({ ...current, name: event.target.value }))}
          disabled={savingField}
          className="sm:col-span-2"
        />
        <TextField
          label="Area"
          tone={theme}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          leftIcon={Ruler}
          hint="In hectares"
          value={fieldForm.areaHectares}
          onChange={(event) => setFieldForm((current) => ({ ...current, areaHectares: event.target.value }))}
          disabled={savingField}
        />
        <TextField
          label="Crop"
          optional
          tone={theme}
          leftIcon={Sprout}
          placeholder="Rice"
          value={fieldForm.crop}
          onChange={(event) => setFieldForm((current) => ({ ...current, crop: event.target.value }))}
          disabled={savingField}
        />

        {fieldError && (
          <div className="sm:col-span-2">
            <Alert tone="error" surface={theme}>
              {fieldError}
            </Alert>
          </div>
        )}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            variant={theme === 'dark' ? 'gold' : 'primary'}
            loading={savingField}
            loadingText="Adding…"
            leftIcon={!savingField ? <Plus className="size-4.5" aria-hidden="true" /> : undefined}
          >
            Add field
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Fields</h2>
        {farm.fields.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-app-border p-6 text-center text-app-ink-soft">
            No fields yet — add one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {farm.fields.map((field) => (
              <li
                key={field.id}
                className="flex items-center gap-3 rounded-xl border border-app-border/70 bg-app-surface/60 p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-app-ink">{field.name}</p>
                  <p className="truncate text-sm text-app-ink-soft">
                    {field.areaHectares} ha
                    {field.crop ? ` · ${field.crop}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveField(field.id)}
                  disabled={removingFieldId === field.id}
                  aria-label={`Delete ${field.name}`}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-app-ink-soft transition-colors hover:bg-app-danger-bg hover:text-app-danger-text disabled:opacity-50"
                >
                  <Trash2 className="size-4.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
