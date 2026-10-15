import { EMPRESAS, projects as todos } from '../data/projects.js'
import SectionTitle from './SectionTitle.jsx'
import { IconArrowRight, IconDownload, IconFolders } from './Icons.jsx'

const projects = todos.filter((p) => !p.oculto)

/* Los proyectos se agrupan por la empresa que los ejecuta. */
const grupos = EMPRESAS
  .map((e) => ({ ...e, proyectos: projects.filter((p) => p.empresa === e.id) }))
  .filter((g) => g.proyectos.length)

export default function ProjectsSection() {
  return (
    <section className="projects" id="proyectos" aria-labelledby="projects-title">
      <SectionTitle icon={IconFolders}>
        <span id="projects-title">Nuestros proyectos</span>
      </SectionTitle>

      {grupos.map((g) => (
        <div key={g.id} className="empresa" aria-labelledby={`empresa-${g.id}`}>
          <header className="empresa__head">
            <span className="empresa__logo"><img src={g.logo} alt="" /></span>
            <div>
              <h3 id={`empresa-${g.id}`} className="empresa__name">{g.name}</h3>
              <p className="empresa__desc">{g.desc}</p>
            </div>
          </header>

          <div className="projects__grid">
            {g.proyectos.map((p) => (
              <article key={p.id} className="proj card">
                <div className="proj__head">
                  {p.logo ? (
                    <div className="proj__logo">
                      <img src={p.logo} alt={p.name} />
                    </div>
                  ) : (
                    <div className="proj__mono" style={{ background: p.color }}>
                      {p.monogram}
                    </div>
                  )}
                  <h4 className="proj__name">{p.name}</h4>
                </div>

                <p className="proj__desc">{p.desc}</p>

                <div className="proj__actions">
                  <a className="btn btn--primary" href={p.href || `#${p.id}`}>
                    Ver proyecto
                    <IconArrowRight width={16} height={16} />
                  </a>
                  <a className="btn btn--ghost" href={p.docsHref || `#${p.id}-formatos`}>
                    <IconDownload width={16} height={16} />
                    Descargar formatos
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
