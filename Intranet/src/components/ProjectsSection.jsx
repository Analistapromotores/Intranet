import { useState } from 'react'
import { projects } from '../data/projects.js'
import SectionTitle from './SectionTitle.jsx'
import { IconArrowRight, IconDownload, IconFolders } from './Icons.jsx'

const PREVIEW = 3

export default function ProjectsSection() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? projects : projects.slice(0, PREVIEW)
  const hasMore = projects.length > PREVIEW

  return (
    <section className="projects" id="proyectos" aria-labelledby="projects-title">
      <SectionTitle
        icon={IconFolders}
        action={
          hasMore
            ? {
                label: expanded ? 'Ver menos' : 'Ver todos los proyectos',
                onClick: () => setExpanded((v) => !v),
                expanded,
                chevron: true,
              }
            : undefined
        }
      >
        <span id="projects-title">Nuestros proyectos</span>
      </SectionTitle>

      <div className="projects__grid">
        {visible.map((p) => (
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
              <h3 className="proj__name">{p.name}</h3>
            </div>

            <p className="proj__desc">{p.desc}</p>

            <div className="proj__actions">
              <a className="btn btn--primary" href={`#${p.id}`}>
                Ver proyecto
                <IconArrowRight width={16} height={16} />
              </a>
              <a className="btn btn--ghost" href={`#${p.id}-formatos`}>
                <IconDownload width={16} height={16} />
                Descargar formatos
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
