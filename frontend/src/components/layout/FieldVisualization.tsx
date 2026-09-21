import { useId } from 'react'

const COLUMNS = 8
const ROWS = 7
const CELL = 44
const GAP = 5

/** Data points along the trend line, in viewBox coordinates. */
const DATA_POINTS = [
  { x: 40, y: 690 },
  { x: 150, y: 640 },
  { x: 290, y: 585 },
  { x: 430, y: 520 },
  { x: 570, y: 420 },
]

const TREND_PATH =
  'M40 690 C 90 690, 100 640, 150 640 S 240 660, 290 585 S 380 590, 430 520 S 520 440, 570 420'

/** Deterministic "moisture/yield" tone per parcel so the render is stable between loads. */
function parcelTone(row: number, column: number): 0 | 1 | 2 | 3 | 4 {
  return ((row * 5 + column * 3 + ((row * column) % 4)) % 5) as 0 | 1 | 2 | 3 | 4
}

const PARCELS = Array.from({ length: ROWS * COLUMNS }, (_, index) => {
  const row = Math.floor(index / COLUMNS)
  const column = index % COLUMNS
  return { row, column, tone: parcelTone(row, column) }
})

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  x: 24 + ((index * 97) % 552),
  y: 520 + ((index * 53) % 360),
  r: 1 + (index % 3) * 0.5,
  delay: `${(index * 0.9) % 12}s`,
  duration: `${11 + (index % 5) * 2}s`,
  warm: index % 4 === 0,
}))

/**
 * Abstract "precision agriculture" scene: isometric field parcels, a trend
 * line with data points, and drifting particles. Purely decorative.
 */
export function FieldVisualization({ className }: { className?: string }) {
  const uid = useId().replace(/\W/g, '')
  const fadeMask = `fade-${uid}`
  const fadeGradient = `fade-grad-${uid}`
  const rowsPattern = `rows-${uid}`
  const lineGradient = `line-${uid}`
  const areaGradient = `area-${uid}`

  const gridWidth = COLUMNS * (CELL + GAP)
  const gridHeight = ROWS * (CELL + GAP)

  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={fadeGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.28" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={fadeMask}>
          <rect width="600" height="900" fill={`url(#${fadeGradient})`} />
        </mask>

        <pattern id={rowsPattern} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3H6" stroke="#b1c8a8" strokeOpacity="0.55" strokeWidth="1.2" />
        </pattern>

        <linearGradient id={lineGradient} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8fae86" />
          <stop offset="1" stopColor="#e7c98a" />
        </linearGradient>
        <linearGradient id={areaGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7c98a" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e7c98a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Isometric field parcels */}
      <g mask={`url(#${fadeMask})`}>
        <g transform={`translate(300 640) scale(1 0.55) rotate(45) translate(${-gridWidth / 2} ${-gridHeight / 2})`}>
          {PARCELS.map(({ row, column, tone }) => {
            const x = column * (CELL + GAP)
            const y = row * (CELL + GAP)
            const fill =
              tone === 0
                ? 'rgb(143 174 134 / 0.14)'
                : tone === 1
                  ? 'rgb(143 174 134 / 0.28)'
                  : tone === 2
                    ? `url(#${rowsPattern})`
                    : tone === 3
                      ? 'rgb(231 201 138 / 0.22)'
                      : 'rgb(255 255 255 / 0.03)'
            return (
              <rect
                key={`${row}-${column}`}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx="5"
                fill={fill}
                stroke="rgb(255 255 255 / 0.14)"
                strokeWidth="0.8"
              />
            )
          })}
        </g>
      </g>

      {/* Trend area + line */}
      <path d={`${TREND_PATH} L570 900 L40 900 Z`} fill={`url(#${areaGradient})`} />
      <path
        d={TREND_PATH}
        pathLength={1}
        fill="none"
        stroke={`url(#${lineGradient})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1"
        className="animate-draw"
      />

      {/* Data points with guides */}
      {DATA_POINTS.map(({ x, y }, index) => (
        <g key={x}>
          <line x1={x} y1={y + 8} x2={x} y2={y + 70} stroke="#b1c8a8" strokeOpacity="0.22" strokeDasharray="2 4" />
          <circle
            cx={x}
            cy={y}
            r="9"
            fill="none"
            stroke="#e7c98a"
            strokeOpacity="0.45"
            className="animate-pulse-dot"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${index * 0.5}s` }}
          />
          <circle cx={x} cy={y} r="3.5" fill="#f4efe6" />
        </g>
      ))}

      {/* Drifting particles */}
      {PARTICLES.map((particle, index) => (
        <circle
          key={index}
          cx={particle.x}
          cy={particle.y}
          r={particle.r}
          fill={particle.warm ? '#e7c98a' : '#b1c8a8'}
          className="animate-particle"
          style={{ animationDelay: particle.delay, animationDuration: particle.duration }}
        />
      ))}
    </svg>
  )
}
