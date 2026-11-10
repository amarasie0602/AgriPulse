import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
export interface Preferences { backgroundVideo: boolean; motion: boolean }
const defaults: Preferences = { backgroundVideo: true, motion: true }
export function usePreferences() {
  const { user } = useAuth()
  const key = `agripulse.preferences.${user?.id ?? 'guest'}`
  const read = useCallback((): Preferences => {
    try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return { backgroundVideo: typeof value.backgroundVideo === 'boolean' ? value.backgroundVideo : true, motion: typeof value.motion === 'boolean' ? value.motion : true } } catch { return defaults }
  }, [key])
  const [preferences, setPreferences] = useState(read)
  useEffect(() => { const update = () => setPreferences(read()); update(); window.addEventListener('agripulse-preferences', update); window.addEventListener('storage', update); return () => { window.removeEventListener('agripulse-preferences', update); window.removeEventListener('storage', update) } }, [read])
  const save = (next: Preferences) => { localStorage.setItem(key, JSON.stringify(next)); setPreferences(next); window.dispatchEvent(new Event('agripulse-preferences')) }
  return { preferences, save }
}
