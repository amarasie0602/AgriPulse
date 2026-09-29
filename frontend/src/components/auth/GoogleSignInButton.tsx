import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Button } from '@/components/ui/Button'
import { GoogleIcon } from '@/components/ui/GoogleIcon'
import { isGoogleAuthEnabled } from '@/config/google'
import { useAuth } from '@/hooks/useAuth'
import { useElementWidth } from '@/hooks/useElementWidth'

interface GoogleSignInButtonProps {
  /** Called once the app's own session is established. */
  onSuccess: () => void
  onError: (message: string) => void
  /** Whether Google's own account picker asks to sign in or to create an account. */
  intent?: 'signin' | 'signup'
  disabled?: boolean
}

const GOOGLE_BUTTON_MIN_WIDTH = 200
const GOOGLE_BUTTON_MAX_WIDTH = 400

/**
 * Real "Continue with Google" when VITE_GOOGLE_CLIENT_ID is configured (see .env.example);
 * otherwise a disabled placeholder that explains what's missing, so the UI never claims a
 * capability that isn't actually wired up.
 */
export function GoogleSignInButton({ onSuccess, onError, intent = 'signin', disabled }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth()
  const { ref, width } = useElementWidth<HTMLDivElement>()

  if (!isGoogleAuthEnabled) {
    return (
      <Button
        variant="secondary"
        fullWidth
        disabled
        leftIcon={<GoogleIcon className="size-4.5" />}
        aria-label="Continue with Google (not set up yet)"
        title="Add VITE_GOOGLE_CLIENT_ID (see .env.example) to enable Google sign-in"
      >
        Continue with Google
        <span className="ml-2 rounded-full border border-bone-300 bg-bone-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-soft uppercase">
          Setup needed
        </span>
      </Button>
    )
  }

  async function handleSuccess(response: CredentialResponse): Promise<void> {
    if (!response.credential) {
      onError('Google sign-in failed. Please try again.')
      return
    }
    try {
      await loginWithGoogle(response.credential)
      onSuccess()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.')
    }
  }

  return (
    <div ref={ref} className={disabled ? 'pointer-events-none opacity-50' : undefined}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError('Google sign-in failed. Please try again.')}
        theme="outline"
        shape="pill"
        size="large"
        text={intent === 'signup' ? 'signup_with' : 'continue_with'}
        logo_alignment="left"
        width={Math.round(Math.min(Math.max(width || GOOGLE_BUTTON_MIN_WIDTH, GOOGLE_BUTTON_MIN_WIDTH), GOOGLE_BUTTON_MAX_WIDTH))}
      />
    </div>
  )
}
