import { Link } from 'react-router-dom'
import type { Farm } from '@/types/farm'
import type { Crop } from '@/types/crop'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
export function LandUse({ farmId = '', farms, crops, loading, error }: { farmId?: string; farms: Farm[]; crops: Crop[]; loading: boolean; error: string }) {
  const data = {farms,crops}
  const categories = new Map<string, number>()
  for (const crop of data?.crops ?? []) if ((!farmId || crop.farmId === farmId) && crop.stage !== 'Harvested') categories.set(crop.category, (categories.get(crop.category) ?? 0) + crop.areaHectares)
  const groups = [
    { title: 'Land by farm', description: 'Registered farm area in hectares.', rows: data?.farms.filter(farm => !farmId || farm.id === farmId).map(farm => ({ id: farm.id, label: farm.farmName, area: farm.farmSizeHectares })) ?? [], to: '/farms' },
    { title: 'Active crop mix', description: 'Area by crop category. Concurrent records may overlap.', rows: [...categories].map(([label, area]) => ({ id: label, label, area })), to: '/crops' },
  ]
  return <section className="land-use" aria-label="Land and crop distribution">{groups.map(group => {
    const total = group.rows.reduce((sum, row) => sum + row.area, 0)
    return <div key={group.title}><header><h2>{group.title}</h2><p>{group.description}</p></header>{error ? <p role="alert">{error}</p> : loading ? <p role="status">Loading land records…</p> : !group.rows.length ? <p>{farmId ? 'No land attributed to this scope.' : <>No records yet. <Link to={group.to}>Add your first record</Link>.</>}</p> : <ul>{group.rows.sort((a, b) => b.area - a.area).map(row => <li key={row.id}><div><span>{row.label}</span><strong>{number.format(row.area)} ha <small>({number.format(row.area / total * 100)}%)</small></strong></div><meter min={0} max={total} value={row.area} aria-label={`${row.label}: ${number.format(row.area)} hectares`} /></li>)}</ul>}</div>
  })}</section>
}
