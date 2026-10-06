import { useId } from 'react'
import { cn } from '@/utils/cn'

interface ProgressRingProps {
  /** 0-100. */
  value: number
  size?: number
  strokeWidth?: number
  /** Gradient stops for the progress arc, e.g. ['#3b7a60', '#8fae86']. */
  gradient: [string, string]
  trackColor?: string
  label: string
  caption?: string
  className?: string
}

/** A single-value circular progress ring — a gradient arc over a faint track, used for scores like 0-100. */
export function ProgressRing({
  value,
  size = 128,
  strokeWidth = 10,
  gradient,
  trackColor = 'rgba(255,255,255,0.12)',
  label,
  caption,
  className,
}: ProgressRingProps) {
  const uid = useId().replace(/\W/g, '')
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const dash = (clamped / 100) * circumference

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${label}: ${clamped}`}>
        <defs>
          <linearGradient id={`ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${uid})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="46%" textAnchor="middle" fontSize={size * 0.26} fontWeight={600} fill="#fbf9f4">
          {Math.round(clamped)}
        </text>
        {caption && (
          <text x="50%" y="63%" textAnchor="middle" fontSize={size * 0.09} fill="#b1c8a8">
            {caption}
          </text>
        )}
      </svg>
    </div>
  )
}
