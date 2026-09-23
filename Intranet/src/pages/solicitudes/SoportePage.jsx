import { useEffect, useState } from 'react'
import { GLPI_URL } from '../../config.js'
import { api } from './api.js'
import { PageHeader } from './ui.jsx'
import { FOTOS, HERRAMIENTAS_LOGOS, MARCA } from './brand.js'
import {
  IconBook, IconCheckCircle, IconClock, IconCloud, IconExternal, IconFileText, IconFishing,
  IconHeadset, IconList, IconMail, IconShield, IconAlert,
} from './icons.jsx'

const BENEFICIOS = [
  [IconHeadset, 'Registrar solicitudes de soporte', 'Pide apoyo técnico para tu equipo, tu cuenta o un sistema.'],
  [IconAlert, 'Reportar incidentes tecnológicos', 'Informa fallas, errores o interrupciones apenas ocurran.'],
  [IconClock, 'Consultar el estado de los casos', 'Sigue en qué va tu caso sin tener que preguntar.'],
  [IconList, 'Revisar el historial de solicitudes', 'Todo lo que has reportado queda guardado y organizado.'],
]

const PASOS = [
  ['Ingresa a GLPI', 'Abre la plataforma con tu usuario corporativo.'],
  ['Crea tu caso', 'Elige si es una solicitud o un incidente y describe qué pasa.'],
  ['Adjunta evidencia', 'Una captura de pantalla o el mensaje de error ayuda a resolver más rápido.'],
  ['Haz seguimiento', 'Consulta el estado y responde si Tecnología te pide más información.'],
]

const SEGURIDAD = [
  [IconMail, 'Cuidado con correos electrónicos sospechosos', 'No hagas clic en enlaces ni descargues archivos adjuntos de correos electrónicos desconocidos o sospechosos, ya que pueden contener malware.'],
  [IconCloud, 'Respaldo de datos', 'Realiza copias de seguridad periódicas de tus archivos importantes en un lugar seguro, como Google Drive u otros servicios de almacenamiento en la nube autorizados.'],
  [IconFishing, 'Cuidado con el phishing', 'Desconfía de mensajes que soliciten información personal o financiera, especialmente si parecen provenir de instituciones bancarias o entidades oficiales. Verifica la autenticidad del remitente antes de proporcionar información sensible.'],
]

const HERRAMIENTAS = [
  [HERRAMIENTAS_LOGOS.speedtest, 'Speedtest', 'Plataforma para validar la velocidad de navegación en internet.', 'https://www.speedtest.net/es', 'Medir velocidad', 'Navegador'],
  [HERRAMIENTAS_LOGOS.ipscanner, 'IP Scanner', 'Aplicativo para escanear la red y validar los dispositivos conectados.', 'https://www.advanced-ip-scanner.com/es/', 'Ver aplicativo', 'Windows'],
  [HERRAMIENTAS_LOGOS.anydesk, 'AnyDesk', 'Aplicativo para conexión remota.', 'https://anydesk.com/es', 'Ver aplicativo', 'Soporte remoto'],
]

const RECURSOS = [
  [IconShield, 'Políticas de uso de los recursos tecnológicos', 'Lineamientos para el uso adecuado de equipos, cuentas y servicios.', 'https://drive.google.com/file/d/1imFTmPuhi5k2yC6FAjM0zzNDvWgnZInO/view?usp=sharing'],
  [IconBook, 'Inducción de sistemas', 'Material de inducción sobre las herramientas tecnológicas de la empresa.', 'https://drive.google.com/file/d/1YvlFcrx_2uw7u91hFbCTouwo530BV8_9/view?usp=sharing'],
]

function BotonGlpi({ url, className = '' }) {
  return (
    <a className={`sv-btn sv-btn--lg ${className}`} href={url} target="_blank" rel="noopener noreferrer">
      Ingresa a GLPI <IconExternal width={18} height={18} />
      <span className="sv-sr">(se abre en una pestaña nueva)</span>
    </a>
  )
}

