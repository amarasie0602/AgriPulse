import type { ResourceEntry, ResourceType } from '@/types'
import { EMISSION_FACTORS, estimateCarbon } from './carbon'
import { resourceHistory } from './resourceHistory'

export interface TrendPoint { key: string; label: string; value: number | null }
/** Monthly estimates only where supported input records exist. Never pad a sparse log with assumed zeroes. */
export function monthlyCarbonTrend(entries: ResourceEntry[]): TrendPoint[] {
  const supported = entries.filter(entry => EMISSION_FACTORS.some(factor => factor.type === entry.resourceType && factor.unit.toLowerCase() === entry.unit.trim().toLowerCase()))
  const amounts = supported.map(entry => ({ ...entry, resourceType: 'ENERGY' as const, unit: 'kg CO2e', quantity: estimateCarbon([entry]).totalCo2eKg }))
  return resourceHistory(amounts, 'month').find(series => series.type === 'ENERGY' && series.unit === 'kg co2e')?.points ?? []
}
export interface ResourceTypeTrend {
  type: ResourceType
  label: string
  unit: string
  points: TrendPoint[]
  total: number
  excludedCount: number
}
/** Preserve separate units and genuine gaps for the dashboard as well as the detailed analytics page. */
export function monthlyResourceTrends(entries: ResourceEntry[]): ResourceTypeTrend[] {
  return resourceHistory(entries, 'month').filter(series => series.recordCount > 0).map(series => ({
    type: series.type, label: series.label, unit: series.unit, points: series.points, total: series.total, excludedCount: 0,
  }))
}
