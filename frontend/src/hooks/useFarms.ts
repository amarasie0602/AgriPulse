import { useCallback, useEffect, useState } from 'react'
import { farmService } from '@/services'
import type { CreateFarmInput, Farm } from '@/types'
import { useAuth } from './useAuth'

interface UseFarmsResult {
  farms: Farm[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createFarm: (input: CreateFarmInput) => Promise<Farm>
  removeFarm: (id: string) => Promise<void>
}

export function useFarms(): UseFarmsResult {
  const { isAuthenticated } = useAuth()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFarms([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      setFarms(await farmService.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your farms.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createFarm = useCallback(async (input: CreateFarmInput) => {
    const farm = await farmService.create(input)
    setFarms((current) => [farm, ...current.filter((item) => item.id !== farm.id)])
    return farm
  }, [])

  const removeFarm = useCallback(async (id: string) => {
    await farmService.remove(id)
    setFarms((current) => current.filter((farm) => farm.id !== id))
  }, [])

  return { farms, loading, error, refresh, createFarm, removeFarm }
}
