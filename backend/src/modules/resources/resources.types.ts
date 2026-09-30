import type { ResourceType } from './resource-entry.model';

export interface ResourceEntryDto {
  id: string;
  resourceType: ResourceType;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
  createdAt: string;
}

/** All-time total quantity per resource type, keyed by type. Types with no entries are omitted. */
export type ResourceSummary = Partial<Record<ResourceType, number>>;
