import { MapPin, Sprout } from 'lucide-react'

interface FarmSnapshotProps {
  cropTypes: string[]
  farmSizeHectares?: number
  className?: string
}

/** Cycles through distinct, theme-independent tints for however many crop tiles are shown. */
const TILE_COLORS = ['#5b9c5f', '#c99a4b', '#4a8a93', '#c2693c', '#8a76a8', '#3f8fc2']

/**
 * A small "digital twin" style snapshot of the farm's fields, derived from
 * the profile's crop types and total size — there's no separate per-field
 * data model, so this is explicitly an even split, not live field data.
 */
export function FarmSnapshot({ cropTypes, farmSizeHectares, className }: FarmSnapshotProps) {
  if (cropTypes.length === 0) return null

  const shownCrops = cropTypes.slice(0, 4)
  const shareHectares = farmSizeHectares ? farmSizeHectares / cropTypes.length : undefined

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[0.08em] text-moss-300 uppercase">Farm fields</p>
        <p className="text-[0.65rem] text-moss-300/70">Estimated from your profile</p>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {shownCrops.map((crop, index) => {
          const color = TILE_COLORS[index % TILE_COLORS.length]
          return (
            <div
              key={crop}
              className="relative overflow-hidden rounded-xl border border-white/10 p-3"
              style={{ backgroundColor: `${color}26` }}
            >
              <span
                className="grid size-7 place-items-center rounded-lg text-white"
                style={{ backgroundColor: color }}
              >
                <Sprout className="size-3.5" aria-hidden="true" />
              </span>
              <p className="mt-2 truncate text-sm font-semibold text-bone-50">{crop}</p>
              {shareHectares !== undefined && (
                <p className="flex items-center gap-1 text-xs text-moss-300">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />~{shareHectares.toFixed(1)} ha
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
