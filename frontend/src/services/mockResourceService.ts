import type { CreateResourceEntryInput, ResourceEntry, ResourceService, ResourceSummary } from '@/types'
import { AuthError } from './errors'
import { tokenStorage } from './tokenStorage'

/**
 * Offline stand-in for the resource tracking endpoints, used only in
 * development (see VITE_USE_MOCK_AUTH). Entries live in this browser's
 * localStorage, scoped to the signed-in user's id.
 */

const ENTRIES_KEY = 'agripulse.mock.resources'
const LATENCY_MS = 350

interface StoredEntry extends ResourceEntry {
  userId: string | number
}

function readEntries(): StoredEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (raw) return JSON.parse(raw) as StoredEntry[]
  } catch {
    // Fall through to a fresh store.
  }
  return []
}

function writeEntries(entries: StoredEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

function currentUserId(): string | number {
  const session = tokenStorage.load()
  if (!session) throw new AuthError('Your session has expired. Please sign in again.', 401)
  return session.user.id
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function nextId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8)
}

export const mockResourceService: ResourceService = {
  async list(): Promise<ResourceEntry[]> {
    await wait()
    const userId = currentUserId()
    return readEntries()
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async create(input: CreateResourceEntryInput): Promise<ResourceEntry> {
    await wait()
    const userId = currentUserId()
    const entries = readEntries()

    const entry: StoredEntry = {
      id: nextId(),
      userId,
      resourceType: input.resourceType,
      quantity: input.quantity,
      unit: input.unit,
      date: new Date(input.date).toISOString(),
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }
    entries.push(entry)
    writeEntries(entries)

    const { userId: _drop, ...rest } = entry
    return rest
  },

  async remove(id: string): Promise<void> {
    await wait()
    const userId = currentUserId()
    const entries = readEntries()
    const found = entries.find((entry) => entry.id === id)
    if (!found) throw new AuthError('This entry no longer exists.', 404)
    if (found.userId !== userId) throw new AuthError('You do not have access to this entry.', 403)

    writeEntries(entries.filter((entry) => entry.id !== id))
  },

  async summary(): Promise<ResourceSummary> {
    await wait()
    const userId = currentUserId()
    const summary: ResourceSummary = {}
    for (const entry of readEntries()) {
      if (entry.userId !== userId) continue
      summary[entry.resourceType] = (summary[entry.resourceType] ?? 0) + entry.quantity
    }
    return summary
  },
}
