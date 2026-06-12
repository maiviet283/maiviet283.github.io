// Client-side behaviors for the static Astro site:
// theme toggle, mobile menu, smooth scrolling, reveal-on-scroll,
// project card expand/collapse and the live signals cards.

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  )

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------
const setupTheme = () => {
  const root = document.documentElement
  const shell = document.querySelector('.site-shell')
  const button = document.querySelector('.theme-toggle')

  if (!button) {
    return
  }

  let switchTimer = null

  const renderButton = () => {
    const theme = root.dataset.theme || 'dark'
    const icon = button.querySelector('.theme-icon')

    if (icon) {
      icon.classList.toggle('sun-icon', theme === 'light')
      icon.classList.toggle('moon-icon', theme !== 'light')
    }

    const label = theme === 'light' ? button.dataset.labelToDark : button.dataset.labelToLight
    const textNodes = Array.from(button.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim(),
    )

    if (textNodes.length > 0) {
      textNodes[textNodes.length - 1].nodeValue = label
    } else {
      button.append(label)
    }
  }

  renderButton()

  button.addEventListener('click', () => {
    const nextTheme = (root.dataset.theme || 'dark') === 'light' ? 'dark' : 'light'
    root.dataset.theme = nextTheme

    try {
      localStorage.setItem('theme', nextTheme)
    } catch {
      // localStorage might be unavailable (private mode); the theme still applies.
    }

    renderButton()

    if (shell) {
      shell.classList.add('theme-is-switching')

      if (switchTimer) {
        window.clearTimeout(switchTimer)
      }

      switchTimer = window.setTimeout(() => {
        shell.classList.remove('theme-is-switching')
        switchTimer = null
      }, 620)
    }
  })
}

// ---------------------------------------------------------------------------
// Mobile menu + smooth scrolling
// ---------------------------------------------------------------------------
const setupMenuAndScroll = () => {
  const topbar = document.querySelector('.topbar')

  if (!topbar) {
    return
  }

  const nav = topbar.querySelector('nav')
  const backdrop = topbar.querySelector('.menu-backdrop')
  const menuToggle = topbar.querySelector('.menu-toggle')

  const setMenuOpen = (isOpen) => {
    nav?.classList.toggle('is-open', isOpen)
    backdrop?.classList.toggle('is-open', isOpen)
    backdrop?.setAttribute('aria-hidden', String(!isOpen))
    menuToggle?.classList.toggle('is-open', isOpen)
    menuToggle?.setAttribute('aria-expanded', String(isOpen))
    menuToggle?.setAttribute(
      'aria-label',
      isOpen ? menuToggle.dataset.labelClose : menuToggle.dataset.labelOpen,
    )
  }

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!nav?.classList.contains('is-open'))
  })

  backdrop?.addEventListener('click', () => setMenuOpen(false))

  const scrollToSection = (event, href) => {
    if (!href || !href.startsWith('#')) {
      return
    }

    event.preventDefault()

    const target = document.querySelector(href)

    if (!target) {
      return
    }

    const headerHeight = topbar.offsetHeight || 0
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth',
    })

    setMenuOpen(false)
  }

  topbar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => scrollToSection(event, link.getAttribute('href')))
  })
}

// ---------------------------------------------------------------------------
// Reveal-on-scroll animation
// ---------------------------------------------------------------------------
const setupReveal = () => {
  const revealTargets = document.querySelectorAll('.reveal')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          entry.target.dataset.reveal = 'visible'
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.16 },
  )

  revealTargets.forEach((target) => observer.observe(target))
}

// ---------------------------------------------------------------------------
// Project cards: expand/collapse on compact viewports
// ---------------------------------------------------------------------------
const setupProjectToggles = () => {
  document.querySelectorAll('.project-card').forEach((card) => {
    const toggle = card.querySelector('.project-toggle')

    if (!toggle) {
      return
    }

    toggle.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('is-expanded')

      card.querySelector('.project-summary')?.classList.toggle('is-collapsed', !isExpanded)
      card.querySelector('.project-feature-list')?.classList.toggle('is-collapsed', !isExpanded)
      toggle.setAttribute('aria-expanded', String(isExpanded))
      toggle.textContent = isExpanded ? toggle.dataset.labelCollapse : toggle.dataset.labelExpand
    })
  })
}

// ---------------------------------------------------------------------------
// Live signals (GitHub / weather / Vietnam time)
// ---------------------------------------------------------------------------
const fallbackVietnamTime = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date())

const fetchJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

