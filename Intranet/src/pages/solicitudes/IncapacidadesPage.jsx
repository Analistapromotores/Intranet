import { PageHeader } from './ui.jsx'
import { FOTOS, MARCA } from './brand.js'
import { IconAlert, IconCheck, IconFileText, IconMail, IconMedical } from './icons.jsx'
import './incapacidades.css'

/* Incapacidades y licencias: qué documentos se necesitan en cada caso. */

const CASOS = [
  { titulo: 'Incapacidad general', tono: 'blue', docs: ['Certificado de incapacidad.', 'Historia clínica o soporte de la atención médica.'] },
  { titulo: 'Accidente laboral', tono: 'red', docs: ['Certificado de incapacidad.', 'Historia clínica o soporte de la atención médica.'] },
  {
    titulo: 'Accidente de tránsito',
    tono: 'amber',
    docs: ['Certificado de incapacidad.', 'Historia clínica.', 'FURIPS.'],
    nota: 'Si el FURIPS no fue expedido, debes presentar una declaración juramentada ante notaría explicando el motivo.',
  },
  { titulo: 'Licencia de maternidad', tono: 'pink', docs: ['Certificado de licencia.', 'Historia clínica.', 'Registro civil de nacimiento.', 'Certificado de nacido vivo.'] },
  { titulo: 'Licencia de paternidad', tono: 'teal', docs: ['Certificado de licencia.', 'Historia clínica o soporte correspondiente.', 'Registro civil de nacimiento.', 'Certificado de nacido vivo.'] },
]

const CORREO = 'incapacidadesgys@gestionyservicios.com.co'
const REDES = ['@gestion_gys', 'Gestión GYS', 'GestiónyServiciosCol', 'gestiongys']

export default function IncapacidadesPage() {
  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Incapacidades']]}
        eyebrow="Talento humano"
        title="Incapacidades y licencias"
        lead="Cada caso tiene su documentación. Revisa qué necesitas y envíala completa para que tu proceso avance sin contratiempos."
        icon={IconMedical}
        photo={FOTOS.equipoBanner}
      />
      <div className="sv-wrap sv-page">
        <h2 className="sv-h2 in-title">Cada caso tiene su documentación</h2>
        <div className="in-cases">
          {CASOS.map((c, i) => (
            <article key={c.titulo} className={`in-case in-case--${c.tono}`} style={{ '--i': i }}>
              <header>
                <span className="in-case__icon"><IconFileText width={22} height={22} /></span>
                <h3>{c.titulo}</h3>
              </header>
              <ul>
                {c.docs.map((d) => <li key={d}><IconCheck width={16} height={16} /> {d}</li>)}
              </ul>
              {c.nota && <p className="in-case__note"><IconAlert width={16} height={16} /> {c.nota}</p>}
            </article>
          ))}
        </div>

        <div className="in-rule">
          <IconAlert width={22} height={22} />
          <p><b>La documentación debe estar completa, legible y correctamente escaneada.</b> Reportar a tiempo también es cuidar tu proceso.</p>
        </div>

        <section className="in-send" aria-label="Envío de documentos">
          <img src={MARCA.logoHorizontal} alt="Gestión y Servicios" />
          <div>
            <p className="sv-eyebrow">Envía tu documentación</p>
            <a className="in-send__mail" href={`mailto:${CORREO}`}><IconMail width={20} height={20} /> {CORREO}</a>
            <p className="sv-muted">
              <a href="https://www.gestionyservicios.com.co" target="_blank" rel="noopener noreferrer">www.gestionyservicios.com.co</a> · PBX: (572) 661 4040
            </p>
            <ul className="in-send__social" aria-label="Redes sociales">
              {REDES.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <a className="sv-btn" href="#solicitudes-ausentismo">Formato de ausentismo</a>
        </section>
      </div>
    </div>
  )
}
