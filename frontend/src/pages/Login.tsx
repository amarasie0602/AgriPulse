import { LoginForm } from '@/components/auth'
import { ConsoleAuthShell, SmartFieldConsoleFrame } from '@/components/layout'
import { useDocumentTitle } from '@/hooks'

export default function Login() {
  useDocumentTitle('Sign in')

  return (
    <ConsoleAuthShell>
      <div className="w-full animate-slide-up">
        <SmartFieldConsoleFrame>
          <LoginForm />
        </SmartFieldConsoleFrame>
      </div>
    </ConsoleAuthShell>
  )
}
