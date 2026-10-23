import { useCallback, useEffect, useState } from 'react'
import { resourceService } from '@/services'
import type { CreateResourceEntryInput, ResourceEntry } from '@/types'
import { useAuth } from './useAuth'

interface UseResourceEntriesResult {
  entries: ResourceEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  /** Adds an entry and refreshes local state on success. Throws on failure — the caller shows the message. */
  addEntry: (input: CreateResourceEntryInput) => Promise<void>
  /** Removes an entry and refreshes local state on success. Throws on failure — the caller shows the message. */
  removeEntry: (id: string) => Promise<void>
}

/** Fetches and manages the signed-in user's resource usage log. */
export function useResourceEntries(): UseResourceEntriesResult {
  const { isAuthenticated } = useAuth()
  const [entries, setEntries] = useState<ResourceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const nextEntries = await resourceService.list()
      setEntries(nextEntries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your resource usage.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addEntry = useCallback(
    async (input: CreateResourceEntryInput) => {
      await resourceService.create(input)
      await refresh()
    },
    [refresh],
  )

  const removeEntry = useCallback(
    async (id: string) => {
      await resourceService.remove(id)
      await refresh()
    },
    [refresh],
  )

  return { entries, loading, error, refresh, addEntry, removeEntry }
}
