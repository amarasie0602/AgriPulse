import { RegisterForm } from '@/components/auth'
import { AuthLayout } from '@/components/layout'
import { useDocumentTitle } from '@/hooks'

export default function Register() {
  useDocumentTitle('Create account')

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
