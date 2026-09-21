import { getPasswordStrength } from '@/utils/validators'
import { cn } from '@/utils/cn'

const LEVELS = [
  { label: '', bar: '' },
  { label: 'Weak', bar: 'bg-clay-500' },
  { label: 'Fair', bar: 'bg-wheat-500' },
  { label: 'Good', bar: 'bg-moss-400' },
  { label: 'Strong', bar: 'bg-forest-600' },
] as const

/** Visual guidance only — the only enforced rule is the minimum length. */
export function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password)
  if (!password) return null

  return (
    <div className="-mt-1 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              segment <= score ? LEVELS[score].bar : 'bg-bone-300',
            )}
          />
        ))}
      </div>
      <span className="w-12 text-right text-xs font-medium text-ink-soft">
        <span className="sr-only">Password strength: </span>
        {LEVELS[score].label}
      </span>
    </div>
  )
}
