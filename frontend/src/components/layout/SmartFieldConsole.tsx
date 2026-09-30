import { useId } from 'react'

/** Points on the ring where connector spokes reach out toward the metric cards. */
const SPOKE_ANGLES = [-58, -122, 58, 122]
/** Small glowing telemetry nodes scattered across the rings; a few pulse. */
const NODES = [
  { angle: 20, radius: 46, pulse: true },
  { angle: 96, radius: 38, pulse: false },
  { angle: 154, radius: 46, pulse: true },
  { angle: 205, radius: 30, pulse: false },
  { angle: 250, radius: 38, pulse: true },
  { angle: 300, radius: 46, pulse: false },
  { angle: 340, radius: 30, pulse: false },
]

function toXY(angleDeg: number, radius: number, cx = 50, cy = 50) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

/**
 * The decorative "Smart Field Console" — concentric rings, a radial progress
 * arc, glowing telemetry nodes and spokes reaching toward the metric cards.
 * Purely decorative; the real login form sits in a panel layered on top.
 */
export function SmartFieldConsole({ className }: { className?: string }) {
  const uid = useId().replace(/\W/g, '')
  const glowId = `console-glow-${uid}`

  const progressRadius = 34
  const circumference = 2 * Math.PI * progressRadius
  const progress = 0.72

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e7c98a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#e7c98a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="49" fill={`url(#${glowId})`} />

      {/* Concentric rings */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#b1c8a8" strokeOpacity="0.18" strokeWidth="0.3" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#b1c8a8"
        strokeOpacity="0.22"
        strokeWidth="0.25"
        strokeDasharray="0.6 2.4"
        className="origin-center animate-orbit"
      />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#8fae86" strokeOpacity="0.28" strokeWidth="0.3" />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="#e7c98a"
        strokeOpacity="0.35"
        strokeWidth="0.35"
        strokeDasharray="1 1.6"
        className="origin-center animate-orbit-reverse"
      />

      {/* Radial progress arc — decorative "system status" readout */}
      <circle
        cx="50"
        cy="50"
        r={progressRadius}
        fill="none"
        stroke="#e7c98a"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        transform="rotate(-90 50 50)"
        className="animate-ring-pulse"
      />

      {/* Spokes reaching toward the metric cards */}
      {SPOKE_ANGLES.map((angle) => {
        const inner = toXY(angle, 24)
        const outer = toXY(angle, 49)
        return (
          <line
            key={angle}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#e7c98a"
            strokeOpacity="0.16"
            strokeWidth="0.25"
            strokeDasharray="0.4 1.2"
          />
        )
      })}

      {/* Telemetry nodes */}
      {NODES.map(({ angle, radius, pulse }, index) => {
        const { x, y } = toXY(angle, radius)
        return (
          <g key={index}>
            {pulse && (
              <circle
                cx={x}
                cy={y}
                r="1.6"
                fill="none"
                stroke="#e7c98a"
                strokeOpacity="0.5"
                className="animate-pulse-dot"
                style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${index * 0.6}s` }}
              />
            )}
            <circle cx={x} cy={y} r="0.6" fill={pulse ? '#f4efe6' : '#b1c8a8'} />
          </g>
        )
      })}
    </svg>
  )
}
