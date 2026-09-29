import { useId } from 'react'
import { ContourLines } from './ContourLines'

const COLS = 11
const ROWS = 8

/** Deterministic per-parcel tone so the render is stable between loads. */
function parcelTone(row: number, col: number): 0 | 1 | 2 | 3 | 4 {
  return ((row * 7 + col * 5 + ((row + col) % 3) * 2) % 5) as 0 | 1 | 2 | 3 | 4
}

const PARCELS = Array.from({ length: ROWS * COLS }, (_, index) => {
  const row = Math.floor(index / COLS)
  const col = index % COLS
  return { row, col, tone: parcelTone(row, col) }
})

/**
 * Full-bleed aerial farmland: a soft, top-down patchwork of field parcels
 * with faint boundaries, blurred like a satellite photo rather than a sharp
 * grid, plus faint contour lines. Purely decorative.
 */
export function AerialFieldBackdrop({ className }: { className?: string }) {
  const uid = useId().replace(/\W/g, '')
  const vignetteId = `vignette-${uid}`
  const softenId = `soften-${uid}`

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
          <filter id={softenId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          <radialGradient id={vignetteId} cx="50%" cy="40%" r="72%">
            <stop offset="0%" stopColor="#0c2a20" stopOpacity="0" />
            <stop offset="55%" stopColor="#071a13" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#040c09" stopOpacity="0.94" />
          </radialGradient>
        </defs>

        <g filter={`url(#${softenId})`} transform="rotate(-3 50 50) scale(1.18) translate(-8 -9)">
          {PARCELS.map(({ row, col, tone }) => {
            const fill =
              tone === 0
                ? 'rgb(37 97 73 / 0.38)'
                : tone === 1
                  ? 'rgb(26 77 58 / 0.42)'
                  : tone === 2
                    ? 'rgb(143 174 134 / 0.1)'
                    : tone === 3
                      ? 'rgb(231 201 138 / 0.05)'
                      : 'rgb(18 58 44 / 0.5)'
            return (
              <rect
                key={`${row}-${col}`}
                x={col * cellW}
                y={row * cellH}
                width={cellW * 0.94}
                height={cellH * 0.94}
                rx="0.6"
                fill={fill}
              />
            )
          })}
        </g>

        <rect width="100" height="100" fill={`url(#${vignetteId})`} />
      </svg>

      <ContourLines className="absolute inset-0 size-full opacity-90" />
    </div>
  )
}
