import { useCursor } from '../../../hooks/useCursor'

export default function CursorEffect() {
  const { dotRef, ringRef } = useCursor()
  return (
    <>
      <div ref={dotRef}  className="mv-cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="mv-cursor-ring" aria-hidden="true" />
    </>
  )
}
