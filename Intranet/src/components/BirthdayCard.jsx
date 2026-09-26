import { useEffect, useMemo, useState } from 'react'
import { api } from '../pages/cumpleanos/api.js'
import { MESES, diasPara, fechaCorta, iniciales, ordenarPorProximo, textoFaltan } from '../pages/cumpleanos/dates.js'
import Avatar from '../pages/cumpleanos/Avatar.jsx'
import { IconCake, IconArrowRight } from './Icons.jsx'

/* Cumpleaños en el inicio: una «carta» con la foto de quien cumple hoy y, debajo,
   la lista de los siguientes del mes (con scroll si son más de 3). */

const FONDOS = ['#1769e8', '#e51d2a', '#0a4f9e', '#ff7a45', '#23b5d3', '#7c5cff']
const fondoDe = (n) => FONDOS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % FONDOS.length]

function Carta({ persona, hoy, esHoy }) {
  const mes = MESES[persona.month - 1]
  return (
    <figure className={`bday-card ${esHoy ? 'is-hoy' : 'is-next'}`}>
      <div className="bday-card__photo" style={{ '--fondo': fondoDe(persona.name) }}>
        {persona.photo ? <img src={persona.photo} alt={`Foto de ${persona.name}`} /> : <span aria-hidden="true">{iniciales(persona.name)}</span>}
        <span className="bday-card__badge">{esHoy ? '¡Feliz cumpleaños!' : textoFaltan(diasPara(persona, hoy))}</span>
        <i className="bday-card__c bday-card__c--1" /><i className="bday-card__c bday-card__c--2" /><i className="bday-card__c bday-card__c--3" />
      </div>
      <figcaption className="bday-card__cap">
        <span className="bday-card__when">{esHoy ? `Hoy, ${persona.day} de ${mes}, cumple:` : `El ${persona.day} de ${mes} cumple:`}</span>
        <b>{persona.name}</b>
        {(persona.cargo || persona.area) && <small>{[persona.cargo, persona.area].filter(Boolean).join(' · ')}</small>}
        {persona.message && <q className="bday-card__msg">{persona.message}</q>}
      </figcaption>
    </figure>
  )
}

export default function BirthdayCard() {
  const [personas, setPersonas] = useState(null)
  const [indice, setIndice] = useState(0)
  const hoy = useMemo(() => new Date(), [])

  useEffect(() => {
    let vivo = true
    api.cumpleanos().then((l) => vivo && setPersonas(l)).catch(() => vivo && setPersonas([]))
    return () => { vivo = false }
  }, [])

  const lista = personas || []
  const deHoy = lista.filter((p) => diasPara(p, hoy) === 0).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  const delMes = ordenarPorProximo(lista.filter((p) => p.month === hoy.getMonth() + 1 && diasPara(p, hoy) > 0), hoy)
  /* A fin de mes puede no quedar nadie: se muestran entonces los siguientes cumpleaños, sea el mes que sea. */
  const finDeMes = delMes.length === 0
  const posteriores = finDeMes ? ordenarPorProximo(lista.filter((p) => diasPara(p, hoy) > 0), hoy).slice(0, 8) : delMes
  const proximo = ordenarPorProximo(lista.filter((p) => diasPara(p, hoy) > 0), hoy)[0]
  const protagonista = deHoy.length ? deHoy[Math.min(indice, deHoy.length - 1)] : proximo
  /* Si hoy no cumple nadie, la carta muestra al siguiente y la lista sigue a partir de la persona posterior. */
  const siguientes = deHoy.length ? posteriores : posteriores.filter((p) => p.id !== protagonista?.id)
  const mes = MESES[hoy.getMonth()]

  /* Sin cumpleaños publicados (o mientras carga), el componente no se muestra. */
  if (personas === null || personas.length === 0) return null

  return (
    <section className="bday card" aria-labelledby="bday-title">
      <div className="card__head">
        <IconCake className="bday__head-icon" width={20} height={20} />
        <h2 id="bday-title" className="card__title">Cumpleaños</h2>
        <a className="card__link" href="#cumpleanos">Ver todos</a>
      </div>

      {personas === null ? (
        <div className="bday__body" aria-busy="true"><div className="bday__skel" /></div>
      ) : (
        <div className="bday__body">
          {protagonista ? (
            <Carta persona={protagonista} hoy={hoy} esHoy={deHoy.length > 0} />
          ) : (
            <div className="bday-empty">
              <IconCake width={34} height={34} />
              <p>Aún no hay cumpleaños publicados.</p>
            </div>
          )}

          {deHoy.length > 1 && (
            <div className="bday__dots" role="tablist" aria-label="Quiénes cumplen hoy">
              {deHoy.map((p, i) => (
                <button key={p.id} type="button" role="tab" aria-selected={i === indice} aria-label={p.name} title={p.name} className={i === indice ? 'is-on' : ''} onClick={() => setIndice(i)}>
                  <Avatar person={p} size={30} />
                </button>
              ))}
            </div>
          )}

          {(deHoy.length > 0 || (protagonista && diasPara(protagonista, hoy) === 1)) && (
            <a className="bday__cta" href="#cumpleanos">Enviar felicitación <IconArrowRight width={15} height={15} /></a>
          )}

          {siguientes.length > 0 && (
            <div className="bday__next">
              <p className="bday__label">{finDeMes ? 'Próximos cumpleaños' : `Siguen en ${mes}`}{siguientes.length > 3 && <em>{siguientes.length} en total</em>}</p>
              <ul className={`bday__list ${siguientes.length > 3 ? 'has-more' : ''}`} tabIndex={siguientes.length > 3 ? 0 : undefined} aria-label={siguientes.length > 3 ? 'Lista de cumpleaños, con desplazamiento' : undefined}>
                {siguientes.map((p) => (
                  <li key={p.id}>
                    <Avatar person={p} size={38} />
                    <span className="bday__who">
                      <b>{p.name}</b>
                      <small>{textoFaltan(diasPara(p, hoy))}</small>
                    </span>
                    <span className="bday__date">{fechaCorta(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