export default function SoportePage() {
  const [glpi, setGlpi] = useState(GLPI_URL)
  useEffect(() => { api.config().then((c) => c.glpiUrl && setGlpi(c.glpiUrl)).catch(() => {}) }, [])

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Soporte IT']]}
        eyebrow="Tecnología"
        title="Soporte IT"
        lead="Aquí podrás encontrar información y acceder al canal oficial para registrar solicitudes e incidentes relacionados con tecnología."
        icon={IconHeadset}
        tone="violet"
        photo={FOTOS.soporte}
      />

      <div className="sv-wrap sv-page">
        {/* GLPI: canal oficial */}
        <section className="sv-glpi" aria-labelledby="sv-glpi-title">
          <div className="sv-glpi__text">
            <p className="sv-eyebrow">Canal oficial</p>
            <h2 id="sv-glpi-title">Registra, consulta y haz seguimiento a tus solicitudes desde un solo lugar</h2>
            <p>En nuestro día a día pueden surgir diferentes situaciones que requieren apoyo tecnológico: un inconveniente con un equipo, un error en un sistema o simplemente una solicitud de soporte.</p>
            <p>Para facilitar esta gestión, <b>GLPI se encuentra disponible como el canal oficial</b> para registrar y realizar seguimiento a estos requerimientos, permitiendo que cada solicitud quede organizada y pueda ser atendida de manera más ágil.</p>
            <p>Recuerda que centralizar tus solicitudes también facilita su seguimiento y evita que se pierda información importante.</p>
            <div className="sv-glpi__cta">
              <BotonGlpi url={glpi} />
              <span className="sv-glpi__url">{glpi.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </div>
          </div>
          <figure className="sv-glpi__media">
            <img src={FOTOS.equipoOficina.src} alt={FOTOS.equipoOficina.alt} style={{ objectPosition: '70% 40%' }} />
            <figcaption><IconCheckCircle width={18} height={18} /> Las solicitudes de tecnología se registran únicamente en GLPI.</figcaption>
          </figure>
        </section>

        <section className="sv-block" aria-labelledby="sv-benef">
          <p className="sv-eyebrow">¿Para qué sirve?</p>
          <h2 id="sv-benef" className="sv-h2">GLPI es la plataforma oficial para tus solicitudes e incidentes tecnológicos</h2>
          <ul className="sv-benefits">
            {BENEFICIOS.map(([Icon, t, x]) => (
              <li key={t}>
                <span className="sv-benefits__icon"><Icon width={22} height={22} /></span>
                <b>{t}</b>
                <p>{x}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sv-block" aria-labelledby="sv-como">
          <p className="sv-eyebrow">¿Cómo se usa?</p>
          <h2 id="sv-como" className="sv-h2">Tu caso en cuatro pasos</h2>
          <ol className="sv-howto">
            {PASOS.map(([t, x], i) => (
              <li key={t}>
                <span className="sv-howto__n">{i + 1}</span>
                <b>{t}</b>
                <p>{x}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="sv-block" aria-labelledby="sv-cambia">
          <h2 id="sv-cambia" className="sv-sr">¿Qué cambia cuando usas GLPI?</h2>
          <a className="sv-compare-img" href={glpi} target="_blank" rel="noopener noreferrer">
            <img
              src={HERRAMIENTAS_LOGOS.glpiInfo}
              width="1536"
              height="1024"
              loading="lazy"
              alt="Comparación. Si usas GLPI: tu solicitud queda registrada, puedes consultar el estado del caso, existe un historial de tus solicitudes y Tecnología recibe el requerimiento por el canal oficial. Si no lo registras en GLPI: la información puede quedar dispersa, el seguimiento se vuelve más difícil, no tienes el caso centralizado y el requerimiento no ingresa por el canal establecido."
            />
            <span className="sv-compare-img__cta">Ingresa a GLPI <IconExternal width={16} height={16} /><span className="sv-sr">(se abre en una pestaña nueva)</span></span>
          </a>
        </section>

        <section className="sv-quote" aria-label="Mensaje del área de Tecnología">
          <img className="sv-quote__mark" src={MARCA.monograma} alt="" aria-hidden="true" />
          <IconHeadset width={32} height={32} />
          <div>
            <p>En nuestro compromiso constante por mejorar nuestros sistemas y brindar un excelente servicio, queremos recordarles la importancia de comunicarse con nosotros en caso de cualquier incidente o solicitud relacionada con nuestros sistemas.</p>
            <p><b>Su opinión y participación son fundamentales para mantener todo en funcionamiento de manera eficiente.</b></p>
            <p>Si experimentan algún problema con nuestros sistemas, como interrupciones, errores o dificultades técnicas, les pedimos que nos lo informen de inmediato. Estamos aquí para ayudar y resolver cualquier situación lo más rápido posible.</p>
            <BotonGlpi url={glpi} className="sv-btn--light" />
          </div>
        </section>

        <section className="sv-block" aria-labelledby="sv-seg">
          <p className="sv-eyebrow">Seguridad</p>
          <h2 id="sv-seg" className="sv-h2">Buenas prácticas de seguridad informática</h2>
          <div className="sv-cards3">
            {SEGURIDAD.map(([Icon, t, x]) => (
              <article key={t} className="sv-tip">
                <span className="sv-tip__icon"><Icon width={24} height={24} /></span>
                <h3>{t}</h3>
                <p>{x}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sv-block" aria-labelledby="sv-tools">
          <p className="sv-eyebrow">Herramientas</p>
          <h2 id="sv-tools" className="sv-h2">Plataformas web y aplicativos prácticos</h2>
          <div className="sv-cards3">
            {HERRAMIENTAS.map(([logo, t, x, url, cta, tag]) => (
              <article key={t} className="sv-tool">
                <div className="sv-tool__top">
                  <img className="sv-tool__logo" src={logo} alt={`Logo de ${t}`} loading="lazy" />
                  <span className="sv-chip sv-chip--neutral">{tag}</span>
                </div>
                <h3>{t}</h3>
                <p>{x}</p>
                <a className="sv-link" href={url} target="_blank" rel="noopener noreferrer">{cta} <IconExternal width={16} height={16} /><span className="sv-sr">(pestaña nueva)</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="sv-block" aria-labelledby="sv-rec">
          <p className="sv-eyebrow">Recursos</p>
          <h2 id="sv-rec" className="sv-h2">Recursos de tecnología</h2>
          <div className="sv-resources">
            {RECURSOS.map(([Icon, t, x, url]) => (
              <a key={t} className="sv-resource" href={url} target="_blank" rel="noopener noreferrer">
                <span className="sv-resource__icon"><Icon width={24} height={24} /></span>
                <span className="sv-resource__text"><b>{t}</b><small>{x}</small></span>
                <span className="sv-resource__go"><IconFileText width={18} height={18} /> Abrir documento</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
