import { RegisterForm } from '@/components/auth'
import { ConsoleAuthShell } from '@/components/layout'
import { useDocumentTitle } from '@/hooks'

export default function Register() {
  useDocumentTitle('Create account')

  return (
    <ConsoleAuthShell>
      <div className="flex w-full justify-center animate-slide-up">
        <RegisterForm />
      </div>
    </ConsoleAuthShell>
  )
}
