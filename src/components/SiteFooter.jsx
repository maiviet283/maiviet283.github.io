function SiteFooter({ text }) {
  const year = new Date().getFullYear()
  const footer = text.footer

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="site-footer-inner">
        <p className="site-footer-tagline">{footer.tagline}</p>
        <nav className="site-footer-nav" aria-label={footer.pagesLabel}>
          {footer.pages.map((page) => (
            <a key={page.href} href={page.href}>
              {page.label}
            </a>
          ))}
        </nav>
        <p className="site-footer-rights">
          © {year} Mai Quốc Việt. {footer.rights}
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
