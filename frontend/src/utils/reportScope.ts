import type { ResourceEntry } from '../types/resource'
export function scopeResourceEntries(entries: ResourceEntry[], farm = '', from = '', to = '', crop = '') {
  return entries.filter(entry => (!farm || (farm === 'unassigned' ? !entry.farmId : entry.farmId === farm)) && (!crop || entry.cropId === crop) && (!from || entry.date.slice(0,10) >= from) && (!to || entry.date.slice(0,10) <= to))
}
