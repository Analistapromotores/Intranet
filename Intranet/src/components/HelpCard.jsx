import { IconArrowRight, IconHeadset } from './Icons.jsx'
import { GLPI_URL } from '../config.js'

export default function HelpCard() {
  return (
    <section className="help-card" aria-labelledby="help-card-title">
      <span className="help-card__icon" aria-hidden="true">
        <IconHeadset width={28} height={28} />
      </span>
      <h2 id="help-card-title" className="help-card__title">¿Necesitas ayuda?</h2>
      <p className="help-card__text">
        Reporta una incidencia o radica una solicitud. El equipo de soporte te
        responde a través de la mesa de ayuda GLPI.
      </p>
      <a
        className="help-card__btn"
        href={GLPI_URL}
        target="_blank"
        rel="noreferrer"
      >
        Ir al GLPI
        <IconArrowRight width={18} height={18} />
      </a>
    </section>
  )
}
