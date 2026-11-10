import { FarmFilter } from '@/components/ui/FarmFilter'
import { useFarmDirectory } from '@/hooks/useFarmDirectory'
import { scopeResourceEntries } from '@/utils/reportScope'
import { ResourceHistorySection } from '@/components/ui/ResourceHistorySection'
import { PageHeader, PageAction } from '@/components/ui/Workspace'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Bug, Calendar, Droplets, Fuel, Package, Plus, Pencil, Sprout, Trash2, Zap, type LucideIcon } from 'lucide-react'
import { resourceService } from '@/services/resourceService'
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
  farmId: string
  cropId: string
  resourceType: ResourceType
  quantity: string
  unit: string
  date: string
  notes: string
}

function emptyForm(): FormState {
  return { farmId: '', cropId: '', resourceType: 'WATER', quantity: '', unit: RESOURCE_TYPE_DEFAULT_UNIT.WATER, date: todayIsoDate(), notes: '' }
}

export default function ResourceTracking() {
  const { hash } = useLocation()
  const entryForm = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (hash !== '#resource-entry') return
    const frame = requestAnimationFrame(() => {
      entryForm.current?.scrollIntoView({ block: 'start' })
      entryForm.current?.querySelector('select')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash])
  useDocumentTitle('Resource Tracking')
  const { theme } = useTheme()
  const { entries, loading, error, addEntry, removeEntry, refresh } = useResourceEntries()

  const directory = useFarmDirectory()
  const [farmFilter, setFarmFilter] = useState('')
  const [cropFilter, setCropFilter] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [order, setOrder] = useState('newest')
  const [saved, setSaved] = useState('')
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
    if (submitting) return

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
      const input = {
        farmId: form.farmId || null,
        cropId: form.cropId || null,
        resourceType: form.resourceType,
        quantity,
        unit: form.unit.trim(),
        date: form.date,
        notes: form.notes.trim() || undefined,
      }
      if (editing) { await resourceService.update(editing, input); await refresh() } else await addEntry(input)
      setEditing(null)
      setSaved('Resource record saved.')
      setForm(emptyForm())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm('Permanently delete this resource entry?')) return
    setRemovingId(id)
    try {
      await removeEntry(id)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not delete this entry. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  const scopedEntries = scopeResourceEntries(entries, farmFilter, fromDate, toDate, cropFilter)
  const visibleEntries = scopedEntries.filter(entry => (!typeFilter || entry.resourceType === typeFilter) && ((entry.notes ?? '') + ' ' + RESOURCE_TYPE_LABELS[entry.resourceType] + ' ' + entry.unit).toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => order === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
  const unitGroups = new Map<string, { type: ResourceType; unit: string; quantity: number }>()
  for (const entry of visibleEntries) {
    const key = entry.resourceType + ':' + entry.unit.trim().toLowerCase()
    const group = unitGroups.get(key) ?? { type: entry.resourceType, unit: entry.unit, quantity: 0 }
    group.quantity += entry.quantity; unitGroups.set(key, group)
  }
  const summaries = [...unitGroups.values()]

  return (
    <div className="app-page resourcetracking-page animate-slide-up space-y-8">
      <PageHeader eyebrow="FARM OPERATIONS" title={`Resource tracking`} description="Keep every input in view. Record usage and follow your farm's activity." action={<PageAction to="/analytics">View analytics</PageAction>} />

      {directory.error && <Alert tone="error" surface={theme}>{directory.error}</Alert>}
      <section className="report-controls" aria-label="Resource reporting filters"><FarmFilter farms={directory.farms} loading={directory.loading} tone={theme} value={farmFilter} onChange={value => { setFarmFilter(value); setCropFilter('') }} /><Select label="Reporting crop" tone={theme} value={cropFilter} onChange={e => setCropFilter(e.target.value)}><option value="">All crop assignments</option>{directory.crops.filter(crop => !farmFilter || crop.farmId === farmFilter).map(crop => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</Select></section>
      {saved && <Alert tone="success" surface={theme}>{saved}</Alert>}
      {error && (
        <Alert tone="error" surface={theme}>
          {error}
        </Alert>
      )}

      {summaries.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {summaries.map(({ type, unit, quantity }) => {
            const Icon = RESOURCE_TYPE_ICONS[type]
            return (
              <div key={type + unit} className="rounded-2xl border border-app-border/70 bg-app-surface/70 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-lg border border-app-border bg-app-chip text-app-link">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-app-ink-soft">{RESOURCE_TYPE_LABELS[type]}</p>
                </div>
                <p className="mt-2 font-display text-2xl font-medium text-app-heading">
                  {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(quantity)} {unit} <span className="text-base font-sans font-medium text-app-ink-soft">in selected records</span>
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div className="resource-workspace"><form id="resource-entry" ref={entryForm}
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 rounded-2xl border border-app-border/70 bg-app-surface/80 p-6 shadow-card sm:grid-cols-2"
      >
        <div className="form-section-heading sm:col-span-2"><span className="eyebrow">{editing ? 'EDIT RECORD' : 'NEW ENTRY'}</span><h2>{editing ? 'Edit resource usage' : 'Record resource usage'}</h2><p>Enter the quantity and date for this resource.</p></div>
        <Select label="Assigned farm" tone={theme} value={form.farmId} disabled={submitting || directory.loading} onChange={e => setForm(current => ({...current, farmId:e.target.value, cropId:''}))}><option value="">Unassigned</option>{directory.farms.map(farm => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}</Select>
        <Select label="Assigned crop" tone={theme} value={form.cropId} disabled={submitting || !form.farmId || directory.loading} onChange={e => setForm(current => ({...current,cropId:e.target.value}))}><option value="">No crop assignment</option>{directory.crops.filter(crop => crop.farmId === form.farmId).map(crop => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</Select>
        <p className="report-scope sm:col-span-2">Assignments are optional. Existing records remain unassigned until you edit them.</p>
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
            loadingText="Adding..."
            leftIcon={!submitting ? <Plus className="size-4.5" aria-hidden="true" /> : undefined}
          >
            {editing ? 'Save entry' : 'Add entry'}
          </Button>{editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm(emptyForm()); setFormError(null) }}>Cancel edit</Button>}
        </div>
      </form></div>

      <div className="resource-records-panel">
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-app-ink-soft uppercase">Recent entries</h2><p className="text-sm text-app-ink-soft mb-4">Latest 200 records. Summaries keep different units separate.</p>

        <div className="resource-filters"><TextField tone={theme} label="Search records" value={query} onChange={event => setQuery(event.target.value)} type="search" /><Select tone={theme} label="Resource category" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option value="">All resources</option>{RESOURCE_TYPES.map(type => <option key={type} value={type}>{RESOURCE_TYPE_LABELS[type]}</option>)}</Select><TextField tone={theme} label="From date" type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /><TextField tone={theme} label="To date" type="date" min={fromDate} value={toDate} onChange={event => setToDate(event.target.value)} /><Select tone={theme} label="Record order" value={order} onChange={event => setOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></Select></div>
        {!loading && entries.length > 0 && !visibleEntries.length && <p>No matching resource records.</p>}
        {loading ? (
          <p className="text-app-ink-soft">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-app-border p-6 text-center text-app-ink-soft">
            No entries yet — add your first one above.
          </p>
        ) : (
          <div className="resource-table-scroll"><table className="resource-record-table"><caption className="sr-only">Saved resource usage records</caption><thead><tr><th scope="col">Date</th><th scope="col">Resource</th><th scope="col">Quantity</th><th scope="col">Farm / crop</th><th scope="col">Notes</th><th scope="col">Actions</th></tr></thead><tbody>{visibleEntries.map(entry => <tr key={entry.id}><td>{new Date(entry.date).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</td><td>{RESOURCE_TYPE_LABELS[entry.resourceType]}</td><td>{entry.quantity.toLocaleString()} {entry.unit}</td><td>{entry.farmId ? directory.farms.find(farm => farm.id === entry.farmId)?.farmName || 'Farm unavailable' : 'Unassigned'}{entry.cropId && <small className="record-crop">{directory.crops.find(crop => crop.id === entry.cropId)?.name || 'Crop unavailable'}</small>}</td><td>{entry.notes || '—'}</td><td><div className="row-actions"><button type="button" className="icon-action" aria-label="Edit entry" onClick={() => {setEditing(entry.id);setForm({farmId:entry.farmId??'',cropId:entry.cropId??'',resourceType:entry.resourceType,quantity:String(entry.quantity),unit:entry.unit,date:entry.date.slice(0,10),notes:entry.notes??''});setFormError(null);setSaved('');entryForm.current?.scrollIntoView({block:'start'})}}><Pencil size={17} /></button><button type="button" className="icon-action danger-action" aria-label="Delete entry" disabled={removingId===entry.id} onClick={() => void handleRemove(entry.id)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>
        )}
      </div>
      {!loading && !error && <details className="resource-history-disclosure"><summary>Resource usage trends</summary><ResourceHistorySection entries={visibleEntries} category={typeFilter} totalLoaded={entries.length} /></details>}
    </div>
  )
}
