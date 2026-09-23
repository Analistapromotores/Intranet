import { useEffect } from 'react'
import { IconArrowRight, IconExternal, IconMapPin } from '../../components/Icons.jsx'
import portada from '../../assets/pasaportes/pasaportes_portad.png'
import logoUT from '../../assets/pasaportes/logo_pasaportes.png'
import logoGob from '../../assets/pasaportes/logo2.png'
import aviso from '../../assets/pasaportes/headerHome.jpg'
import './pasaportes.css'

/* UT Gestión Pasaportes: quiénes son y cómo interviene Gestión y Servicios.
   La información del trámite para la ciudadanía vive en el portal oficial. */

const PORTAL = 'https://pasaportes.valledelcauca.gov.co'

const svg = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

/* Etapas del trámite que coordina la oficina. */
const ETAPAS = [
  ['Agendamiento de citas', <svg {...svg} key="a"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>],
  ['Recepción del ciudadano', <svg {...svg} key="b"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" /></svg>],
  ['Formalización de la solicitud', <svg {...svg} key="c"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 14l2 2 4-4" /></svg>],
  ['Gestión de pagos', <svg {...svg} key="d"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h3" /></svg>],
  ['Seguimiento', <svg {...svg} key="e"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>],
  ['Entrega del pasaporte', <svg {...svg} key="f"><rect x="6" y="3" width="12" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9.5 16h5" /></svg>],
]

/* Cómo interviene G&S en la operación. */
const APORTES = [
  {
    titulo: 'Personal',
    texto: 'Suministramos el talento humano que atiende, orienta y acompaña a la ciudadanía en cada etapa del trámite.',
    icono: <svg {...svg}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.6c2 .6 3.4 2.1 4 4.4" /></svg>,
  },
  {
    titulo: 'Espacio físico',
    texto: 'Disponemos el espacio donde funciona la atención presencial de la oficina.',
    icono: <svg {...svg}><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /></svg>,
  },
  {
    titulo: 'Equipos',
    texto: 'Aportamos los equipos necesarios para la operación del servicio.',
    icono: <svg {...svg}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>,
  },
]

export default function PasaportesPage() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])

  return (
    <div className="ps">
      {/* ---------- Encabezado ---------- */}
      <header className="ps-hero">
        <img className="ps-hero__img" src={portada} alt="Equipo de la Oficina de Pasaportes con el chaleco institucional" />
        <div className="ps-wrap ps-hero__bar">
          <img className="ps-hero__logo" src={logoUT} alt="UT Gestión Pasaportes · Operador logístico" />
          <p>Operador logístico de la Oficina de Pasaportes del Valle del Cauca</p>
          <a className="ps-btn ps-btn--light" href={PORTAL} target="_blank" rel="noopener noreferrer">
            Portal oficial <IconExternal width={16} height={16} />
          </a>
        </div>
      </header>

      <main>
        {/* ---------- Quiénes son ---------- */}
        <section className="ps-sec">
          <div className="ps-wrap ps-split">
            <div>
              <p className="ps-eyebrow">Quiénes son</p>
              <h2>La Oficina de Pasaportes del Valle del Cauca</h2>
              <p className="ps-text">Es la dependencia de la Gobernación del Valle del Cauca encargada de atender a la ciudadanía en la solicitud, formalización y expedición de pasaportes.</p>
              <p className="ps-text">Cuenta con canales presenciales y digitales, y un portal web institucional para citas, requisitos, tarifas, comunicados y seguimiento del trámite.</p>
              <p className="ps-place"><IconMapPin width={20} height={20} /> <span><b>Centro Comercial La Estación</b>Santiago de Cali · con jornadas descentralizadas en otros municipios del departamento</span></p>
            </div>
            <figure className="ps-gob">
              <img src={logoGob} alt="Gobernación del Valle del Cauca · Secretaría de Convivencia y Seguridad Ciudadana" />
              <figcaption>Entidad responsable del servicio</figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- Etapas ---------- */}
        <section className="ps-sec ps-sec--soft">
          <div className="ps-wrap">
            <p className="ps-eyebrow">El trámite</p>
            <h2>Etapas que coordina la oficina</h2>
            <ol className="ps-steps">
              {ETAPAS.map(([t, ic], i) => (
                <li key={t} style={{ '--i': i }}>
                  <span className="ps-steps__icon">{ic}</span>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  <b>{t}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Cómo intervenimos ---------- */}
        <section className="ps-sec">
          <div className="ps-wrap">
            <div className="ps-head">
              <p className="ps-eyebrow">Nuestra alianza</p>
              <h2>Cómo interviene Gestión y Servicios</h2>
              <p className="ps-text">A través de la UT Gestión Pasaportes somos el operador logístico de la oficina: ponemos a disposición el personal, el espacio y los equipos para que la atención a la ciudadanía funcione.</p>
            </div>
            <div className="ps-aportes">
              {APORTES.map((a, i) => (
                <article key={a.titulo} className="ps-aporte" style={{ '--i': i }}>
                  <span className="ps-aporte__icon">{a.icono}</span>
                  <h3>{a.titulo}</h3>
                  <p>{a.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Aviso a la ciudadanía ---------- */}
        <section className="ps-sec ps-sec--tight">
          <div className="ps-wrap">
            <img className="ps-aviso" src={aviso} alt="Ten en cuenta: la cita para gestionar tu pasaporte es totalmente gratuita. No entregues dinero ni datos personales a terceros; evita las estafas." loading="lazy" />
          </div>
        </section>

        {/* ---------- Portal ---------- */}
        <section className="ps-cta">
          <div className="ps-wrap ps-cta__inner">
            <div>
              <h2>Toda la información del trámite, en el portal oficial</h2>
              <p>Citas, disponibilidad, requisitos, tarifas, comunicados y seguimiento.</p>
            </div>
            <a className="ps-btn" href={PORTAL} target="_blank" rel="noopener noreferrer">
              Ir a pasaportes.valledelcauca.gov.co <IconArrowRight width={18} height={18} />
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
