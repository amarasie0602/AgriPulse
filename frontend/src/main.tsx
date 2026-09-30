import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { googleClientId, isGoogleAuthEnabled } from './config/google'
import './index.css'

/** Only wraps with GoogleOAuthProvider when a Client ID is actually configured. */
function GoogleProvider({ children }: { children: ReactNode }) {
  if (!isGoogleAuthEnabled || !googleClientId) return children
  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <GoogleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GoogleProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
