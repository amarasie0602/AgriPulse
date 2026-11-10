import type { Farm } from '@/types/farm'
import { Select } from './Select'
export function FarmFilter({ farms, value, onChange, loading = false, tone = 'light' }: { farms: Farm[]; value: string; onChange: (value: string) => void; loading?: boolean; tone?: 'light' | 'dark' }) {
  return <Select label="Reporting farm" tone={tone} value={value} disabled={loading} onChange={e => onChange(e.target.value)}><option value="">All farms & unassigned</option><option value="unassigned">Unassigned records</option>{farms.map(farm => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}</Select>
}
