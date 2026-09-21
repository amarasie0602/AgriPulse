import { useId } from 'react'
import { cn } from '@/utils/cn'

interface LogoProps {
  /** `light` is for dark backgrounds, `dark` for light ones. */
  tone?: 'light' | 'dark'
  className?: string
}

export function LogoMark({ className }: { className?: string }) {
  // Unique per instance: gradients inside a display:none SVG would otherwise break other copies.
  const gradientId = `mark-${useId().replace(/\W/g, '')}`

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5a44" />
          <stop offset="1" stopColor="#0a241a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" />
      <path
        d="M6 20c3.5 0 4.5-8 8-8s4 8 6.5 8 3-5 5.5-5"
        fill="none"
        stroke="#e7c98a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="10.6" rx="1.4" ry="2.6" transform="rotate(-35 14 10.6)" fill="#f4efe6" />
    </svg>
  )
}

export function Logo({ tone = 'dark', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="size-9 drop-shadow-sm" />
      <span
        className={cn(
          'font-display text-[1.4rem] leading-none font-semibold tracking-tight',
          tone === 'light' ? 'text-bone-50' : 'text-forest-900',
        )}
      >
        Agri<span className={tone === 'light' ? 'text-wheat-300' : 'text-clay-600'}>Pulse</span>
      </span>
    </div>
  )
}
