import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
}

/** Switches the dashboard between light and dark. Never shown on the always-dark login console. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg text-app-ink-soft transition-colors hover:bg-app-accent/8',
        className,
      )}
    >
      {isDark ? <Sun className="size-4.5" aria-hidden="true" /> : <Moon className="size-4.5" aria-hidden="true" />}
    </button>
  )
}
