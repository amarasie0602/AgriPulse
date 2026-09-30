import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleCheck, Mail, Sprout, User } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { TextField } from '@/components/ui/TextField'
import { isMockAuthEnabled } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { useForm, type Validators } from '@/hooks/useForm'
import type { AuthLocationState } from '@/types'
import {
  validateConfirmPassword,
  validateEmail,
  validateFarmName,
  validateName,
  validatePassword,
} from '@/utils/validators'
import { DemoModeNotice } from './DemoModeNotice'
import { GoogleSignInButton } from './GoogleSignInButton'
import { PasswordInput } from './PasswordInput'
import { PasswordStrength } from './PasswordStrength'

interface RegisterValues extends Record<string, string> {
  name: string
  email: string
  password: string
  confirmPassword: string
  farmName: string
}

const validators: Validators<RegisterValues> = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  confirmPassword: (value, values) => validateConfirmPassword(value, values.password),
  farmName: validateFarmName,
}

/** How long the success state stays visible before moving on to sign in. */
const SUCCESS_DELAY_MS = 1100

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const formRef = useRef<HTMLFormElement>(null)
  const { validate, getFieldProps, values } = useForm<RegisterValues>(
    { name: '', email: '', password: '', confirmPassword: '', farmName: '' },
    validators,
  )
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!succeeded) return
    const state: AuthLocationState = { registered: true, email: values.email.trim() }
    const timer = window.setTimeout(() => navigate('/login', { replace: true, state }), SUCCESS_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [succeeded, navigate, values.email])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || succeeded || !validate(formRef.current)) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        farmName: values.farmName,
      })
      setSucceeded(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const locked = submitting || succeeded

  // Google has no separate "confirm your details" step: a successful sign-in
  // means the account already exists (created on first sign-in if needed),
  // so it goes straight to the workspace instead of back to /login.
  function handleGoogleSuccess(): void {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="w-full max-w-[26rem] rounded-[2rem] border border-white/12 bg-forest-900/55 p-6 shadow-glass backdrop-blur-2xl sm:p-7">
      <div className="mb-4">
        <h1 className="font-display text-[1.6rem] leading-tight font-medium tracking-tight text-bone-50">
          Create your account
        </h1>
        <p className="mt-1 text-[0.9rem] text-moss-200/85">Start understanding your farm's sustainability</p>
      </div>

      {isMockAuthEnabled && <DemoModeNotice surface="dark" />}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-3">
        <TextField
          {...getFieldProps('name')}
          label="Full Name"
          tone="dark"
          autoComplete="name"
          placeholder="Jane Perera"
          leftIcon={User}
          disabled={locked}
        />

        <TextField
          {...getFieldProps('email')}
          label="Email"
          tone="dark"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@farm.com"
          leftIcon={Mail}
          disabled={locked}
        />

        <PasswordInput
          {...getFieldProps('password')}
          tone="dark"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={locked}
        />
        <PasswordStrength password={values.password} />

        <PasswordInput
          {...getFieldProps('confirmPassword')}
          label="Confirm Password"
          tone="dark"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          disabled={locked}
        />

        <TextField
          {...getFieldProps('farmName')}
          label="Farm Name"
          tone="dark"
          optional
          autoComplete="organization"
          placeholder="Green Valley Farm"
          leftIcon={Sprout}
          disabled={locked}
        />

        {submitError && (
          <Alert tone="error" surface="dark">
            {submitError}
          </Alert>
        )}

        {succeeded ? (
          <div
            role="status"
            className="flex h-12 animate-fade-in items-center justify-center gap-2.5 rounded-xl bg-moss-400/20 text-[0.95rem] font-semibold text-moss-200"
          >
            <CircleCheck className="size-5" aria-hidden="true" />
            Account created
          </div>
        ) : (
          <Button
            type="submit"
            variant="gold"
            fullWidth
            loading={submitting}
            loadingText="Creating account…"
            leftIcon={!submitting ? <ArrowRight className="size-4.5" aria-hidden="true" /> : undefined}
          >
            Create Account
          </Button>
        )}
      </form>

      <div className="my-4">
        <Divider label="OR" tone="dark" />
      </div>

      <GoogleSignInButton
        intent="signup"
        tone="dark"
        disabled={locked}
        onSuccess={handleGoogleSuccess}
        onError={(message) => setSubmitError(message)}
      />

      <p className="mt-4 text-center text-sm text-moss-200/85">
        Already have an account?{' '}
        <Link
          to="/login"
          className="rounded font-semibold text-wheat-300 underline-offset-4 hover:text-wheat-200 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
