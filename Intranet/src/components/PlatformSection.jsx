import './PlatformSection.css'

/* "Conoce nuestra plataforma": acceso a la plataforma web de un proyecto.
   Los colores vienen de cada página (--pf-accent, --pf-deep, --pf-soft, --pf-ink). */

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export default function PlatformSection({ id, eyebrow = 'Plataforma digital', title, text, url, features = [], style }) {
  const dominio = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return (
    <section className="pf" id={id} style={style} aria-labelledby={`${id}-title`}>
      <div className="pf-wrap">
        <div className="pf-text">
          <p className="pf-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p className="pf-lead">{text}</p>
          {features.length > 0 && (
            <ul className="pf-features">
              {features.map((f) => (
                <li key={f}>
                  <svg {...svg} width="18" height="18" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 6.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          )}
          <div className="pf-actions">
            <a className="pf-btn" href={url} target="_blank" rel="noopener noreferrer">
              Ingresar a la plataforma
              <svg {...svg} width="18" height="18" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
              <span className="pf-sr">(se abre en una pestaña nueva)</span>
            </a>
            <span className="pf-url">{dominio}</span>
          </div>
        </div>

        {/* Ilustración: ventana del navegador con la pantalla de acceso */}
        <a className="pf-mock" href={url} target="_blank" rel="noopener noreferrer" aria-hidden="true" tabIndex={-1}>
          <span className="pf-mock__bar">
            <i /><i /><i />
            <span className="pf-mock__url">
              <svg {...svg} width="12" height="12" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              {dominio}/login
            </span>
          </span>
          <span className="pf-mock__screen">
            <span className="pf-mock__card">
              <span className="pf-mock__avatar" />
              <span className="pf-mock__line pf-mock__line--title" />
              <span className="pf-mock__input" />
              <span className="pf-mock__input" />
              <span className="pf-mock__button">Ingresar</span>
            </span>
          </span>
        </a>
      </div>
    </section>
  )
}
