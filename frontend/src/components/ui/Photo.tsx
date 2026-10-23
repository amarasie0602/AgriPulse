import { useState } from 'react'
import type { PhotoAsset } from '@/utils/media'
export function Photo({ asset, className = '', eager = false }: { asset?: PhotoAsset; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return !asset || failed ? <div className={`photo-unavailable ${className}`} role="img" aria-label="Photograph unavailable"><span>Photograph unavailable</span></div> : <img className={className} src={asset.src} alt={asset.alt} width={1000} height={650} loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: asset.position }} onError={() => setFailed(true)} />
}
