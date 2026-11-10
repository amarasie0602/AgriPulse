import { AuthStory } from '@/components/auth/AuthStory'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { MEDIA } from '@/utils/media'
import { Photo } from '@/components/ui/Photo'

export function ConsoleAuthShell({ children }: { children: ReactNode }) {
  const registration = useLocation().pathname === '/register'
  return <div className={`auth-shell photographic-auth${registration ? ' registration-auth' : ''}`}>
    <Photo asset={registration ? MEDIA.register : MEDIA.login} className="auth-landscape" eager />
    <a href="#auth-form" className="auth-skip">Skip to form</a>
    <section className="auth-story" aria-label="About AgriPulse"><Logo tone="light" /><AuthStory /></section>
    <main id="auth-form" className="auth-form-panel">{children}<p className="auth-form-footer">AgriPulse <span>Farm sustainability & resource management</span></p></main>
  </div>
}
