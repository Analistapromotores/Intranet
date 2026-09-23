import { useEffect, useMemo, useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '../../components/Icons.jsx'
import { api } from './api.js'
import { MESES, diasPara, fechaCorta, ordenarPorProximo, textoFaltan } from './dates.js'
import Avatar from './Avatar.jsx'
import BirthdayPost from './BirthdayPost.jsx'
import Polaroid from './Polaroid.jsx'
import { Confeti, Globos, Serpentinas } from './Celebration.jsx'
import { IconGift, IconLock, IconSparkle } from './icons.jsx'
import './cumpleanos.css'
import './post.css'

/* Vista pública: sin iniciar sesión, cualquiera ve quién cumple hoy y puede felicitarle. */
export default function CumpleanosPage() {
  const [personas, setPersonas] = useState(null)
  const [error, setError] = useState('')
  const [mes, setMes] = useState(() => new Date().getMonth())
  const [rafaga, setRafaga] = useState(0)
  const hoy = useMemo(() => new Date(), [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    api.cumpleanos().then(setPersonas).catch((e) => { setError(e.message); setPersonas([]) })
  }, [])

  const lista = personas || []
  const cumplenHoy = lista.filter((p) => diasPara(p, hoy) === 0)
  const semana = ordenarPorProximo(lista.filter((p) => { const d = diasPara(p, hoy); return d > 0 && d <= 7 }), hoy)
  const delMes = lista.filter((p) => p.month === mes + 1).sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, 'es'))
  const proximo = ordenarPorProximo(lista.filter((p) => diasPara(p, hoy) > 0), hoy)[0]
  const fechaHoy = hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase())
  const fiesta = cumplenHoy.length > 0

  return (
    <div className="cb">
      <section className={`cb-hero ${fiesta ? 'is-party' : ''}`} aria-labelledby="cb-titulo">
        <Serpentinas />
        <Globos />
        {fiesta && <Confeti rafaga={rafaga} />}

        <div className="cb-wrap cb-hero__inner">
          <p className="cb-date"><IconSparkle width={16} height={16} /> {fechaHoy}</p>
          <h1 id="cb-titulo">
            {personas === null ? 'Preparando la fiesta…' : fiesta ? <>¡Hoy estamos de <em>fiesta</em>!</> : <>Cumpleaños del <em>equipo</em></>}
          </h1>
          <p className="cb-lead">
            {fiesta
              ? `${cumplenHoy.length === 1 ? 'Alguien muy especial cumple' : `${cumplenHoy.length} personas del equipo cumplen`} años hoy. Toca el botón y envíale tu felicitación: le llega al instante.`
              : 'Aquí celebramos a cada persona del equipo en su día. Vuelve cuando haya torta.'}
          </p>

          {personas === null && <div className="cb-post cb-skeleton" aria-busy="true" />}

          {!fiesta && proximo && (
            <div className="cb-next">
              <Polaroid person={proximo} size="lg" tilt={-2} sticker={textoFaltan(diasPara(proximo, hoy))} />
              <div className="cb-next__text">
                <p className="cb-next__eyebrow">Próximo en celebrar</p>
                <p className="cb-next__name">{proximo.name}</p>
                <p className="cb-next__when">{fechaCorta(proximo)} · {textoFaltan(diasPara(proximo, hoy)).toLowerCase()}</p>
              </div>
            </div>
          )}
        </div>

        {fiesta && (
          <div className="cb-wrap cb-posts">
            {cumplenHoy.map((p, i) => (
              <BirthdayPost key={p.id} person={p} index={i} reverse={i % 2 === 1} onCelebrate={() => setRafaga((r) => r + 1)} />
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="cb-wrap">
          <p className="cb-alert" role="status">{error} Los cumpleaños se mostrarán cuando el servicio esté disponible.</p>
        </div>
      )}

      {semana.length > 0 && (
        <section className="cb-sec cb-wrap" aria-labelledby="cb-semana">
          <p className="cb-eyebrow">Próximos 7 días</p>
          <h2 id="cb-semana" className="cb-h2">Prepara el <em>saludo</em></h2>
          <ul className="cb-week">
            {semana.map((p, i) => (
              <li key={p.id} style={{ '--i': i }}>
                <Avatar person={p} size={52} />
                <div>
                  <b>{p.name}</b>
                  <span>{fechaCorta(p)}</span>
                </div>
                <em className="cb-pill">{textoFaltan(diasPara(p, hoy))}</em>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cb-sec cb-wrap" aria-labelledby="cb-mes">
        <div className="cb-month__head">
          <div>
            <p className="cb-eyebrow">Calendario</p>
            <h2 id="cb-mes" className="cb-h2">Cumpleaños de <em>{MESES[mes]}</em></h2>
          </div>
          <div className="cb-month__nav">
            <button type="button" className="cb-icon-btn" onClick={() => setMes((m) => (m + 11) % 12)} aria-label="Mes anterior"><IconChevronLeft width={20} height={20} /></button>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} aria-label="Elegir mes">
              {MESES.map((m, i) => <option key={m} value={i}>{m[0].toUpperCase() + m.slice(1)}</option>)}
            </select>
            <button type="button" className="cb-icon-btn" onClick={() => setMes((m) => (m + 1) % 12)} aria-label="Mes siguiente"><IconChevronRight width={20} height={20} /></button>
          </div>
        </div>

        {personas !== null && delMes.length === 0 ? (
          <div className="cb-empty">
            <IconGift width={34} height={34} />
            <p>No hay cumpleaños publicados en {MESES[mes]}.</p>
          </div>
        ) : (
          <ul className="cb-board" key={mes}>
            {delMes.map((p, i) => {
              const d = diasPara(p, hoy)
              return (
                <li key={p.id} style={{ '--i': i }} className={d === 0 ? 'is-today' : ''}>
                  <Polaroid person={p} size="md" tilt={[-2.5, 1.5, -1, 2.5][i % 4]} sticker={d === 0 ? '¡Hoy!' : undefined} />
                  {(p.cargo || p.area) && <p className="cb-board__role">{[p.cargo, p.area].filter(Boolean).join(' · ')}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="cb-wrap cb-foot">
        <a href="#cumpleanos-gestor" className="cb-link"><IconLock width={16} height={16} /> Acceso para gestores de cumpleaños</a>
      </div>
    </div>
  )
}
