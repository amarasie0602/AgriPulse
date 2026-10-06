import type { ResourceEntry, ResourceType } from '@/types'
import { estimateCarbon } from './carbon'
import { RESOURCE_TYPE_DEFAULT_UNIT, RESOURCE_TYPE_LABELS } from '@/types'

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' })

/** "2026-09-29T…" -> "2026-09", used as the bucket key. */
function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return MONTH_LABEL_FORMAT.format(new Date(year, month - 1, 1))
}

/** Every month from the earliest entry to the current month, so gaps show as zero rather than being skipped. */
function monthRange(entries: ResourceEntry[]): string[] {
  if (entries.length === 0) return []

  const keys = entries.map((entry) => monthKey(entry.date)).sort()
  const [startYear, startMonth] = keys[0].split('-').map(Number)
  const now = new Date()
  const cursor = new Date(startYear, startMonth - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 1)

  const months: string[] = []
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

export interface TrendPoint {
  key: string
  label: string
  value: number
}

/** Estimated CO2e per month, in kg — reuses the same calculation as the Carbon Calculator. */
export function monthlyCarbonTrend(entries: ResourceEntry[]): TrendPoint[] {
  return monthRange(entries).map((key) => {
    const monthEntries = entries.filter((entry) => monthKey(entry.date) === key)
    return { key, label: monthLabel(key), value: estimateCarbon(monthEntries).totalCo2eKg }
  })
}

export interface ResourceTypeTrend {
  type: ResourceType
  label: string
  unit: string
  points: TrendPoint[]
  total: number
  /** Entries of this type logged in a non-default unit, excluded from the trend for consistency. */
  excludedCount: number
}

/**
 * One trend per resource type that has at least one matching-unit entry. Only
 * entries in that type's default unit are counted, same honesty rule as the
 * Carbon Calculator — summing "50 L" with "12 gal" would silently misreport.
 */
export function monthlyResourceTrends(entries: ResourceEntry[]): ResourceTypeTrend[] {
  const months = monthRange(entries)
  const types = Array.from(new Set(entries.map((entry) => entry.resourceType)))

  return types
    .map((type): ResourceTypeTrend => {
      const unit = RESOURCE_TYPE_DEFAULT_UNIT[type]
      const ofType = entries.filter((entry) => entry.resourceType === type)
      const matched = ofType.filter((entry) => entry.unit.trim().toLowerCase() === unit.toLowerCase())

      const points = months.map((key) => ({
        key,
        label: monthLabel(key),
        value: matched.filter((entry) => monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.quantity, 0),
      }))

      return {
        type,
        label: RESOURCE_TYPE_LABELS[type],
        unit,
        points,
        total: points.reduce((sum, point) => sum + point.value, 0),
        excludedCount: ofType.length - matched.length,
      }
    })
    .filter((trend) => trend.total > 0)
    .sort((a, b) => b.total - a.total)
}
