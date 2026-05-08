import { useState } from 'react'

function Header({ text, theme, logo, onLanguageChange, onThemeChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (event, href) => {
    if (!href.startsWith('#')) {
      return
    }

    event.preventDefault()

    const target = document.querySelector(href)

    if (!target) {
      return
    }

    const headerHeight = document.querySelector('.topbar')?.offsetHeight || 0
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth',
    })

    setIsMenuOpen(false)
  }

  return (
    <header className="topbar" aria-label={text.meta.primaryNavigation}>
      <a
        className="brand"
        href="#top"
        aria-label={text.meta.homeAria}
        onClick={(event) => scrollToSection(event, '#top')}
      >
        <span className="brand-mark">
          <img src={logo} alt="" aria-hidden="true" />
        </span>
        <span>{text.brand.name}</span>
      </a>

      <div className="header-controls">
        <button
          className={`menu-backdrop${isMenuOpen ? ' is-open' : ''}`}
          type="button"
          aria-hidden={!isMenuOpen}
          tabIndex={-1}
          onClick={() => setIsMenuOpen(false)}
        />
        <nav className={isMenuOpen ? 'is-open' : ''}>
          {text.nav.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => scrollToSection(event, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          className="language-toggle"
          type="button"
          aria-label={text.meta.switchLanguage}
          onClick={onLanguageChange}
        >
          {text.language.current}
          <span>{text.language.next}</span>
        </button>
        <button
          className={`menu-toggle${isMenuOpen ? ' is-open' : ''}`}
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? text.menu.close : text.menu.open}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span aria-hidden="true" />
          {text.menu.label}
        </button>
        <button
          className="theme-toggle"
          type="button"
          aria-label={text.meta.switchTheme}
          onClick={onThemeChange}
        >
          <span className={`theme-icon ${theme === 'light' ? 'sun-icon' : 'moon-icon'}`} aria-hidden="true" />
          {theme === 'light' ? text.theme.toDark : text.theme.toLight}
        </button>
      </div>
    </header>
  )
}

export default Header
