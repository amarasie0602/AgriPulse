import { useSearchParams } from 'react-router-dom'
﻿import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Eye, MapPin, Pencil, Plus, Search, Sprout, Trash2, Warehouse, Ruler } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ChipInput } from '@/components/ui/ChipInput'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { MetricCard, PageHeader } from '@/components/ui/Workspace'
import { useDocumentTitle, useTheme } from '@/hooks'
import { FarmRequestError, farmService } from '@/services/farmService'
import type { Farm, FarmInput } from '@/types/farm'

const formatNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
type Action = { mode: 'create' } | { mode: 'view' | 'edit' | 'delete'; farm: Farm }

function FarmEditor({ farm, onSaved, onClose }: { farm?: Farm; onSaved: (farm: Farm) => void; onClose: () => void }) {
  const { theme } = useTheme()
  const [name, setName] = useState(farm?.farmName ?? '')
  const [location, setLocation] = useState(farm?.location ?? '')
  const [area, setArea] = useState(farm?.farmSizeHectares.toString() ?? '')
  const [crops, setCrops] = useState<string[]>(farm?.cropTypes ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)

  async function save(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length > 80) next.farmName = 'Enter a farm name between 1 and 80 characters.'
    if (!location.trim() || location.trim().length > 120) next.location = 'Enter a location between 1 and 120 characters.'
    const size = Number(area)
    if (!area.trim() || !Number.isFinite(size) || size <= 0 || size > 1_000_000) next.farmSizeHectares = 'Enter an area greater than 0 and no more than 1,000,000 hectares.'
    if (crops.length > 12 || crops.some(crop => !crop.trim() || crop.length > 40)) next.cropTypes = 'Use up to 12 crop names, each no more than 40 characters.'
    setErrors(next)
    setError(null)
    if (Object.keys(next).length) return
    submitting.current = true
    setBusy(true)
    const input: FarmInput = { farmName: name.trim(), location: location.trim(), farmSizeHectares: size, cropTypes: crops }
    try {
      onSaved(farm ? await farmService.update(farm.id, input) : await farmService.create(input))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this farm.')
      if (err instanceof FarmRequestError) setErrors(err.fields)
    } finally { submitting.current = false; setBusy(false) }
  }

  return <Dialog title={farm ? 'Edit farm' : 'Add a farm'} description="Keep farm records separate from your default Farm Profile." onClose={onClose} busy={busy}>
    <form onSubmit={save} noValidate className="farm-editor">
      <div className="farm-form-grid">
        <TextField label="Farm name" tone={theme} value={name} onChange={e => setName(e.target.value)} maxLength={80} required disabled={busy} error={errors.farmName} placeholder="e.g. Green Valley Farm" autoFocus />
        <TextField label="Location" tone={theme} value={location} onChange={e => setLocation(e.target.value)} maxLength={120} required disabled={busy} error={errors.location} placeholder="e.g. Kandy, Sri Lanka" />
        <TextField label="Farm area (hectares)" tone={theme} value={area} onChange={e => setArea(e.target.value)} type="number" inputMode="decimal" min="0" max="1000000" step="any" required disabled={busy} error={errors.farmSizeHectares} placeholder="e.g. 12.5" />
        <div><ChipInput label="Crop types" tone={theme} values={crops} onChange={setCrops} disabled={busy} hint="Up to 12 crop types, 40 characters each" placeholder="Type a crop and press Enter" />{errors.cropTypes && <p className="field-error" role="alert">{errors.cropTypes}</p>}</div>
      </div>
      {error && <Alert tone="error" surface={theme}>{error}</Alert>}
      <div className="dialog-actions"><Button variant={theme === 'dark' ? 'outline-dark' : 'secondary'} disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" loading={busy} loadingText="Saving farm...">{farm ? 'Save changes' : 'Create farm'}</Button></div>
    </form>
  </Dialog>
}

