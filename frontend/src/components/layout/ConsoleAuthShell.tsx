import { Leaf, Droplets, BarChart3, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'

const benefits = [
  { icon: Droplets, title: 'Make every input count', description: 'Track water, energy, and the resources behind each season.' },
  { icon: BarChart3, title: 'See the bigger picture', description: 'Understand your farm through practical, data-led insights.' },
  { icon: Leaf, title: 'Grow with tomorrow in mind', description: 'Build a clearer view of your environmental impact.' },
]

export function ConsoleAuthShell({ children }: { children: ReactNode }) {
  return <div className="auth-shell">
    <a href="#auth-form" className="auth-skip">Skip to form</a>
    <section className="auth-story" aria-label="About AgriPulse">
      <Logo tone="dark" />
      <div className="auth-story-content">
        <p className="eyebrow">A MORE THOUGHTFUL WAY TO FARM</p>
        <h1>Healthy farms.<br /><em>Lasting impact.</em></h1>
        <p className="auth-introduction">Bring your farms, resources, and sustainability insights together in one considered workspace.</p>
        <div className="auth-benefits">{benefits.map(({ icon: Icon, title, description }) => <div key={title}><span><Icon size={19} aria-hidden="true" /></span><div><h2>{title}</h2><p>{description}</p></div></div>)}</div>
      </div>
      <p className="auth-story-footer">Made for the people growing a better future. <ArrowUpRight size={16} aria-hidden="true" /></p>
    </section>
    <main id="auth-form" className="auth-form-panel">
      {children}
      <p className="auth-form-footer">AG R I P U L S E <span>Farm sustainability & resource management</span></p>
    </main>
  </div>
}
