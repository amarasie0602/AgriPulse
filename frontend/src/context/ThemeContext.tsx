import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'agripulse.theme'

export interface ThemeContextValue {
  theme: Theme
  /** True once the user has explicitly picked a theme, rather than following the system setting. */
  isExplicit: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Applies the theme to <html data-theme="..."> so every app-* CSS token
 * (see index.css) resolves to the right value. index.html sets this
 * attribute once, synchronously, before React mounts, to avoid a flash.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? (prefersDark() ? 'dark' : 'light'))
  const [isExplicit, setIsExplicit] = useState(() => readStoredTheme() !== null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Follow the system setting live, but only until the user makes an explicit choice.
  useEffect(() => {
    if (isExplicit) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setThemeState(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [isExplicit])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    setIsExplicit(true)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable — the choice just won't persist across reloads.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isExplicit, setTheme, toggleTheme }),
    [theme, isExplicit, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
