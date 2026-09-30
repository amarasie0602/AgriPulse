export const RESOURCE_TYPES = ['WATER', 'ENERGY', 'FERTILIZER', 'PESTICIDE', 'FUEL', 'OTHER'] as const
export type ResourceType = (typeof RESOURCE_TYPES)[number]

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  WATER: 'Water',
  ENERGY: 'Energy',
  FERTILIZER: 'Fertilizer',
  PESTICIDE: 'Pesticide',
  FUEL: 'Fuel',
  OTHER: 'Other',
}

/** Sensible starting unit per type — the field stays editable, this just saves typing. */
export const RESOURCE_TYPE_DEFAULT_UNIT: Record<ResourceType, string> = {
  WATER: 'L',
  ENERGY: 'kWh',
  FERTILIZER: 'kg',
  PESTICIDE: 'L',
  FUEL: 'L',
  OTHER: 'units',
}

export interface ResourceEntry {
  id: string
  resourceType: ResourceType
  quantity: number
  unit: string
  /** ISO date string. */
  date: string
  notes?: string
  createdAt: string
}

export interface CreateResourceEntryInput {
  resourceType: ResourceType
  quantity: number
  unit: string
  date: string
  notes?: string
}

/** All-time total quantity per resource type. Types with no entries are omitted. */
export type ResourceSummary = Partial<Record<ResourceType, number>>

export interface ResourceService {
  list(): Promise<ResourceEntry[]>
  create(input: CreateResourceEntryInput): Promise<ResourceEntry>
  remove(id: string): Promise<void>
  summary(): Promise<ResourceSummary>
}
