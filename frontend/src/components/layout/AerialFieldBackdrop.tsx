import { useId } from 'react'
import { ContourLines } from './ContourLines'

const COLS = 14
const ROWS = 10

/** Deterministic per-parcel tone so the render is stable between loads. */
function parcelTone(row: number, col: number): 0 | 1 | 2 | 3 {
  return ((row * 7 + col * 5 + ((row + col) % 3)) % 4) as 0 | 1 | 2 | 3
}

const PARCELS = Array.from({ length: ROWS * COLS }, (_, index) => {
  const row = Math.floor(index / COLS)
  const col = index % COLS
  return { row, col, tone: parcelTone(row, col) }
})

/**
 * Full-bleed aerial farmland: a top-down grid of irregular field parcels with
 * boundary lines, plus faint contour lines. Purely decorative, sits behind
 * everything else in the console scene.
 */
export function AerialFieldBackdrop({ className }: { className?: string }) {
  const uid = useId().replace(/\W/g, '')
  const vignetteId = `vignette-${uid}`

  const cellW = 100 / COLS
  const cellH = 100 / ROWS

  return (
    <div className={className}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={vignetteId} cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#0c2a20" stopOpacity="0" />
            <stop offset="60%" stopColor="#071a13" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#050f0b" stopOpacity="0.92" />
          </radialGradient>
        </defs>

        <g transform="rotate(-4 50 50) scale(1.15) translate(-6 -8)">
          {PARCELS.map(({ row, col, tone }) => {
            const fill =
              tone === 0
                ? 'rgb(37 97 73 / 0.55)'
                : tone === 1
                  ? 'rgb(26 77 58 / 0.6)'
                  : tone === 2
                    ? 'rgb(143 174 134 / 0.12)'
                    : 'rgb(231 201 138 / 0.06)'
            return (
              <rect
                key={`${row}-${col}`}
                x={col * cellW}
                y={row * cellH}
                width={cellW}
                height={cellH}
                fill={fill}
                stroke="rgb(211 224 204 / 0.1)"
                strokeWidth="0.12"
              />
            )
          })}
        </g>

        <rect width="100" height="100" fill={`url(#${vignetteId})`} />
      </svg>

      <ContourLines className="absolute inset-0 size-full opacity-70" />
    </div>
  )
}
