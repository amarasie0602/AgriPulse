/** State passed through React Router `navigate()` between the auth screens. */
export interface AuthLocationState {
  /** Path the user originally asked for before being sent to /login. */
  from?: string
  /** Why the user landed on /login. */
  reason?: 'expired'
  /** Set after a successful registration. */
  registered?: boolean
  /** Pre-fills the login email after registration. */
  email?: string
}
