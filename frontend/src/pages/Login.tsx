import { LoginForm } from '@/components/auth'
import { AuthLayout } from '@/components/layout'
import { useDocumentTitle } from '@/hooks'

export default function Login() {
  useDocumentTitle('Sign in')

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
