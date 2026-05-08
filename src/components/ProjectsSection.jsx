import { useEffect, useState } from 'react'

function ProjectsSection({ text, externalLinkProps }) {
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    window.matchMedia('(max-width: 860px)').matches,
  )
  const [expandedProjectNames, setExpandedProjectNames] = useState({})

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 860px)')

    const handleViewportChange = (event) => {
      setIsCompactViewport(event.matches)
      if (!event.matches) {
        setExpandedProjectNames({})
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)

    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  const isVietnamese = text.language.current === 'VI'
  const expandLabel = isVietnamese ? 'Xem chi tiết' : 'View details'
  const collapseLabel = isVietnamese ? 'Thu gọn' : 'Collapse'
  const openGithubLabel = isVietnamese ? 'Mở GitHub' : 'Open GitHub'

  return (
    <section className="section projects-grid" aria-label={text.meta.otherProjects}>
      <div className="section-heading compact reveal">
        <p className="eyebrow">{text.projects.eyebrow}</p>
        <h2>{text.projects.title}</h2>
      </div>

      {text.projects.items.map((project) => {
        const isExpanded = Boolean(expandedProjectNames[project.name])
        const shouldCollapse = isCompactViewport && !isExpanded

        return (
        <article className={`project-card reveal${isExpanded ? ' is-expanded' : ''}`} key={project.name}>
          <span>{text.projects.badge}</span>
          <h3>{project.name}</h3>
          <p className={`project-summary${shouldCollapse ? ' is-collapsed' : ''}`}>{project.detail}</p>
          <div className="project-tech">
            {project.tech.map((item) => (
              <small key={item}>{item}</small>
            ))}
          </div>
          <ul className={shouldCollapse ? 'is-collapsed' : ''}>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="project-actions">
            {isCompactViewport && (
              <button
                className="project-toggle"
                type="button"
                onClick={() =>
                  setExpandedProjectNames((currentValue) => ({
                    ...currentValue,
                    [project.name]: !currentValue[project.name],
                  }))
                }
                aria-expanded={isExpanded}
              >
                {isExpanded ? collapseLabel : expandLabel}
              </button>
            )}
            <a href={project.href} {...externalLinkProps}>
              {openGithubLabel}
            </a>
          </div>
        </article>
      )})}
    </section>
  )
}

export default ProjectsSection
