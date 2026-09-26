import { IconArrowRight, IconExternal, IconHeadset, IconPhone } from './Icons.jsx'
import { GLPI_URL } from '../config.js'

/* Mesa de ayuda: acceso rápido al GLPI, a las guías de soporte y a las extensiones. */
export default function HelpCard() {
  return (
    <section className="help2" aria-labelledby="help-card-title">
      <span className="help2__ring help2__ring--a" aria-hidden="true" />
      <span className="help2__ring help2__ring--b" aria-hidden="true" />

      <div className="help2__top">
        <span className="help2__icon" aria-hidden="true">
          <span className="help2__wave" />
          <span className="help2__wave help2__wave--2" />
          <IconHeadset width={30} height={30} />
        </span>
        <span className="help2__badge"><i aria-hidden="true" /> Mesa de ayuda</span>
      </div>

      <h2 id="help-card-title" className="help2__title">¿Algo no funciona? <em>Te ayudamos.</em></h2>
      <p className="help2__text">Reporta una incidencia o pide soporte y el equipo de TI te responde a través del GLPI.</p>

      <div className="help2__actions">
        <a className="help2__btn help2__btn--main" href={GLPI_URL} target="_blank" rel="noreferrer">
          Abrir un ticket en GLPI
          <IconExternal width={17} height={17} />
        </a>
        <a className="help2__btn" href="#solicitudes-soporte">
          Guías de soporte
          <IconArrowRight width={16} height={16} />
        </a>
        <a className="help2__btn" href="#extensiones">
          <IconPhone width={16} height={16} />
          Extensiones
        </a>
      </div>
    </section>
  )
}
