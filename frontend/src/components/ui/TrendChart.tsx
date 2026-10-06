import { useId } from 'react'
import { cn } from '@/utils/cn'

export interface TrendChartPoint {
  label: string
  value: number
}

interface TrendChartProps {
  points: TrendChartPoint[]
  /** `dark` is for glass panels over a dark background. */
  tone?: 'light' | 'dark'
  /** Shown next to each point's value in the hidden a11y description. */
  unit?: string
  className?: string
  /** Compact mode drops axis labels — used for small per-type sparklines. */
  compact?: boolean
}

const WIDTH = 480
const HEIGHT = 200
const PAD_X = 12
const PAD_TOP = 16
const PAD_BOTTOM = 28

/** A simple line + area chart over month-bucketed points. No charting library — consistent with the rest of the app's hand-rolled SVG visuals. */
export function TrendChart({ points, tone = 'light', unit, className, compact = false }: TrendChartProps) {
  const uid = useId().replace(/\W/g, '')
  const gradientId = `trend-${uid}`
  const dark = tone === 'dark'
  const bottomPad = compact ? 4 : PAD_BOTTOM

  if (points.length === 0) return null

  const max = Math.max(...points.map((point) => point.value), 1)
  const plotWidth = WIDTH - PAD_X * 2
  const plotHeight = HEIGHT - PAD_TOP - bottomPad

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? WIDTH / 2 : PAD_X + (index / (points.length - 1)) * plotWidth
    const y = PAD_TOP + plotHeight - (point.value / max) * plotHeight
    return { ...point, index, x, y }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${HEIGHT - bottomPad} L ${coords[0].x} ${HEIGHT - bottomPad} Z`

  const lineColor = dark ? '#e7c98a' : '#1a4d3a'
  const labelColor = dark ? '#b1c8a8' : '#52605a'
  // Show at most ~6 x-axis labels so they don't overlap on a long history.
  const labelStride = Math.max(1, Math.ceil(coords.length / 6))

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT - bottomPad + (compact ? 4 : 0)}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-full"
        role="img"
        aria-label={`Trend over time: ${points.map((p) => `${p.label} ${p.value}${unit ? ` ${unit}` : ''}`).join(', ')}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={dark ? 0.35 : 0.22} />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c) => (
          <circle key={c.index} cx={c.x} cy={c.y} r={compact ? 2 : 3} fill={lineColor} />
        ))}

        {!compact &&
          coords.map((c, index) => (
            <text
              key={c.index}
              x={c.x}
              y={HEIGHT - 8}
              textAnchor={index === 0 ? 'start' : index === coords.length - 1 ? 'end' : 'middle'}
              fontSize="11"
              fill={labelColor}
              className={index % labelStride !== 0 && index !== coords.length - 1 ? 'hidden sm:block' : undefined}
            >
              {c.label}
            </text>
          ))}
      </svg>
    </div>
  )
}

/** A bare mono-color sparkline, no axis, for a small inline trend (e.g. in a stat card). */
export function Sparkline({ points, tone = 'light', unit, className }: Omit<TrendChartProps, 'compact'>) {
  return <TrendChart points={points} tone={tone} unit={unit} className={cn('h-16', className)} compact />
}
