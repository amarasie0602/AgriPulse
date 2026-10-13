import type { ResourceType } from '@/types'

/** Fixed, theme-independent colors per resource type — used for icon badges, chart segments and accents across the app. */
export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  WATER: '#3f8fc2',
  ENERGY: '#e0a83e',
  FERTILIZER: '#5b9c5f',
  PESTICIDE: '#4a8a93',
  FUEL: '#c2693c',
  OTHER: '#8a76a8',
}
