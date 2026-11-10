import { useId, useRef, useState } from 'react'
import { useElementWidth } from '@/hooks/useElementWidth'
import { cn } from '@/utils/cn'

export interface TrendChartPoint { key?: string; label: string; value: number | null }
interface TrendChartProps {
  points: TrendChartPoint[]
  tone?: 'light' | 'dark'
  unit?: string
  className?: string
  label?: string
}
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 })

/** Actual observations only: missing periods break the line rather than implying zero usage. */
export function TrendChart({ points, unit = '', className, label = 'Recorded usage over time' }: TrendChartProps) {
  const uid = useId()
  const { ref, width: measuredWidth } = useElementWidth<HTMLDivElement>()
  const svg = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const width = Math.max(260, Math.round(measuredWidth || 400))
  const height = 210, left = 58, right = 16, top = 24, bottom = 36
  const plotWidth = width - left - right, plotHeight = height - top - bottom
  const observed = points.map((p, i) => ({ ...p, index: i })).filter(p => p.value !== null && Number.isFinite(p.value))
  if (!observed.length) return <div className="history-chart-empty">No observations in this period.</div>
  const largest = Math.max(...observed.map(p => p.value as number), 1e-6)
  const rawStep = largest / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = ([1, 2, 2.5, 5, 10].find(n => n * magnitude >= rawStep) ?? 10) * magnitude
  const maximum = step * 4
  const times = points.map((p, i) => p.key && Number.isFinite(Date.parse(p.key)) ? Date.parse(p.key) : i)
  const first = times[0], last = times[times.length - 1]
  const x = (index: number) => first === last ? left + plotWidth / 2 : left + (times[index] - first) / (last - first) * plotWidth
  const y = (value: number) => top + plotHeight * (1 - value / maximum)
  let connected = false
  const path = points.map((point, index) => {
    if (point.value === null) { connected = false; return '' }
    const segment = `${connected ? 'L' : 'M'} ${x(index)} ${y(point.value)}`
    connected = true
    return segment
  }).join(' ')
  const labelCount = Math.max(2, Math.floor(plotWidth / 115))
  const tickIndexes = new Set<number>()
  const count = Math.min(labelCount, observed.length)
  for (let i = 0; i < count; i++) tickIndexes.add(observed[count === 1 ? 0 : Math.round(i * (observed.length - 1) / (count - 1))].index)
  const selected = active === null ? undefined : points[active]
  return <div ref={ref} className={cn('history-chart', className)}>
    <svg ref={svg} viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="group" aria-labelledby={`${uid}-title ${uid}-description`}
      onFocusCapture={event => {
        const index = (event.target as SVGElement).getAttribute('data-point-index')
        if (index !== null) setActive(Number(index))
      }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null) }}
      onPointerMove={event => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const position = (event.clientX - bounds.left) * width / bounds.width
        setActive(observed.reduce((nearest, p) => Math.abs(x(p.index) - position) < Math.abs(x(nearest) - position) ? p.index : nearest, observed[0].index))
      }} onPointerLeave={() => { if (!svg.current?.contains(document.activeElement)) setActive(null) }}>
      <title id={`${uid}-title`}>{label}</title>
      <desc id={`${uid}-description`}>{unit} per recorded period. Unrecorded periods are gaps. Focus a point and use arrow keys to explore. Exact values are also available in the data table.</desc>
      <text x={left} y={12} className="history-axis-unit">{unit}</text>
      {[0, 1, 2, 3, 4].map(tick => <g key={tick} className="history-grid"><line x1={left} x2={width - right} y1={y(step * tick)} y2={y(step * tick)} /><text x={left - 10} y={y(step * tick) + 4} textAnchor="end">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 3, notation: maximum >= 10000 ? 'compact' : 'standard' }).format(step * tick)}</text></g>)}
      {observed.length > 1 && <path className="history-line" d={path} />}
      {selected && selected.value !== null && <line className="history-crosshair" x1={x(active!)} x2={x(active!)} y1={top} y2={height - bottom} />}
      {observed.map((point, i) => <circle key={point.key ?? point.index} data-point-index={point.index} className={`history-point${active === point.index ? ' is-active' : ''}`} cx={x(point.index)} cy={y(point.value as number)} r={active === point.index ? 5 : 3.5}
        tabIndex={active === point.index || (active === null && i === 0) ? 0 : -1} role="img" aria-label={`${point.label}: ${number.format(point.value as number)} ${unit}`}
        onPointerDown={() => setActive(point.index)}
        onKeyDown={event => {
          const target = event.key === 'ArrowRight' ? observed[Math.min(i + 1, observed.length - 1)] : event.key === 'ArrowLeft' ? observed[Math.max(i - 1, 0)] : event.key === 'Home' ? observed[0] : event.key === 'End' ? observed.at(-1) : undefined
          if (target) { event.preventDefault(); svg.current?.querySelector<SVGCircleElement>(`[data-point-index="${target.index}"]`)?.focus() }
          if (event.key === 'Escape') { setActive(null); event.currentTarget.blur() }
        }} />)}
      {observed.filter(p => tickIndexes.has(p.index)).map(point => <text key={point.index} className="history-date" x={x(point.index)} y={height - 10} textAnchor={observed.length === 1 ? 'middle' : point.index === observed[0].index ? 'start' : point.index === observed.at(-1)?.index ? 'end' : 'middle'}>{point.label.replace('Week of ', '')}</text>)}
    </svg>
    {selected && selected.value !== null && <div className="history-tooltip" role="tooltip" style={{ left: `${Math.max(95, Math.min(width - 95, x(active!))) / width * 100}%` }}><span>{selected.label}</span><strong>{number.format(selected.value)} {unit}</strong></div>}
    <details className="history-data"><summary>View data</summary><table><caption className="sr-only">{label}</caption><thead><tr><th scope="col">Recorded period</th><th scope="col">Quantity ({unit})</th></tr></thead><tbody>{observed.map(point => <tr key={point.key ?? point.index}><th scope="row">{point.label}</th><td>{number.format(point.value as number)}</td></tr>)}</tbody></table></details>
  </div>
}
