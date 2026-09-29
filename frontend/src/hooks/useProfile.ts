import { useCallback, useEffect, useState } from 'react'
import { profileService } from '@/services'
import type { FarmProfile, UpdateProfileInput } from '@/types'
import { useAuth } from './useAuth'

interface UseProfileResult {
  profile: FarmProfile | null
  /** True while the initial fetch is in flight. */
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  /** Saves a partial update and refreshes local state on success. Throws on failure — the caller shows the message. */
  updateProfile: (input: UpdateProfileInput) => Promise<FarmProfile>
}

/** Fetches and updates the signed-in user's farm profile from the dashboard. */
export function useProfile(): UseProfileResult {
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<FarmProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      setProfile(await profileService.getProfile())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your farm profile.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const next = await profileService.updateProfile(input)
    setProfile(next)
    return next
  }, [])

  return { profile, loading, error, refresh, updateProfile }
}
