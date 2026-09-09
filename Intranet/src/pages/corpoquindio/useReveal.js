import { useEffect } from 'react'

/* Revela los elementos [data-reveal] al entrar en viewport.
   Si el usuario pide menos movimiento, se muestran de inmediato. */
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]:not(.is-in)'))
    if (nodes.length === 0) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
