import { RESOURCE_TYPE_DEFAULT_UNIT, RESOURCE_TYPE_LABELS, type ResourceEntry, type ResourceType } from '../types/resource'

export type HistoryPeriod = 'day' | 'week' | 'month'
export interface HistoryPoint { key: string; label: string; value: number | null; records: number }
export interface ResourceHistory {
  id: string; type: ResourceType; label: string; unit: string
  points: HistoryPoint[]; total: number; recordCount: number; periodCount: number
}
export const HISTORY_TYPES: ResourceType[] = ['WATER', 'FERTILIZER', 'ENERGY', 'FUEL', 'PESTICIDE']
const dateLabel = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' })

function bucket(date: string, period: HistoryPeriod): string {
  // Resource dates are calendar dates serialized by the API as UTC, not creation timestamps.
  const value = new Date(date.slice(0, 10) + 'T00:00:00Z')
  if (period === 'month') value.setUTCDate(1)
  if (period === 'week') value.setUTCDate(value.getUTCDate() - (value.getUTCDay() + 6) % 7)
  return value.toISOString().slice(0, 10)
}
function nextBucket(key: string, period: HistoryPeriod) {
  const value = new Date(key + 'T00:00:00Z')
  if (period === 'month') value.setUTCMonth(value.getUTCMonth() + 1)
  else value.setUTCDate(value.getUTCDate() + (period === 'week' ? 7 : 1))
  return value.toISOString().slice(0, 10)
}
export function validHistoryEntry(entry: ResourceEntry) {
  return Number.isFinite(entry.quantity) && entry.quantity >= 0 &&
    /^\d{4}-\d{2}-\d{2}/.test(entry.date) && Number.isFinite(Date.parse(entry.date)) && !!entry.unit.trim()
}

/** Aggregate only actual records, keeping different units in separate series. Missing periods are null, never zero. */
export function resourceHistory(entries: ResourceEntry[], period: HistoryPeriod): ResourceHistory[] {
  const groups = new Map<string, { type: ResourceType; unit: string; entries: ResourceEntry[] }>()
  for (const entry of entries.filter(validHistoryEntry)) {
    const standard = RESOURCE_TYPE_DEFAULT_UNIT[entry.resourceType]
    const unit = entry.unit.trim().toLowerCase() === standard.toLowerCase() ? standard : entry.unit.trim().toLowerCase()
    const id = `${entry.resourceType}:${unit}`
    const group = groups.get(id) ?? { type: entry.resourceType, unit, entries: [] }
    group.entries.push(entry)
    groups.set(id, group)
  }
  // Required resources remain visible even when they have no observations.
  for (const type of HISTORY_TYPES) {
    if (![...groups.values()].some(group => group.type === type)) {
      groups.set(`${type}:${RESOURCE_TYPE_DEFAULT_UNIT[type]}`, { type, unit: RESOURCE_TYPE_DEFAULT_UNIT[type], entries: [] })
    }
  }
  return [...groups].map(([id, group]) => {
    const totals = new Map<string, { value: number; records: number }>()
    for (const entry of group.entries) {
      const key = bucket(entry.date, period)
      const previous = totals.get(key) ?? { value: 0, records: 0 }
      totals.set(key, { value: previous.value + entry.quantity, records: previous.records + 1 })
    }
    const points: HistoryPoint[] = []
    for (const [key, total] of [...totals].sort(([a], [b]) => a.localeCompare(b))) {
      const previous = points.at(-1)
      if (previous && nextBucket(previous.key, period) < key) {
        const missing = nextBucket(previous.key, period)
        points.push({ key: missing, label: dateLabel.format(new Date(missing + 'T00:00:00Z')), value: null, records: 0 })
      }
      const label = (period === 'month' ? monthLabel : dateLabel).format(new Date(key + 'T00:00:00Z'))
      points.push({ key, label: period === 'week' ? `Week of ${label}` : label, ...total })
    }
    return { id, type: group.type, label: RESOURCE_TYPE_LABELS[group.type], unit: group.unit, points,
      total: group.entries.reduce((sum, entry) => sum + entry.quantity, 0), recordCount: group.entries.length, periodCount: totals.size }
  }).sort((a, b) => (HISTORY_TYPES.indexOf(a.type) < 0 ? 99 : HISTORY_TYPES.indexOf(a.type)) -
    (HISTORY_TYPES.indexOf(b.type) < 0 ? 99 : HISTORY_TYPES.indexOf(b.type)) || a.unit.localeCompare(b.unit))
}
