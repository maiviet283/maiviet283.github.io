function HeroSection({ text, avatar, resume, externalLinkProps }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy reveal">
        {text.hero.eyebrow ? <p className="eyebrow">{text.hero.eyebrow}</p> : null}
        <h1>{text.hero.title}</h1>
        <p className="hero-text">{text.hero.body}</p>
      </div>

      <div className="hero-visual" aria-label={text.meta.profileVisual}>
        <div className="portrait-frame reveal">
          <img src={avatar} alt={text.hero.avatarAlt} />
        </div>
        <div className="signal-panel reveal">
          <span>{text.hero.signalLabel}</span>
          <strong>{text.hero.signalTitle}</strong>
          <small>{text.hero.signalText}</small>
        </div>
      </div>

      <div className="hero-actions reveal" aria-label={text.meta.heroActions}>
        <a className="primary-action" href="https://vietdon.vn" {...externalLinkProps}>
          {text.hero.primaryAction}
        </a>
        <a className="secondary-action" href={resume} {...externalLinkProps}>
          {text.hero.secondaryAction}
        </a>
      </div>
    </section>
  )
}

export default HeroSection
