import { useEffect } from 'react'
import IngresoForm from './IngresoForm.jsx'
import OrdenForm from './OrdenForm.jsx'
import PrestamoPage from './PrestamoPage.jsx'
import SoportePage from './SoportePage.jsx'
import ConsultaPage from './ConsultaPage.jsx'
import GestionPage from './GestionPage.jsx'
import { PageHeader } from './ui.jsx'
import { FOTOS, MARCA } from './brand.js'
import { IconArrowRight, IconCheckCircle, IconClipboard, IconClock, IconExternal, IconHeadset, IconLaptop, IconList, IconLock, IconSearch, IconSend, IconUserCheck, IconUserSearch } from './icons.jsx'
import './solicitudes.css'
import './brand.css'

/* Centro de servicios internos. Rutas por hash:
   #solicitudes · -personal · -personal-ingreso · -personal-orden · -soporte · -prestamo · -consulta · -gestion */
export default function SolicitudesPage({ hash }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [hash])

  switch (hash) {
    case 'solicitudes-personal': return <PersonalPage />
    case 'solicitudes-personal-ingreso': return <IngresoForm />
    case 'solicitudes-personal-orden': return <OrdenForm />
    case 'solicitudes-soporte': return <SoportePage />
    case 'solicitudes-prestamo': return <PrestamoPage />
    case 'solicitudes-consulta': return <ConsultaPage />
    case 'solicitudes-gestion': return <GestionPage />
    default: return <Inicio />
  }
}

const SERVICIOS = [
  {
    href: '#solicitudes-personal',
    photo: FOTOS.equipoBanner,
    icon: IconUserSearch,
    tone: 'blue',
    title: 'Búsqueda de personal',
    text: 'Realiza solicitudes para encontrar el candidato requerido para un cargo mediante un formulario sencillo, organizado y centralizado.',
    meta: '2 formatos · Orden de servicio e Informe de ingreso',
    status: ['Genera Excel y correo', 'ok'],
    cta: 'Ver formatos',
  },
  {
    href: '#solicitudes-soporte',
    photo: FOTOS.soporte,
    icon: IconHeadset,
    tone: 'violet',
    title: 'Soporte IT',
    text: 'Encuentra información y accede al canal oficial para registrar solicitudes e incidentes relacionados con tecnología.',
    meta: 'Canal oficial: GLPI',
    status: ['Se gestiona en GLPI', 'ext'],
    cta: 'Ir a Soporte IT',
  },
  {
    href: '#solicitudes-prestamo',
    photo: FOTOS.prestamo,
    icon: IconLaptop,
    tone: 'teal',
    title: 'Préstamo de equipos',
    text: 'Realiza aquí las solicitudes para el préstamo de los equipos y elementos que requieras para tus actividades.',
    meta: 'Portátiles, video beam, sonido, pendones y más',
    status: ['Sujeto a disponibilidad', 'warn'],
    cta: 'Solicitar préstamo',
  },
]

