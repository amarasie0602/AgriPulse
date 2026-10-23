import { cn } from '@/utils/cn'

export function LogoMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect x="1" y="1" width="46" height="46" rx="11" fill="#244d3c" />
    <path d="M11 33c9-13 17-15 26-16M12 38c9-10 17-13 25-14M12 26c7-9 13-12 20-13" fill="none" stroke="#e9eee0" strokeWidth="2" strokeLinecap="round" />
  </svg>
}

export function Logo({ tone = 'dark', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return <div className={cn('agripulse-logo flex items-center gap-2.5', className)}><LogoMark className="size-10 shrink-0" /><span className={cn('font-sans text-[1.6rem] leading-none font-bold tracking-tight', tone === 'light' ? 'text-bone-50' : 'text-forest-900')}>AgriPulse</span></div>
}
