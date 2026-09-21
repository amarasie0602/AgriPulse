import { Alert } from '@/components/ui/Alert'
import { DEMO_CREDENTIALS } from '@/services/mockAuthService'

interface DemoModeNoticeProps {
  /** When provided, shows a button that fills in the demo account. */
  onUseDemo?: () => void
}

/** Shown only while the offline demo auth service is active. */
export function DemoModeNotice({ onUseDemo }: DemoModeNoticeProps) {
  return (
    <Alert tone="info" className="mb-5">
      <span className="font-semibold">Demo mode — no backend needed.</span>{' '}
      {onUseDemo ? (
        <>
          Sign in with {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}, or{' '}
          <button
            type="button"
            onClick={onUseDemo}
            className="rounded font-semibold underline underline-offset-2 hover:text-forest-700"
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
