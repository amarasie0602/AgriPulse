import { useCallback, useEffect, useState } from 'react'
import { resourceService } from '@/services'
import type { CreateResourceEntryInput, ResourceEntry, ResourceSummary } from '@/types'
import { useAuth } from './useAuth'

interface UseResourceEntriesResult {
  entries: ResourceEntry[]
  summary: ResourceSummary
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
  const [summary, setSummary] = useState<ResourceSummary>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setEntries([])
      setSummary({})
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [nextEntries, nextSummary] = await Promise.all([resourceService.list(), resourceService.summary()])
      setEntries(nextEntries)
      setSummary(nextSummary)
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

  return { entries, summary, loading, error, refresh, addEntry, removeEntry }
}
