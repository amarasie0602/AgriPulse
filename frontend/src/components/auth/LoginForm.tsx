import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Divider } from '@/components/ui/Divider'
import { GoogleIcon } from '@/components/ui/GoogleIcon'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import { useForm, type Validators } from '@/hooks/useForm'
import type { AuthLocationState } from '@/types'
import { validateEmail, validatePassword } from '@/utils/validators'
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
  const { validate, getFieldProps, values } = useForm<LoginValues>(
    { email: state.email ?? '', password: '' },
    validators,
  )
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showResetNotice, setShowResetNotice] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !validate(formRef.current)) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await login({ email: values.email, password: values.password }, { remember })
      navigate(state.from ?? '/dashboard', { replace: true })
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

      <Button
        variant="secondary"
        fullWidth
        disabled
        leftIcon={<GoogleIcon className="size-4.5" />}
        aria-label="Continue with Google (not available yet)"
        title="Google sign-in isn't available yet"
      >
        Continue with Google
        <span className="ml-2 rounded-full border border-bone-300 bg-bone-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-soft uppercase">
          Soon
        </span>
      </Button>

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
