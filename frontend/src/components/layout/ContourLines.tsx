/** Faint topographic contours — a shared texture for the brand surfaces. */
export function ContourLines({ className }: { className?: string }) {
  const lines = Array.from({ length: 9 }, (_, index) => {
    const y = 60 + index * 36
    return `M-120 ${y} C 60 ${y - 70}, 240 ${y + 60}, 400 ${y - 10} S 640 ${y + 50}, 760 ${y - 30}`
  })

  return (
    <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <g fill="none" stroke="#b1c8a8" strokeWidth="1">
        {lines.map((d, index) => (
          <path key={d} d={d} strokeOpacity={0.05 + (index % 3) * 0.025} />
        ))}
      </g>
    </svg>
  )
}
