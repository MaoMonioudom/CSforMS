import { useEffect, useRef } from 'react'

export function useCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const pos     = useRef({ x: 0, y: 0 })
  const ring    = useRef({ x: 0, y: 0 })
  const raf     = useRef(null)

  useEffect(() => {
    const dot  = dotRef.current
    const rng  = ringRef.current
    if (!dot || !rng) return

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top  = e.clientY + 'px'
    }

    const onEnter = () => { rng.classList.add('hovered') }
    const onLeave = () => { rng.classList.remove('hovered') }

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.11
      ring.current.y += (pos.current.y - ring.current.y) * 0.11
      rng.style.left = ring.current.x + 'px'
      rng.style.top  = ring.current.y + 'px'
      raf.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    // Grow ring on any interactive element
    document.querySelectorAll('button, a, input, select, textarea, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return { dotRef, ringRef }
}
