import { useId } from 'react'
import { cn } from '@/utils/cn'

export interface DonutChartSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutChartSegment[]
  /** Big number in the center of the ring, e.g. a formatted total. */
  centerValue: string
  /** Small line under the center value, e.g. a unit or caption. */
  centerCaption?: string
  /** `dark` is for glass panels over a dark background. */
  tone?: 'light' | 'dark'
  size?: number
  className?: string
}

const STROKE_WIDTH = 18

/** A hand-rolled SVG donut chart (concentric-circle stroke-dasharray technique) — no charting library, consistent with the rest of the app's inline SVG visuals. */
export function DonutChart({ segments, centerValue, centerCaption, tone = 'light', size = 176, className }: DonutChartProps) {
  const uid = useId().replace(/\W/g, '')
  const dark = tone === 'dark'
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = size / 2 - STROKE_WIDTH / 2
  const circumference = 2 * Math.PI * radius
  const trackColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,77,58,0.08)'
  const valueColor = dark ? '#f3ecd9' : '#1a2420'
  const captionColor = dark ? '#b1c8a8' : '#52605a'

  let offset = 0
  const arcs = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const fraction = total > 0 ? segment.value / total : 0
      const dash = fraction * circumference
      const arc = { ...segment, dash, offset }
      offset += dash
      return arc
    })

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={`${centerValue}${centerCaption ? ` ${centerCaption}` : ''}: ${segments
          .map((s) => `${s.label} ${s.value}`)
          .join(', ')}`}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={STROKE_WIDTH} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((arc, index) => (
            <circle
              key={`${uid}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap={arcs.length > 1 ? 'butt' : 'round'}
            />
          ))}
        </g>
        <text x="50%" y="48%" textAnchor="middle" fontSize={size * 0.15} fontWeight={500} fill={valueColor}>
          {centerValue}
        </text>
        {centerCaption && (
          <text x="50%" y="64%" textAnchor="middle" fontSize={size * 0.065} fill={captionColor}>
            {centerCaption}
          </text>
        )}
      </svg>
    </div>
  )
}