function Inicio() {
  return (
    <div className="sv">
      <PageHeader
        eyebrow="Centro de servicios internos"
        title="Solicitudes"
        lead="Todo lo que necesitas pedir a las áreas de apoyo, en un solo lugar: elige el servicio, diligencia el formulario y haz seguimiento con tu número de solicitud."
        icon={IconSend}
        photo={FOTOS.equipoBanner}
      >
        <a className="sv-btn sv-btn--light" href="#solicitudes-consulta"><IconList width={18} height={18} /> Mis solicitudes</a>
      </PageHeader>

      <div className="sv-wrap sv-page">
        <ul className="sv-services" aria-label="Servicios disponibles">
          {SERVICIOS.map((s, i) => (
            <li key={s.href} style={{ '--i': i }}>
              <a className={`sv-service sv-service--${s.tone}`} href={s.href}>
                <span className="sv-service__media">
                  <img src={s.photo.src} alt="" style={{ objectPosition: s.photo.pos }} loading="lazy" />
                </span>
                <span className="sv-service__icon"><s.icon width={28} height={28} /></span>
                <span className={`sv-chip sv-chip--${s.status[1]}`}>{s.status[1] === 'ext' ? <IconExternal width={14} height={14} /> : <IconCheckCircle width={14} height={14} />} {s.status[0]}</span>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                <small>{s.meta}</small>
                <span className="sv-service__cta">{s.cta} <IconArrowRight width={18} height={18} /></span>
              </a>
            </li>
          ))}
        </ul>

        <section className="sv-trust" aria-label="Respaldo de Gestión y Servicios">
          <img className="sv-trust__logo" src={MARCA.logoVertical} alt="Gestión y Servicios · Apoyo en talento humano" />
          <ul>
            <li><IconClipboard width={22} height={22} /><span><b>Formatos oficiales</b>Orden de Servicio FT-OP-03 e Informe de Ingreso FT-OP-10, generados automáticamente.</span></li>
            <li><IconClock width={22} height={22} /><span><b>Trazabilidad</b>Cada solicitud tiene número, estado e historial de cambios.</span></li>
            <li><IconHeadset width={22} height={22} /><span><b>Canal oficial de TI</b>Los casos de tecnología se registran y siguen en GLPI.</span></li>
          </ul>
        </section>

        <section className="sv-block" aria-labelledby="sv-flujo">
          <p className="sv-eyebrow">Cómo funciona</p>
          <h2 id="sv-flujo" className="sv-h2">De la solicitud al seguimiento</h2>
          <ol className="sv-flow">
            {[
              [IconSearch, 'Elige el servicio', 'Encuentra la solicitud que necesitas por categoría.'],
              [IconClipboard, 'Diligencia por pasos', 'Formularios cortos por secciones, con validación en cada campo.'],
              [IconSend, 'Confirma y envía', 'Revisa el resumen; se genera el formato y se envía el correo.'],
              [IconClock, 'Haz seguimiento', 'Consulta el estado con tu número: enviada, en proceso, aprobada…'],
            ].map(([Icon, t, x], i) => (
              <li key={t}>
                <span className="sv-flow__icon"><Icon width={22} height={22} /></span>
                <b><em>{i + 1}.</em> {t}</b>
                <p>{x}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="sv-team" aria-labelledby="sv-team-title">
          <figure className="sv-team__photo">
            <img src={FOTOS.equipoOficina.src} alt={FOTOS.equipoOficina.alt} loading="lazy" />
            <img className="sv-team__badge" src={MARCA.monograma} alt="" aria-hidden="true" />
          </figure>
          <div className="sv-team__text">
            <p className="sv-eyebrow">Apoyo en talento humano</p>
            <h2 id="sv-team-title" className="sv-h2">Detrás de cada solicitud hay un equipo que te acompaña</h2>
            <p>Las áreas de talento humano, contratación y tecnología de Gestión y Servicios reciben tus solicitudes por un solo canal, las gestionan y registran su avance para que puedas consultarlo.</p>
            <div className="sv-team__actions">
              <a className="sv-btn" href="#solicitudes-personal"><IconUserSearch width={18} height={18} /> Solicitar personal</a>
              <a className="sv-btn sv-btn--ghost" href="#solicitudes-prestamo"><IconLaptop width={18} height={18} /> Pedir un equipo</a>
            </div>
          </div>
        </section>

        <div className="sv-strip">
          <div>
            <b>¿Ya enviaste una solicitud?</b>
            <p>Consulta su estado con el número de solicitud y el correo con el que la registraste.</p>
          </div>
          <a className="sv-btn" href="#solicitudes-consulta"><IconList width={18} height={18} /> Consultar solicitudes</a>
        </div>

        <p className="sv-foot"><a className="sv-link" href="#solicitudes-gestion"><IconLock width={16} height={16} /> Acceso para gestión de solicitudes</a></p>
      </div>
    </div>
  )
}

function PersonalPage() {
  const formatos = [
    {
      href: '#solicitudes-personal-orden',
      icon: IconClipboard,
      code: 'FT-OP-03',
      title: 'Petición de Orden de Servicio',
      when: 'Cuando necesitas cubrir un cargo',
      text: 'Describe el perfil, las funciones y las condiciones del cargo para iniciar la búsqueda del candidato.',
      steps: '7 pasos · ~10 min',
    },
    {
      href: '#solicitudes-personal-ingreso',
      icon: IconUserCheck,
      code: 'FT-OP-10',
      title: 'Informe de Ingreso',
      when: 'Cuando ya elegiste a la persona',
      text: 'Registra los datos de la persona seleccionada, su salario y la autorización para iniciar la contratación.',
      steps: '5 pasos · ~6 min',
    },
  ]
  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Búsqueda de personal']]}
        eyebrow="Talento humano"
        title="Búsqueda de personal"
        lead="Realiza solicitudes para encontrar el candidato requerido para un cargo mediante un formulario sencillo, organizado y centralizado."
        icon={IconUserSearch}
        photo={FOTOS.equipoOficina}
      />
      <div className="sv-wrap sv-page">
        <ol className="sv-journey" aria-label="Orden del proceso">
          <li><span>1</span> Pides el cargo con la <b>Orden de Servicio</b></li>
          <li aria-hidden="true" className="sv-journey__line" />
          <li><span>2</span> Seleccionas a la persona</li>
          <li aria-hidden="true" className="sv-journey__line" />
          <li><span>3</span> Envías el <b>Informe de Ingreso</b></li>
        </ol>
        <ul className="sv-formats">
          {formatos.map((f, i) => (
            <li key={f.href} style={{ '--i': i }}>
              <a className="sv-format" href={f.href}>
                <span className="sv-format__icon"><f.icon width={30} height={30} /></span>
                <div>
                  <p className="sv-format__when">{f.when}</p>
                  <h2>{f.title}</h2>
                  <p>{f.text}</p>
                  <div className="sv-format__meta">
                    <span className="sv-chip sv-chip--neutral">Formato {f.code}</span>
                    <span className="sv-chip sv-chip--neutral"><IconClock width={14} height={14} /> {f.steps}</span>
                    <span className="sv-chip sv-chip--ok"><IconCheckCircle width={14} height={14} /> Excel + correo automáticos</span>
                  </div>
                </div>
                <span className="sv-format__go" aria-hidden="true"><IconArrowRight width={22} height={22} /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
