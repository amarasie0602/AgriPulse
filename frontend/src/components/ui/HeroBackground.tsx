import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { usePreferences } from '@/hooks/usePreferences'

export function HeroBackground() {
  const { preferences } = usePreferences()
  const video = useRef<HTMLVideoElement>(null)
  const [canAnimate, setCanAnimate] = useState(false)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const update = () => setCanAnimate(preferences.backgroundVideo && preferences.motion && !motion.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType ?? ''))
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [preferences.backgroundVideo, preferences.motion])
  useEffect(() => {
    if (canAnimate && !failed) void video.current?.play().catch(() => setPaused(true))
  }, [canAnimate, failed])
  async function toggle() {
    if (!video.current) return
    if (video.current.paused) {
      try { await video.current.play() } catch { setFailed(true) }
    } else video.current.pause()
  }
  return <>
    <div className="hero-media" aria-hidden="true">
      <img src="/media/agripulse-hero-poster.jpg" alt="" width={960} height={540} fetchPriority="high" />
      {canAnimate && !failed && <video ref={video} src="/media/agripulse-hero.mp4" poster="/media/agripulse-hero-poster.jpg" autoPlay muted loop playsInline preload="metadata" tabIndex={-1} disablePictureInPicture onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onError={() => setFailed(true)} />}
    </div>
    <div className="hero-overlay" aria-hidden="true" />
    {canAnimate && !failed && <button className="hero-motion-control" type="button" onClick={() => void toggle()} aria-label={paused ? 'Play background video' : 'Pause background video'}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? 'Play background video' : 'Pause background video'}</span></button>}
  </>
}
