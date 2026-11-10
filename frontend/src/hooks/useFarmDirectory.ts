import { useEffect, useState } from 'react'
import { farmService } from '@/services/farmService'
import { cropService } from '@/services/cropService'
import type { Farm } from '@/types/farm'
import type { Crop } from '@/types/crop'
/** Shared directory data for assigning and filtering existing user-owned records. */
export function useFarmDirectory() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([farmService.list(controller.signal), cropService.list(controller.signal)]).then(([farms,crops]) => { if (!controller.signal.aborted) { setFarms(farms); setCrops(crops) } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Farm directory unavailable.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])
  return { farms, crops, loading, error }
}
