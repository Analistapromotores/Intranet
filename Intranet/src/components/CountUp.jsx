import { useEffect, useRef, useState } from 'react'

/* Cifra que cuenta desde cero al entrar en pantalla («360+», «22/22»…).
   Respeta prefers-reduced-motion: en ese caso muestra el valor final de una vez. */
export default function CountUp({ value, duracion = 1600 }) {
  const ref = useRef(null)
  const m = /^([\d.]+)(.*)$/.exec(String(value))
  const objetivo = m ? Number(m[1].replace(/\./g, '')) : null
  const [n, setN] = useState(() => (objetivo === null || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? objetivo : 0))

  useEffect(() => {
    if (objetivo === null || n === objetivo) return
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / duracion)
        setN(Math.round(objetivo * (1 - Math.pow(1 - k, 3))))
        if (k < 1) raf = requestAnimationFrame(paso)
      }
      raf = requestAnimationFrame(paso)
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objetivo])

  if (objetivo === null) return <span ref={ref}>{value}</span>
  return <span ref={ref}>{n.toLocaleString('es-CO')}{m[2]}</span>
}