export default function FarmManagement() {
  useDocumentTitle('Farm Management')
  const [searchParams] = useSearchParams()
  const { theme } = useTheme()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [cropFilter, setCropFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [action, setAction] = useState<Action | null>(() => searchParams.get('new') === '1' ? { mode: 'create' } : null)
  const [revision, setRevision] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deletingRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    farmService.list(controller.signal).then(records => {
      if (!controller.signal.aborted) setFarms(records)
    }).catch(err => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load farms.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  useEffect(() => { setQuery(searchParams.get('q') ?? '') }, [searchParams])

  const crops = useMemo(() => [...new Set(farms.flatMap(farm => farm.cropTypes))].sort((a, b) => a.localeCompare(b)), [farms])
  const visibleFarms = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return farms.filter(farm => (!cropFilter || farm.cropTypes.includes(cropFilter)) &&
      `${farm.farmName} ${farm.location} ${farm.cropTypes.join(' ')}`.toLocaleLowerCase().includes(term))
      .sort((a, b) => sort === 'name' ? a.farmName.localeCompare(b.farmName) : sort === 'area' ? b.farmSizeHectares - a.farmSizeHectares : b.createdAt.localeCompare(a.createdAt))
  }, [farms, query, cropFilter, sort])
  const totalArea = farms.reduce((sum, farm) => sum + farm.farmSizeHectares, 0)

  function open(next: Action) { setSuccess(null); setDeleteError(null); setAction(next) }
  function onSaved(farm: Farm) {
    setFarms(current => [farm, ...current.filter(record => record.id !== farm.id)])
    setSuccess(action?.mode === 'edit' ? 'Farm details updated.' : 'Farm created and saved to your account.')
    setAction(null)
  }
  async function remove() {
    if (action?.mode !== 'delete' || deletingRef.current) return
    deletingRef.current = true
    setDeleting(true)
    setDeleteError(null)
    try {
      await farmService.remove(action.farm.id)
      setFarms(current => current.filter(farm => farm.id !== action.farm.id))
      setSuccess('Farm deleted. Your default profile and resource records are unchanged.')
      setAction(null)
    } catch (err) { setDeleteError(err instanceof Error ? err.message : 'Could not delete this farm.') }
    finally { deletingRef.current = false; setDeleting(false) }
  }

  return <div className="app-page farms-page">
    <PageHeader eyebrow="FARM OPERATIONS" title="Farm management" description="Your farms, land area, and crop varieties in one place." action={<Button leftIcon={<Plus size={17} aria-hidden="true" />} onClick={() => open({ mode: 'create' })}>Add Farm</Button>} />
    {success && <Alert tone="success" surface={theme}>{success}</Alert>}
    {error && <Alert tone="error" surface={theme}>{error}<button type="button" className="inline-retry" onClick={() => setRevision(value => value + 1)}>Try again</button></Alert>}
    <div className="metrics-grid">
      <MetricCard icon={Warehouse} label="Registered farms" value={loading ? '...' : error ? 'Unavailable' : farms.length} detail="Farm Management records" accent />
      <MetricCard icon={Ruler} label="Total land area" value={loading ? '...' : error ? 'Unavailable' : `${formatNumber.format(totalArea)} ha`} detail="Across your registered farms" />
      <MetricCard icon={Sprout} label="Crop varieties" value={loading ? '...' : error ? 'Unavailable' : crops.length} detail="Unique crops across all farms" />
    </div>
    <section className="farm-register" aria-labelledby="farm-register-title">
      <div className="register-heading"><div><h2 id="farm-register-title">Farm directory</h2><p>Manage individual farm records. Your default farm is maintained in Farm Profile.</p></div><span className="record-count">{loading ? 'Loading' : error ? 'Unavailable' : `${visibleFarms.length} of ${farms.length} farms`}</span></div>
      <div className="farm-toolbar">
        <TextField label="Search farms" leftIcon={Search} tone={theme} value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, location, or crop" type="search" />
        <Select label="Crop type" tone={theme} value={cropFilter} onChange={e => setCropFilter(e.target.value)}><option value="">All crops</option>{[...new Set([...crops, ...(cropFilter ? [cropFilter] : [])])].map(crop => <option key={crop} value={crop}>{crop}</option>)}</Select>
        <Select label="Sort by" tone={theme} value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Farm name</option><option value="area">Largest area</option></Select>
      </div>
      {loading ? <div className="workspace-empty" role="status">Loading your farm records...</div> : error ? <div className="workspace-empty">Farm records could not be loaded. Try again to reconnect.</div> : farms.length === 0 ?
        <div className="workspace-empty"><Warehouse size={30} aria-hidden="true" /><h3>Your next season starts here</h3><p>Add your first farm to organize land and crop information.</p><Button onClick={() => open({ mode: 'create' })} leftIcon={<Plus size={16} />}>Add your first farm</Button></div> : visibleFarms.length === 0 ?
        <div className="workspace-empty"><Search size={26} aria-hidden="true" /><h3>No matching farms</h3><p>Try another name, location, or crop.</p><Button variant={theme === 'dark' ? 'outline-dark' : 'secondary'} onClick={() => { setQuery(''); setCropFilter('') }}>Clear filters</Button></div> :
        <div className="farm-table-wrap"><table className="farm-table"><caption className="sr-only">Your farm records with view, edit, and delete actions</caption><thead><tr><th scope="col">Farm</th><th scope="col">Location</th><th scope="col">Area</th><th scope="col">Crops</th><th scope="col" className="actions-column">Actions</th></tr></thead><tbody>
          {visibleFarms.map(farm => <tr key={farm.id}>
            <td><button className="farm-name" onClick={() => open({ mode: 'view', farm })}><span className="farm-row-icon"><Warehouse size={17} aria-hidden="true" /></span><span>{farm.farmName}<small>Added {new Date(farm.createdAt).toLocaleDateString()}</small></span></button></td>
            <td><span className="table-location"><MapPin size={14} aria-hidden="true" />{farm.location}</span></td><td className="numeric-cell">{formatNumber.format(farm.farmSizeHectares)} <small>ha</small></td>
            <td><div className="farm-crops">{farm.cropTypes.length ? farm.cropTypes.slice(0, 2).map(crop => <span key={crop}>{crop}</span>) : <span className="muted">No crops added</span>}{farm.cropTypes.length > 2 && <span>+{farm.cropTypes.length - 2}</span>}</div></td>
            <td><div className="row-actions"><button className="icon-action" title="View farm" aria-label={`View ${farm.farmName}`} onClick={() => open({ mode: 'view', farm })}><Eye size={16} /></button><button className="icon-action" title="Edit farm" aria-label={`Edit ${farm.farmName}`} onClick={() => open({ mode: 'edit', farm })}><Pencil size={16} /></button><button className="icon-action danger-action" title="Delete farm" aria-label={`Delete ${farm.farmName}`} onClick={() => open({ mode: 'delete', farm })}><Trash2 size={16} /></button></div></td>
          </tr>)}
        </tbody></table></div>}
    </section>
    {action && (action.mode === 'create' || action.mode === 'edit') && <FarmEditor farm={action.mode === 'edit' ? action.farm : undefined} onSaved={onSaved} onClose={() => setAction(null)} />}
    {action?.mode === 'view' && <Dialog title={action.farm.farmName} description="Farm record details" onClose={() => setAction(null)}><dl className="farm-detail-grid"><div><dt>Location</dt><dd>{action.farm.location}</dd></div><div><dt>Farm area</dt><dd>{formatNumber.format(action.farm.farmSizeHectares)} ha</dd></div><div><dt>Crop types</dt><dd>{action.farm.cropTypes.join(', ') || 'No crops added'}</dd></div><div><dt>Last updated</dt><dd>{new Date(action.farm.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</dd></div></dl><div className="dialog-actions"><Button variant={theme === 'dark' ? 'outline-dark' : 'secondary'} onClick={() => setAction(null)}>Close</Button><Button onClick={() => open({ mode: 'edit', farm: action.farm })}>Edit farm</Button></div></Dialog>}
    {action?.mode === 'delete' && <Dialog title="Delete this farm?" description={`Delete ${action.farm.farmName}? This permanently removes this farm record. Your default Farm Profile and resource entries will be kept.`} onClose={() => setAction(null)} busy={deleting}>{deleteError && <Alert tone="error" surface={theme}>{deleteError}</Alert>}<div className="dialog-actions"><Button variant={theme === 'dark' ? 'outline-dark' : 'secondary'} disabled={deleting} onClick={() => setAction(null)}>Keep farm</Button><Button className="delete-button" loading={deleting} loadingText="Deleting..." onClick={() => void remove()}>Delete farm</Button></div></Dialog>}
  </div>
}
