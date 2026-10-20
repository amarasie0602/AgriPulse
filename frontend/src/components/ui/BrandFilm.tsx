import { useState } from 'react'
import { Play } from 'lucide-react'

export function BrandFilm() {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  return <section className="brand-film" aria-label="AgriPulse brand film"><div><p className="eyebrow">A CLEARER PERSPECTIVE</p><h2>Every field has a story.</h2><p>A short film featuring real rice-field footage. Stock imagery, separate from your farm records.</p><button className="film-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="brand-film-player"><Play size={16} aria-hidden="true" />{open ? 'Close film' : 'Watch the 18-second film'}</button></div><div id="brand-film-player">{open && !failed ? <video controls muted playsInline preload="none" poster="/media/agripulse-poster.jpg" onError={() => setFailed(true)} aria-label="AgriPulse: Every field has a story"><source src="/media/agripulse-web.mp4" type="video/mp4" />Your browser does not support video playback.</video> : <img loading="lazy" width={960} height={540} src="/media/agripulse-poster.jpg" alt="Real rice fields in the AgriPulse brand film" />}{failed && <p role="status">Video playback is unavailable. The film poster is shown instead.</p>}</div></section>
}
