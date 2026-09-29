import { Alert } from '@/components/ui/Alert'
import { DEMO_CREDENTIALS } from '@/services/mockAuthService'
import { cn } from '@/utils/cn'

interface DemoModeNoticeProps {
  /** When provided, shows a button that fills in the demo account. */
  onUseDemo?: () => void
  /** `dark` is for glass panels over a dark background (e.g. the login console). */
  surface?: 'light' | 'dark'
}

/** Shown only while the offline demo auth service is active. */
export function DemoModeNotice({ onUseDemo, surface = 'light' }: DemoModeNoticeProps) {
  const dark = surface === 'dark'

  return (
    <Alert tone="info" surface={surface} className="mb-5">
      <span className="font-semibold">Demo mode — no backend needed.</span>{' '}
      {onUseDemo ? (
        <>
          Sign in with {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}, or{' '}
          <button
            type="button"
            onClick={onUseDemo}
            className={cn(
              'rounded font-semibold underline underline-offset-2',
              dark ? 'hover:text-wheat-100' : 'hover:text-forest-700',
            )}
          >
            fill it in for me
          </button>
          .
        </>
      ) : (
        <>Accounts are stored only in this browser.</>
      )}
    </Alert>
  )
}
