import { useId } from 'react'
import type { ResourceTypeTrend } from '@/utils/analytics'

export const RESOURCE_CHART_COLORS = ['#2688d7', '#479037', '#eda51b']

/** Each line retains its own unit. Quantities are never added or converted. */
export function ResourceUsageChart({ trends, months }: { trends: ResourceTypeTrend[]; months: number }) {
  const uid = useId().replace(/\W/g, '')
  const series = trends.slice(0, 3).map(trend => ({ ...trend, points: trend.points.slice(-months) }))
  if (!series.length) return null
  const points = series[0].points
  const width = 660, height = 228, left = 42, right = 14, top = 18, bottom = 34
  const plotWidth = width - left - right, plotHeight = height - top - bottom
  const rawMax = Math.max(1, ...series.flatMap(trend => trend.points.map(point => point.value)))
  const magnitude = 10 ** Math.floor(Math.log10(rawMax))
  const max = Math.ceil(rawMax / magnitude) * magnitude
  const x = (index: number) => points.length === 1 ? left + plotWidth / 2 : left + index / (points.length - 1) * plotWidth
  const y = (value: number) => top + plotHeight * (1 - value / max)
  return <div className="resource-chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly resource quantities; see the legend for each resource unit">
      <defs>{series.map((trend, index) => <linearGradient id={`${uid}-${trend.type}`} key={trend.type} x1="0" y1="0" x2="0" y2="1"><stop stopColor={RESOURCE_CHART_COLORS[index]} stopOpacity=".1" /><stop offset="1" stopColor={RESOURCE_CHART_COLORS[index]} stopOpacity="0" /></linearGradient>)}</defs>
      {[0, 1, 2, 3, 4].map(tick => <g key={tick}><line x1={left} x2={width - right} y1={y(max * tick / 4)} y2={y(max * tick / 4)} stroke="var(--color-app-border)" strokeOpacity=".65" /><text x={left - 11} y={y(max * tick / 4) + 4} textAnchor="end" fontSize="11" fill="var(--color-app-ink-soft)">{(max * tick / 4).toLocaleString(undefined, { maximumFractionDigits: 1, notation: max >= 10000 ? 'compact' : 'standard' })}</text></g>)}
      {series.map((trend, index) => {
        const coords = trend.points.map((point, pointIndex) => ({ ...point, x: x(pointIndex), y: y(point.value) }))
        const line = coords.map((point, pointIndex) => pointIndex === 0 ? `M ${point.x} ${point.y}` : `C ${(coords[pointIndex - 1].x + point.x) / 2} ${coords[pointIndex - 1].y}, ${(coords[pointIndex - 1].x + point.x) / 2} ${point.y}, ${point.x} ${point.y}`).join(' ')
        return <g key={trend.type}><path d={`${line} L ${coords[coords.length - 1].x} ${top + plotHeight} L ${coords[0].x} ${top + plotHeight} Z`} fill={`url(#${uid}-${trend.type})`} /><path d={line} fill="none" stroke={RESOURCE_CHART_COLORS[index]} strokeWidth="2" />{coords.map(point => <circle key={point.key} cx={point.x} cy={point.y} r="3.8" fill={RESOURCE_CHART_COLORS[index]} stroke="var(--color-app-surface)" strokeWidth="1"><title>{`${trend.label}: ${point.value.toLocaleString()} ${trend.unit}, ${point.label}`}</title></circle>)}</g>
      })}
      {points.map((point, index) => (index % Math.max(1, Math.ceil(points.length / 6)) === 0 || index === points.length - 1) && <text key={point.key} x={x(index)} y={height - 9} textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--color-app-ink-soft)">{point.label}</text>)}
    </svg>
    <ul className="resource-chart-legend">{series.map((trend, index) => <li key={trend.type}><i style={{ background: RESOURCE_CHART_COLORS[index] }} />{trend.label} ({trend.unit})</li>)}</ul>
  </div>
}
