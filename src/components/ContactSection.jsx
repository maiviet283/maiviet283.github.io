const icons = {
  email: (
    <path d="M3.5 6.5h17v11h-17z M4.5 7.5l7.5 6 7.5-6" />
  ),
  facebook: <path d="M13.4 20v-7h2.3l.4-3h-2.7V8.1c0-.9.3-1.5 1.6-1.5h1.2V4c-.6-.1-1.4-.2-2.2-.2-2.7 0-4.5 1.6-4.5 4.6V10H7v3h2.5v7z" />,
  github: (
    <path d="M12 3.8a8.2 8.2 0 0 0-2.6 16c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-1-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.5.8.1-.6.3-1 .5-1.2-1.9-.2-3.8-.9-3.8-4a3.2 3.2 0 0 1 .8-2.2 3 3 0 0 1 .1-2.2s.7-.2 2.3.8a7.8 7.8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.4 1 .2 1.8.1 2.2.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.8 4 .3.2.6.8.6 1.6v2.1c0 .2.2.5.6.4A8.2 8.2 0 0 0 12 3.8z" />
  ),
  tiktok: <path d="M14.2 4c.3 2.1 1.5 3.4 3.7 3.6v3a6.5 6.5 0 0 1-3.7-1.2v5.6c0 2.8-1.8 5-4.7 5a4.7 4.7 0 0 1-4.8-4.7c0-3 2.4-5 5.5-4.6v3.1c-1.4-.4-2.5.3-2.5 1.5 0 1 .8 1.7 1.7 1.7 1.1 0 1.8-.7 1.8-2.1V4z" />,
  instagram: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M16.6 7.4h.1" />
    </>
  ),
  linkedin: <path d="M5 9h3v10H5z M6.5 5a1.7 1.7 0 1 1 0 3.4A1.7 1.7 0 0 1 6.5 5z M10 9h2.9v1.4c.4-.8 1.3-1.6 2.8-1.6 3 0 3.6 2 3.6 4.6V19h-3v-5c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V19H10z" />,
  locket: (
    <path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.8-7 10-7 10z M9.5 10.5h5 M12 8v5" />
  ),
}

function SocialIcon({ label }) {
  const icon = icons[label.toLowerCase()] || icons.email

  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icon}
    </svg>
  )
}

function ContactSection({ text, externalLinkProps }) {
  return (
    <section className="contact-section" id="contact">
      <div className="reveal">
        <p className="eyebrow">{text.contact.eyebrow}</p>
        <h2>{text.contact.title}</h2>
      </div>
      <div className="contact-links reveal">
        {text.contact.links.map((link) => (
          <a
            href={link.href}
            key={link.href}
            {...(link.href.startsWith('http') ? externalLinkProps : {})}
          >
            <SocialIcon label={link.label} />
            <span>{link.label}</span>
            <strong>{link.value}</strong>
          </a>
        ))}
      </div>
    </section>
  )
}

export default ContactSection
