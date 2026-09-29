import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Divider } from '@/components/ui/Divider'
import { TextField } from '@/components/ui/TextField'
import { isMockAuthEnabled } from '@/services/authService'
import { DEMO_CREDENTIALS } from '@/services/mockAuthService'
import { useAuth } from '@/hooks/useAuth'
import { useForm, type Validators } from '@/hooks/useForm'
import type { AuthLocationState } from '@/types'
import { validateEmail, validatePassword } from '@/utils/validators'
import { DemoModeNotice } from './DemoModeNotice'
import { GoogleSignInButton } from './GoogleSignInButton'
import { PasswordInput } from './PasswordInput'

interface LoginValues extends Record<string, string> {
  email: string
  password: string
}

const validators: Validators<LoginValues> = {
  email: validateEmail,
  password: validatePassword,
}

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as AuthLocationState

  const formRef = useRef<HTMLFormElement>(null)
  const { validate, getFieldProps, setValue, values } = useForm<LoginValues>(
    { email: state.email ?? '', password: '' },
    validators,
  )
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showResetNotice, setShowResetNotice] = useState(false)

  const goToDestination = () => navigate(state.from ?? '/dashboard', { replace: true })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !validate(formRef.current)) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await login({ email: values.email, password: values.password }, { remember })
      goToDestination()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-bone-300/70 bg-bone-50/80 p-7 shadow-card backdrop-blur-sm sm:p-9">
      <div className="mb-7">
        <h1 className="font-display text-[2rem] leading-tight font-medium tracking-tight text-forest-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-ink-soft">Sign in to your AgriPulse account</p>
      </div>

      {isMockAuthEnabled && (
        <DemoModeNotice
          onUseDemo={() => {
            setValue('email', DEMO_CREDENTIALS.email)
            setValue('password', DEMO_CREDENTIALS.password)
          }}
        />
      )}
      {state.registered && (
        <Alert tone="success" className="mb-5">
          Account created. Sign in to continue.
        </Alert>
      )}
      {state.reason === 'expired' && (
        <Alert tone="info" className="mb-5">
          Your session has expired. Please sign in again.
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          {...getFieldProps('email')}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@farm.com"
          leftIcon={Mail}
          disabled={submitting}
        />

        <PasswordInput
          {...getFieldProps('password')}
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={submitting}
        />

        <div className="flex items-center justify-between gap-4">
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={submitting}
          />
          <button
            type="button"
            onClick={() => setShowResetNotice((current) => !current)}
            aria-expanded={showResetNotice}
            className="rounded text-sm font-semibold text-forest-700 underline-offset-4 hover:text-forest-900 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {showResetNotice && (
          <Alert tone="info">
            Password reset isn't available yet. Please contact your AgriPulse administrator for help.
          </Alert>
        )}

        {submitError && <Alert tone="error">{submitError}</Alert>}

        <Button type="submit" fullWidth loading={submitting} loadingText="Signing in…">
          Sign In
        </Button>
      </form>

      <div className="my-6">
        <Divider label="OR" />
      </div>

      <GoogleSignInButton
        intent="signin"
        disabled={submitting}
        onSuccess={goToDestination}
        onError={(message) => setSubmitError(message)}
      />

      <p className="mt-7 text-center text-sm text-ink-soft">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="rounded font-semibold text-forest-700 underline-offset-4 hover:text-forest-900 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
