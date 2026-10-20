import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Dialog({ title, description, onClose, busy = false, children }: {
  title: string
  description?: string
  onClose: () => void
  busy?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return createPortal(
    <dialog ref={ref} className="workspace-dialog" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
      <div className="dialog-heading">
        <div><p className="eyebrow">AGRIPULSE WORKSPACE</p><h2 id={`${id}-title`}>{title}</h2></div>
        <button type="button" className="icon-action" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={19} aria-hidden="true" /></button>
      </div>
      {description && <p id={`${id}-description`} className="dialog-description">{description}</p>}
      {children}
    </dialog>, document.body,
  )
}
