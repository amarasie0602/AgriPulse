import { Droplets, Leaf, Sprout, Waves } from 'lucide-react'
import type { ReactNode } from 'react'
import { OrbitMetricCard } from './OrbitMetricCard'
import { SmartFieldConsole } from './SmartFieldConsole'

/**
 * Frames the sign-in panel inside the Smart Field Console: the ring
 * visualization and four orbiting sample-data cards on larger screens, a
 * plain dark backdrop (still branded, still aerial) on small ones — the
 * same "decorative chrome only where there's room for it" pattern the
 * original split-screen brand panel used.
 */
export function SmartFieldConsoleFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full items-center justify-center">
      <SmartFieldConsole className="pointer-events-none absolute hidden size-[min(50vh,36vw,600px)] lg:block" />

      <OrbitMetricCard
        icon={Leaf}
        label="Crop Health"
        value="78%"
        delta="+4.2%"
        className="pointer-events-none absolute top-[6%] left-[2%] hidden animate-float lg:block xl:left-[6%]"
      >
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full w-[78%] rounded-full bg-linear-to-r from-moss-400 to-wheat-300" />
        </div>
      </OrbitMetricCard>

      <OrbitMetricCard
        icon={Droplets}
        label="Soil Moisture"
        value="62%"
        className="pointer-events-none absolute top-[8%] right-[2%] hidden animate-float-slow lg:block xl:right-[6%]"
      >
        <div className="mt-2.5 flex h-1 gap-0.5" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={index < 6 ? 'flex-1 rounded-full bg-wheat-300' : 'flex-1 rounded-full bg-white/10'}
            />
          ))}
        </div>
      </OrbitMetricCard>

      <OrbitMetricCard
        icon={Sprout}
        label="Carbon Impact"
        value="4.82"
        unit="tCO₂e"
        className="pointer-events-none absolute bottom-[6%] left-[3%] hidden animate-float-slow lg:block xl:left-[8%]"
      />

      <OrbitMetricCard
        icon={Waves}
        label="Water Usage"
        value="-24%"
        className="pointer-events-none absolute bottom-[8%] right-[3%] hidden animate-float lg:block xl:right-[8%]"
      >
        <svg viewBox="0 0 100 30" className="mt-2.5 h-6 w-full" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 22 C 14 22, 18 10, 30 12 S 46 22, 58 18 S 74 4, 86 6 S 96 10, 100 8"
            fill="none"
            stroke="#e7c98a"
            strokeWidth="1.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </OrbitMetricCard>

      <div className="relative z-10 w-full max-w-[26rem]">{children}</div>
    </div>
  )
}
