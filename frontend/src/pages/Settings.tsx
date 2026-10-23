import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/Workspace'
import { useAuth, useDocumentTitle, useTheme } from '@/hooks'
import { usePreferences } from '@/hooks/usePreferences'
export default function Settings() {
  useDocumentTitle('Settings')
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { preferences, save } = usePreferences()
  const [message, setMessage] = useState('')
  function update(key: 'backgroundVideo' | 'motion', value: boolean) {
    try { save({ ...preferences, [key]: value }); setMessage('Preferences saved in this browser.') } catch { setMessage('Browser storage is unavailable. Preferences could not be saved.') }
  }
  return <div className="app-page settings-page"><PageHeader eyebrow="YOUR WORKSPACE" title="Settings" description="Make AgriPulse comfortable for the way you work." />
    <div className="settings-layout"><section className="settings-panel"><h2>Appearance & motion</h2><p>Preferences are saved for this account in this browser. Device reduced-motion and data-saving settings take priority.</p>
      <fieldset className="theme-choices"><legend>Color theme</legend>{(['light','dark'] as const).map(value => <label key={value}><input type="radio" name="theme" checked={theme === value} onChange={() => setTheme(value)} />{value === 'light' ? 'Light' : 'Dark'}</label>)}</fieldset>
      <label className="preference-row"><span><strong>Interface motion</strong><small>Use subtle entrances and transitions.</small></span><input type="checkbox" role="switch" checked={preferences.motion} onChange={e => update('motion', e.target.checked)} /></label>
      <p role="status">{message}</p></section><section className="settings-panel"><h2>Account</h2><dl className="account-facts"><div><dt>Name</dt><dd>{user?.name}</dd></div><div><dt>Email</dt><dd>{user?.email}</dd></div></dl><p>Farm Profile stores your account-level farm details. Operational farms are managed separately in Farms.</p><Link to="/profile" className="text-link">Edit farm profile →</Link></section></div>
  </div>
}