const getLivePulse = async (fallbackTimeLabel) => {
  const [userResult, reposResult, weatherResult, timeResult] = await Promise.allSettled([
    fetchJson('https://api.github.com/users/maiviet283'),
    fetchJson('https://api.github.com/users/maiviet283/repos?per_page=100&sort=updated'),
    fetchJson(
      'https://api.open-meteo.com/v1/forecast?latitude=16.0471&longitude=108.2068&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FHo_Chi_Minh',
    ),
    fetchJson('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh'),
  ])

  if (
    userResult.status === 'rejected' &&
    reposResult.status === 'rejected' &&
    weatherResult.status === 'rejected' &&
    timeResult.status === 'rejected'
  ) {
    throw new Error('All live APIs failed')
  }

  const repos = reposResult.status === 'fulfilled' ? reposResult.value : []
  const newestRepo = repos[0]
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value.current : null
  const apiTime = timeResult.status === 'fulfilled' ? timeResult.value : null

  return {
    github: user
      ? {
          repos: user.public_repos,
          followers: user.followers,
          stars: totalStars,
          latest: newestRepo?.name,
          profileUrl: user.html_url,
        }
      : null,
    weather,
    time: {
      value: apiTime?.datetime
        ? new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date(apiTime.datetime))
        : fallbackVietnamTime(),
      source: apiTime?.timezone || fallbackTimeLabel,
    },
  }
}

const setupLiveSignals = () => {
  const section = document.querySelector('[data-live-signals]')
  const i18nScript = section?.querySelector('[data-live-i18n]')

  if (!section || !i18nScript) {
    return
  }

  const i18n = JSON.parse(i18nScript.textContent)
  const cards = {
    github: section.querySelector('[data-live-card="github"]'),
    weather: section.querySelector('[data-live-card="weather"]'),
    time: section.querySelector('[data-live-card="time"]'),
  }

  const setCardContent = (card, html) => {
    if (!card) {
      return
    }

    // State content lives as direct children after the card head, because the
    // CSS targets `.live-card > *` children.
    const head = card.querySelector('.live-card-head')

    while (head?.nextSibling) {
      head.nextSibling.remove()
    }

    card.insertAdjacentHTML('beforeend', html)
  }

  const loaderHtml = `
    <div class="signal-loader" role="status" aria-live="polite">
      <span aria-hidden="true"></span>
      <strong>${escapeHtml(i18n.loading)}</strong>
    </div>`

  const errorHtml = `<strong>${escapeHtml(i18n.error)}</strong>`

  const renderLoading = () => {
    Object.values(cards).forEach((card) => setCardContent(card, loaderHtml))
  }

  const renderError = () => {
    Object.values(cards).forEach((card) => setCardContent(card, errorHtml))
  }

  const renderPulse = (pulse) => {
    if (pulse.github) {
      setCardContent(
        cards.github,
        `
        <div class="live-metrics">
          <span><strong>${escapeHtml(pulse.github.repos)}</strong>${escapeHtml(i18n.github.repos)}</span>
          <span><strong>${escapeHtml(pulse.github.followers)}</strong>${escapeHtml(i18n.github.followers)}</span>
          <span><strong>${escapeHtml(pulse.github.stars)}</strong>${escapeHtml(i18n.github.stars)}</span>
        </div>
        <p>${escapeHtml(i18n.github.latest)}: <strong>${escapeHtml(pulse.github.latest ?? '')}</strong></p>
        <a href="${escapeHtml(pulse.github.profileUrl)}" target="_blank" rel="noreferrer">${escapeHtml(i18n.github.profile)}</a>`,
      )
    } else {
      setCardContent(cards.github, errorHtml)
    }

    if (pulse.weather) {
      const weatherLabel = i18n.weather.codes[String(pulse.weather.weather_code)] || i18n.weather.unknown

      setCardContent(
        cards.weather,
        `
        <strong class="live-big">${escapeHtml(weatherLabel)}</strong>
        <div class="live-metrics">
          <span><strong>${escapeHtml(Math.round(pulse.weather.temperature_2m))}°C</strong>${escapeHtml(i18n.weather.temperature)}</span>
          <span><strong>${escapeHtml(pulse.weather.relative_humidity_2m)}%</strong>${escapeHtml(i18n.weather.humidity)}</span>
          <span><strong>${escapeHtml(Math.round(pulse.weather.wind_speed_10m))} km/h</strong>${escapeHtml(i18n.weather.wind)}</span>
        </div>`,
      )
    } else {
      setCardContent(cards.weather, errorHtml)
    }

    setCardContent(
      cards.time,
      `
      <strong class="live-clock">${escapeHtml(pulse.time.value)}</strong>
      <p>${escapeHtml(i18n.time.label)}</p>
      <small>${escapeHtml(i18n.time.zone)} / ${escapeHtml(pulse.time.source)}</small>`,
    )
  }

  const loadPulse = async () => {
    renderLoading()

    try {
      renderPulse(await getLivePulse(i18n.time.fallback))
    } catch {
      renderError()
    }
  }

  section.querySelector('[data-live-refresh]')?.addEventListener('click', loadPulse)

  loadPulse()
}

setupTheme()
setupMenuAndScroll()
setupReveal()
setupProjectToggles()
setupLiveSignals()
