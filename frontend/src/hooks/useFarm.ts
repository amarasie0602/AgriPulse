import { useCallback, useEffect, useState } from 'react'
import { farmService } from '@/services'
import type { CreateFieldInput, Farm, UpdateFarmInput, UpdateFieldInput } from '@/types'
import { useAuth } from './useAuth'

interface UseFarmResult {
  farm: Farm | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateFarm: (input: UpdateFarmInput) => Promise<Farm>
  addField: (input: CreateFieldInput) => Promise<Farm>
  updateField: (fieldId: string, input: UpdateFieldInput) => Promise<Farm>
  removeField: (fieldId: string) => Promise<Farm>
}

export function useFarm(farmId: string | undefined): UseFarmResult {
  const { isAuthenticated } = useAuth()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !farmId) {
      setFarm(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      setFarm(await farmService.getById(farmId))
    } catch (err) {
      setFarm(null)
      setError(err instanceof Error ? err.message : 'Could not load this farm.')
    } finally {
      setLoading(false)
    }
  }, [farmId, isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateFarm = useCallback(
    async (input: UpdateFarmInput) => {
      if (!farmId) throw new Error('Could not save this farm.')
      const next = await farmService.update(farmId, input)
      setFarm(next)
      return next
    },
    [farmId],
  )

  const addField = useCallback(
    async (input: CreateFieldInput) => {
      if (!farmId) throw new Error('Could not save this field.')
      const next = await farmService.addField(farmId, input)
      setFarm(next)
      return next
    },
    [farmId],
  )

  const updateField = useCallback(
    async (fieldId: string, input: UpdateFieldInput) => {
      if (!farmId) throw new Error('Could not save this field.')
      const next = await farmService.updateField(farmId, fieldId, input)
      setFarm(next)
      return next
    },
    [farmId],
  )

  const removeField = useCallback(
    async (fieldId: string) => {
      if (!farmId) throw new Error('Could not remove this field.')
      const next = await farmService.removeField(farmId, fieldId)
      setFarm(next)
      return next
    },
    [farmId],
  )

  return { farm, loading, error, refresh, updateFarm, addField, updateField, removeField }
}
