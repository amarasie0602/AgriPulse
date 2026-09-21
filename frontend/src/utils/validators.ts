/** Each validator returns an error message, or undefined when the value is valid. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

export function validateName(value: string): string | undefined {
  const name = value.trim()
  if (!name) return 'Please enter your full name.'
  if (name.length < 2) return 'Your name must be at least 2 characters.'
  if (name.length > 80) return 'Your name must be 80 characters or fewer.'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`
  }
  return undefined
}

export function validateConfirmPassword(value: string, password: string): string | undefined {
  if (!value) return 'Please confirm your password.'
  if (value !== password) return 'Passwords do not match.'
  return undefined
}

export function validateFarmName(value: string): string | undefined {
  if (value.trim().length > 80) return 'Farm name must be 80 characters or fewer.'
  return undefined
}

/** Quick strength read-out for the registration form (0–4). Guidance only, not enforced. */
export function getPasswordStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  if (!value) return 0
  let score = 0
  if (value.length >= PASSWORD_MIN_LENGTH) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}
