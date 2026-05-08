function WorkSection({ text, externalLinkProps }) {
  return (
    <section className="section work-section" id="work">
      <div className="section-heading compact reveal">
        <p className="eyebrow">{text.work.eyebrow}</p>
        <h2>{text.work.title}</h2>
      </div>

      <div className="timeline">
        {text.work.items.map((item) => (
          <article className="timeline-item reveal" key={`${item.company}-${item.period}`}>
            <span>{item.period}</span>
            <h3>{item.role}</h3>
            <a className="company-link" href={item.href} {...externalLinkProps}>
              {item.company}
            </a>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WorkSection
