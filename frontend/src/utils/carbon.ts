import type { ResourceEntry, ResourceType } from '@/types'

/**
 * Illustrative default emission factors — general estimates for guidance
 * only, not a certified calculation. A real deployment would let farms pick
 * factors matching their region/energy mix/fertilizer type.
 *
 * WATER and OTHER have no factor here (water's footprint is mostly indirect
 * — pumping energy — which is already counted under ENERGY; OTHER is too
 * vague to estimate), so they're excluded from the total rather than guessed at.
 */
export interface EmissionFactor {
  type: ResourceType
  /** The entry's `unit` must match this (case-insensitive) for the entry to count. */
  unit: string
  kgCo2ePerUnit: number
  label: string
}

export const EMISSION_FACTORS: EmissionFactor[] = [
  { type: 'FUEL', unit: 'L', kgCo2ePerUnit: 2.68, label: 'Diesel fuel' },
  { type: 'ENERGY', unit: 'kWh', kgCo2ePerUnit: 0.42, label: 'Grid electricity' },
  { type: 'FERTILIZER', unit: 'kg', kgCo2ePerUnit: 5.5, label: 'Nitrogen fertilizer' },
  { type: 'PESTICIDE', unit: 'L', kgCo2ePerUnit: 8, label: 'Pesticide' },
]

export const CARBON_EXCLUDED_TYPES: ResourceType[] = ['WATER', 'OTHER']

export interface CarbonBreakdownRow {
  type: ResourceType
  label: string
  unit: string
  /** Total quantity from entries whose unit matched the factor's expected unit. */
  matchedQuantity: number
  /** Entries of this type whose unit didn't match, so weren't counted — shown for transparency. */
  unmatchedEntryCount: number
  factorKgCo2ePerUnit: number
  co2eKg: number
}

export interface CarbonEstimate {
  rows: CarbonBreakdownRow[]
  totalCo2eKg: number
  totalUnmatchedEntries: number
  /** True once at least one entry contributed to the total. */
  hasData: boolean
}

/** Purely a client-side computation over already-fetched resource entries — no separate data model. */
export function estimateCarbon(entries: ResourceEntry[]): CarbonEstimate {
  const rows: CarbonBreakdownRow[] = EMISSION_FACTORS.map((factor) => {
    const ofType = entries.filter((entry) => entry.resourceType === factor.type)
    const matched = ofType.filter((entry) => entry.unit.trim().toLowerCase() === factor.unit.toLowerCase())
    const matchedQuantity = matched.reduce((sum, entry) => sum + entry.quantity, 0)

    return {
      type: factor.type,
      label: factor.label,
      unit: factor.unit,
      matchedQuantity,
      unmatchedEntryCount: ofType.length - matched.length,
      factorKgCo2ePerUnit: factor.kgCo2ePerUnit,
      co2eKg: matchedQuantity * factor.kgCo2ePerUnit,
    }
  })

  return {
    rows,
    totalCo2eKg: rows.reduce((sum, row) => sum + row.co2eKg, 0),
    totalUnmatchedEntries: rows.reduce((sum, row) => sum + row.unmatchedEntryCount, 0),
    hasData: rows.some((row) => row.matchedQuantity > 0),
  }
}

/** Farm sustainability figures are conventionally reported in tonnes CO2e. */
export function formatCo2e(kg: number): string {
  return `${(kg / 1000).toFixed(kg >= 1000 ? 1 : 2)} tCO₂e`
}
