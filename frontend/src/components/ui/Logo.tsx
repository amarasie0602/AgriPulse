import { useId } from 'react'
import { cn } from '@/utils/cn'

export function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/\W/g, '')
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <defs><linearGradient id={`leaf-${uid}`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#77ad4c" /><stop offset="1" stopColor="#c2e79a" /></linearGradient></defs>
    <path d="M25 42C10 43 4 32 5 16c15 1 24 9 20 26Z" fill="#9ccb78" />
    <path d="M25 39C17 22 24 9 44 4c2 18-3 34-19 35Z" fill={`url(#leaf-${uid})`} />
    <path d="M25 45c-1-16 6-28 14-35M24 42 11 24" fill="none" stroke="#eff8d8" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
}

export function Logo({ tone = 'dark', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return <div className={cn('agripulse-logo flex items-center gap-2.5', className)}><LogoMark className="size-10 shrink-0" /><span className={cn('font-sans text-[1.6rem] leading-none font-bold tracking-tight', tone === 'light' ? 'text-bone-50' : 'text-forest-900')}>AgriPulse</span></div>
}
