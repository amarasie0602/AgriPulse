import { Photo } from '@/components/ui/Photo'
import { cropPhoto } from '@/utils/media'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Pencil, Plus, Search, Sprout, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TextField } from '@/components/ui/TextField'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/Workspace'
import { useDocumentTitle, useTheme } from '@/hooks'
import { farmService } from '@/services/farmService'
import { cropService } from '@/services/cropService'
import { CROP_CATEGORIES, CROP_STAGES, type Crop, type CropInput } from '@/types/crop'
import type { Farm } from '@/types/farm'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
type Action = { mode: 'create' } | { mode: 'edit' | 'view' | 'delete'; crop: Crop }

function CropEditor({ crop, farms, onClose, onSaved }: { crop?: Crop; farms: Farm[]; onClose: () => void; onSaved: (crop: Crop) => void }) {
  const { theme } = useTheme()
  const [input, setInput] = useState<CropInput>(() => crop ? { name: crop.name, farmId: crop.farmId, category: crop.category, areaHectares: crop.areaHectares, plantingDate: crop.plantingDate, harvestDate: crop.harvestDate, stage: crop.stage, variety: crop.variety, season: crop.season, notes: crop.notes } : {
    name: '', farmId: farms[0]?.id ?? '', category: 'Rice & paddy', areaHectares: 0, plantingDate: '', harvestDate: '', stage: 'Planned', variety: '', season: '', notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  function field<K extends keyof CropInput>(key: K, value: CropInput[K]) { setInput(current => ({ ...current, [key]: value })) }
  async function save(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    if (input.harvestDate < input.plantingDate) { setError('Expected harvest must be on or after planting.'); return }
    const farm = farms.find(farm => farm.id === input.farmId)
    if (!farm || input.areaHectares > farm.farmSizeHectares) { setError('Select a farm and enter an area within its total land area.'); return }
    lock.current = true; setBusy(true); setError('')
    try { onSaved(crop ? await cropService.update(crop.id, input) : await cropService.create(input)) }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save crop.') }
    finally { lock.current = false; setBusy(false) }
  }
  return <Dialog title={crop ? 'Edit crop record' : 'Plan a crop'} description="Dates and growth stages are your own field observations, not automated predictions." onClose={onClose} busy={busy}>
    <form onSubmit={save} className="farm-editor"><fieldset disabled={busy} className="crop-fieldset"><div className="farm-form-grid">
      <TextField tone={theme} label="Crop name" value={input.name} onChange={event => field('name', event.target.value)} required maxLength={80} autoFocus placeholder="e.g. Samba rice" />
      <Select tone={theme} label="Farm" value={input.farmId} onChange={event => field('farmId', event.target.value)} required><option value="" disabled>Select a farm</option>{farms.map(farm => <option key={farm.id} value={farm.id}>{farm.farmName} · {number.format(farm.farmSizeHectares)} ha</option>)}</Select>
      <Select tone={theme} label="Crop category" value={input.category} onChange={event => field('category', event.target.value as CropInput['category'])}>{CROP_CATEGORIES.map(value => <option key={value}>{value}</option>)}</Select>
      <TextField tone={theme} label="Cultivated area (ha)" type="number" min="0.000001" step="any" max={farms.find(farm => farm.id === input.farmId)?.farmSizeHectares} required value={input.areaHectares || ''} onChange={event => field('areaHectares', Number(event.target.value))} />
      <TextField tone={theme} label="Planting date" type="date" required value={input.plantingDate} onChange={event => field('plantingDate', event.target.value)} />
      <TextField tone={theme} label="Expected harvest" type="date" required min={input.plantingDate || undefined} value={input.harvestDate} onChange={event => field('harvestDate', event.target.value)} />
      <Select tone={theme} label="Observed growth stage" value={input.stage} onChange={event => field('stage', event.target.value as CropInput['stage'])}>{CROP_STAGES.map(value => <option key={value}>{value}</option>)}</Select>
      <TextField tone={theme} label="Variety (optional)" maxLength={100} value={input.variety} onChange={event => field('variety', event.target.value)} />
      <TextField tone={theme} label="Season (optional)" maxLength={80} placeholder="e.g. Maha 2026/27" value={input.season} onChange={event => field('season', event.target.value)} />
      <label className="crop-notes">Field notes (optional)<textarea maxLength={2000} rows={3} value={input.notes} onChange={event => field('notes', event.target.value)} /></label>
    </div></fieldset>{error && <Alert tone="error" surface={theme}>{error}</Alert>}<div className="dialog-actions"><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" loading={busy}>Save crop</Button></div></form>
  </Dialog>
}

export default function CropManagement() {
  useDocumentTitle('Crop Management')
  const { theme } = useTheme()
  const [params,setParams] = useSearchParams()
  const [crops, setCrops] = useState<Crop[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [revision, setRevision] = useState(0)
  const [query, setQuery] = useState('')
  const [farmFilter, setFarmFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [sort, setSort] = useState('harvest')
  const [action, setAction] = useState<Action | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleting = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    Promise.all([cropService.list(controller.signal), farmService.list(controller.signal)]).then(([crops, farms]) => {
      if (!controller.signal.aborted) { setCrops(crops); setFarms(farms) }
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not load crops.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])
  useEffect(() => {
    const requested=params.get('crop')
    if (loading || !requested) return
    const crop=crops.find(crop=>crop.id===requested)
    if (crop) setAction({mode:'view',crop})
    setParams({}, {replace:true})
  },[loading,crops,params,setParams])
  const farmName = (id: string) => farms.find(farm => farm.id === id)?.farmName ?? 'Farm unavailable'
  const visible = useMemo(() => crops.filter(crop => (!farmFilter || crop.farmId === farmFilter) && (!stageFilter || crop.stage === stageFilter) && `${crop.name} ${crop.category} ${crop.variety} ${crop.season}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'area' ? b.areaHectares - a.areaHectares : a.harvestDate.localeCompare(b.harvestDate)), [crops, farmFilter, stageFilter, query, sort])
  const active = crops.filter(crop => crop.stage !== 'Harvested')
  const upcoming = [...active].sort((a, b) => a.harvestDate.localeCompare(b.harvestDate))[0]
  function open(action: Action) { setDeleteError(''); setSuccess(''); setAction(action) }
  async function remove() {
    if (action?.mode !== 'delete' || deleting.current) return
    deleting.current = true; setBusy(true); setDeleteError('')
    try { await cropService.remove(action.crop.id); setCrops(current => current.filter(crop => crop.id !== action.crop.id)); setAction(null); setSuccess('Crop record deleted.') }
    catch (error) { setDeleteError(error instanceof Error ? error.message : 'Could not delete crop.') }
    finally { deleting.current = false; setBusy(false) }
  }
  return <div className="app-page crops-page">
    <PageHeader eyebrow="THE GROWING SEASON" title="Crop management" description="From planting plans to harvest. Keep every crop rooted in its farm." action={<Button leftIcon={<Plus size={17} />} disabled={loading || !!error || !farms.length} onClick={() => open({ mode: 'create' })}>Plan a crop</Button>} />
    {error && <Alert tone="error" surface={theme}>{error}<button className="inline-retry" onClick={() => setRevision(value => value + 1)}>Try again</button></Alert>}
    {success && <Alert tone="success" surface={theme}>{success}</Alert>}
    {!loading && !error && <section className="season-ledger" aria-label="Season summary"><div><span>IN THE FIELD</span><strong>{active.length}</strong><p>active crop records</p></div><div><span>CULTIVATED AREA</span><strong>{number.format(active.reduce((sum, crop) => sum + crop.areaHectares, 0))}<small> ha</small></strong><p>Sum of active records; areas may overlap</p></div><div className="next-harvest"><CalendarDays size={24} aria-hidden="true" /><span>NEXT EXPECTED HARVEST</span><strong>{upcoming ? date(upcoming.harvestDate) : 'No harvest planned'}</strong><p>{upcoming ? `${upcoming.name} · ${farmName(upcoming.farmId)}` : 'Add planting and harvest dates to get started.'}</p></div></section>}
    <section className="crop-register" aria-label="Crop register"><div className="farm-toolbar crop-toolbar"><TextField tone={theme} label="Search crops" type="search" leftIcon={Search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, variety, or season" /><Select tone={theme} label="Farm" value={farmFilter} onChange={event => setFarmFilter(event.target.value)}><option value="">All farms</option>{farms.map(farm => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}</Select><Select tone={theme} label="Growth stage" value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="">All stages</option>{CROP_STAGES.map(stage => <option key={stage}>{stage}</option>)}</Select><Select tone={theme} label="Sort" value={sort} onChange={event => setSort(event.target.value)}><option value="harvest">Harvest date</option><option value="name">Crop name</option><option value="area">Largest area</option></Select></div>
    {loading ? <div className="workspace-empty" role="status">Loading your growing season…</div> : error ? <div className="workspace-empty">Crop records are unavailable. Retry to reconnect.</div> : !farms.length ? <div className="workspace-empty"><Sprout size={32} /><h2>First, give your crops a home</h2><p>Create a farm in your directory before planning its crops.</p><Link to="/farms?new=1">Add a farm <ArrowUpRight size={16} /></Link></div> : !visible.length ? <div className="workspace-empty"><Sprout size={32} /><h2>{crops.length ? 'No crops match these filters' : 'A new season, a clear plan'}</h2><p>{crops.length ? 'Try another farm, stage, or search term.' : 'Record your first crop with its own variety, dates, and observed growth stage.'}</p>{crops.length ? <Button onClick={() => { setQuery(''); setFarmFilter(''); setStageFilter('') }}>Clear filters</Button> : <Button onClick={() => open({ mode: 'create' })}>Plan your first crop</Button>}</div> : <div className="crop-ledger">{visible.map(crop => <article key={crop.id} className="crop-row crop-card"><div className="crop-card-image"><Photo asset={cropPhoto(crop)} /><span className="image-status"><i />{crop.stage}</span></div><div className="crop-identity"><span className="eyebrow">{crop.category}</span><button className="farm-name" onClick={() => open({ mode: 'view', crop })}>{crop.name}</button><p>{farmName(crop.farmId)}{crop.variety ? ` / ${crop.variety}` : ''}</p></div><div className="crop-stage"><span>{crop.stage}</span><div className="growth-track" role="img" aria-label={`Observed stage: ${crop.stage}`}>{CROP_STAGES.map((stage, index) => <i key={stage} className={index <= CROP_STAGES.indexOf(crop.stage) ? 'reached' : ''} />)}</div><small>Manually recorded stage</small></div><div className="crop-dates"><span>PLANTED <strong>{date(crop.plantingDate)}</strong></span><span>EXPECTED HARVEST <strong>{date(crop.harvestDate)}</strong></span></div><div className="crop-area">{number.format(crop.areaHectares)}<small> hectares</small></div><div className="row-actions"><button className="icon-action" aria-label={`Edit ${crop.name}`} onClick={() => open({ mode: 'edit', crop })}><Pencil size={17} /></button><button className="icon-action danger-action" aria-label={`Delete ${crop.name}`} onClick={() => open({ mode: 'delete', crop })}><Trash2 size={17} /></button></div></article>)}</div>}</section>
    {action && (action.mode === 'create' || action.mode === 'edit') && <CropEditor crop={action.mode === 'edit' ? action.crop : undefined} farms={farms} onClose={() => setAction(null)} onSaved={crop => { setCrops(current => [crop, ...current.filter(item => item.id !== crop.id)]); setAction(null); setSuccess('Crop record saved to your account.') }} />}
    {action?.mode === 'view' && <Dialog title={action.crop.name} description={`${action.crop.category} · ${farmName(action.crop.farmId)}`} onClose={() => setAction(null)}><Photo asset={cropPhoto(action.crop)} className="detail-photo" /><dl className="farm-detail-grid">{[['Area', `${number.format(action.crop.areaHectares)} ha`], ['Growth stage', action.crop.stage], ['Planting date', date(action.crop.plantingDate)], ['Expected harvest', date(action.crop.harvestDate)], ['Variety', action.crop.variety || 'Not recorded'], ['Season', action.crop.season || 'Not recorded'], ['Field notes', action.crop.notes || 'No notes yet']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="crop-detail-value">{value}</dd></div>)}</dl><div className="dialog-actions"><Button onClick={() => open({ mode: 'edit', crop: action.crop })}>Edit crop</Button></div></Dialog>}
    {action?.mode === 'delete' && <Dialog title="Delete crop record?" description={`Permanently remove ${action.crop.name}? The farm and resource records will be kept.`} onClose={() => setAction(null)} busy={busy}>{deleteError && <Alert tone="error" surface={theme}>{deleteError}</Alert>}<div className="dialog-actions"><Button variant="secondary" disabled={busy} onClick={() => setAction(null)}>Keep crop</Button><Button className="delete-button" loading={busy} onClick={() => void remove()}>Delete crop</Button></div></Dialog>}
  </div>
}
