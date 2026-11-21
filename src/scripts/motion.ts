/**
 * The site's runtime, on every page:
 * - Lenis inertial scroll, anchors scroll through it;
 * - entrances: [data-reveal] / [data-reveal-group] get .is-on in view;
 * - numbers [data-count] count up once visible;
 * - paint-stripe page transition between internal pages;
 * - header tucks away while reading down, progress bar, back-to-top ring;
 * - theme toggle (a circle grows from the button), mobile menu;
 * - the mascot turns its head toward the pointer, hero stickers parallax,
 *   magnetic buttons, marquees pause off screen;
 * - live signals (GitHub, Da Nang weather, Vietnam clock).
 */
import Lenis from 'lenis'

const root = document.documentElement
const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches

let lenis: Lenis | null = null

// ---------------------------------------------------------------------------
// Smooth scroll
// ---------------------------------------------------------------------------
function initScroll(): void {
  if (!reduced()) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: false })
    const raf = (time: number): void => {
      lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }

  const headerOffset = (): number => -((document.querySelector<HTMLElement>('[data-header]')?.offsetHeight ?? 0) + 12)

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]')
    if (!link || event.defaultPrevented) return
    const url = new URL(link.href, location.href)
    if (url.pathname !== location.pathname || !url.hash) return
    const target = url.hash === '#main' || url.hash === '#top' ? document.body : document.querySelector(url.hash)
    if (!target) return
    event.preventDefault()
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: headerOffset() })
    else (target as HTMLElement).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' })
    history.replaceState(null, '', url.hash === '#main' || url.hash === '#top' ? location.pathname : url.hash)
  })
}

// ---------------------------------------------------------------------------
// Entrances + count-up
// ---------------------------------------------------------------------------
function countUp(el: HTMLElement): void {
  const to = Number(el.dataset.count)
  const locale = el.dataset.grouped
  const original = el.textContent ?? ''
  if (!Number.isFinite(to) || reduced()) return
  const decimals = original.includes('.') && !locale ? original.split('.')[1].length : 0
  const format = (value: number): string =>
    locale ? Math.round(value).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : value.toFixed(decimals)
  const start = performance.now()
  const duration = 1400
  const tick = (now: number): void => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 4)
    el.textContent = format(to * eased)
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = original
  }
  requestAnimationFrame(tick)
}

function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group], [data-count]')
  // Children of a group stagger 100ms apart unless they set their own index.
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      const el = child as HTMLElement
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(index))
    })
  })

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-on'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add('is-on')
        if (el.dataset.count) countUp(el)
        observer.unobserve(el)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  )
  targets.forEach((el) => observer.observe(el))
}

// ---------------------------------------------------------------------------
// Page transition: paint stripes
// ---------------------------------------------------------------------------
function initWipe(): void {
  if (root.classList.contains('wipe-in')) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-arriving')))
    setTimeout(() => root.classList.remove('wipe-in', 'is-arriving'), 900)
  }
  if (reduced()) return

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
    if (!link || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (link.target === '_blank' || link.hasAttribute('download')) return
    const url = new URL(link.href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname) return
    event.preventDefault()
    root.classList.add('is-leaving')
    lenis?.stop()
    try {
      sessionStorage.setItem('mv-wipe', '1')
    } catch {
      // Storage blocked: the next page simply appears.
    }
    setTimeout(() => (location.href = url.href), 620)
  })

  // Back/forward from the cache: never leave the stripes on screen.
  addEventListener('pageshow', (event) => {
    if (!event.persisted) return
    root.classList.remove('is-leaving', 'wipe-in', 'is-arriving')
    lenis?.start()
  })
}

// ---------------------------------------------------------------------------
// Header, progress bar, back to top
// ---------------------------------------------------------------------------
function initChrome(): void {
  const header = document.querySelector<HTMLElement>('[data-header]')
  const bar = document.querySelector<HTMLElement>('.progress')
  const fab = document.querySelector<HTMLElement>('.fab-top')
  const parallax = document.querySelectorAll<HTMLElement>('[data-parallax]')
  let lastY = window.scrollY
  let queued = false

  const update = (): void => {
    queued = false
    const y = window.scrollY
    const max = Math.max(1, root.scrollHeight - window.innerHeight)
    const progress = Math.min(1, y / max).toFixed(4)
    bar?.style.setProperty('--progress', progress)
    fab?.style.setProperty('--progress', progress)
    fab?.classList.toggle('is-visible', y > window.innerHeight * 0.8)
    const menuOpen = header?.querySelector('[data-menu-toggle]')?.getAttribute('aria-expanded') === 'true'
    if (y > 320 && y > lastY + 4 && !menuOpen) header?.classList.add('is-tucked')
    else if (y < lastY - 4 || y < 120) header?.classList.remove('is-tucked')
    if (!reduced() && y < window.innerHeight * 1.2) {
      parallax.forEach((el) => el.style.setProperty('--py', `${(-y * 0.12 * Number(el.dataset.parallax)).toFixed(1)}px`))
    }
    lastY = y
  }

  addEventListener(
    'scroll',
    () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    },
    { passive: true },
  )
  update()
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
function initTheme(): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const sync = (): void => {
    if (meta) meta.content = getComputedStyle(document.body).backgroundColor
  }
  sync()

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      const rect = button.getBoundingClientRect()
      root.style.setProperty('--vx', `${rect.left + rect.width / 2}px`)
      root.style.setProperty('--vy', `${rect.top + rect.height / 2}px`)

      // Colour transitions are suppressed for the swap so nothing smears.
      const apply = (): void => {
        root.classList.add('theme-switching')
        root.dataset.theme = next
        void root.offsetWidth
        sync()
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
      }

      if ('startViewTransition' in document && !reduced()) {
        root.classList.add('theme-reveal')
        const transition = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(apply)
        transition.finished.finally(() => root.classList.remove('theme-reveal'))
      } else {
        apply()
      }

      try {
        localStorage.setItem('theme', next)
      } catch {
        // Storage blocked: the choice lasts for this page only.
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------
function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const sheet = document.querySelector<HTMLElement>('[data-menu]')
  if (!toggle || !sheet) return

  const setOpen = (open: boolean): void => {
    sheet.hidden = !open
    toggle.setAttribute('aria-expanded', String(open))
    if (open) lenis?.stop()
    else lenis?.start()
    root.style.overflow = open ? 'hidden' : ''
  }

  toggle.addEventListener('click', () => setOpen(sheet.hidden))
  sheet.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !sheet.hidden) {
      setOpen(false)
      toggle.focus()
    }
  })
  matchMedia('(min-width: 961px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })
}

// ---------------------------------------------------------------------------
// Pointer play: mascot head, magnetic buttons
// ---------------------------------------------------------------------------
function initPointer(): void {
  if (!finePointer() || reduced()) return
  const mascots = Array.from(document.querySelectorAll<HTMLElement>('[data-mascot]'))
  let px = 0
  let py = 0
  let queued = false

  addEventListener(
    'pointermove',
    (event) => {
      px = event.clientX
      py = event.clientY
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        for (const mascot of mascots) {
          const rect = mascot.getBoundingClientRect()
          if (rect.bottom < 0 || rect.top > innerHeight) continue
          const dx = (px - (rect.left + rect.width / 2)) / innerWidth
          const dy = (py - (rect.top + rect.height / 2)) / innerHeight
          mascot.style.setProperty('--head-rot', `${(dx * 14).toFixed(2)}deg`)
          mascot.style.setProperty('--head-x', `${(dx * 18).toFixed(1)}px`)
          mascot.style.setProperty('--head-y', `${(dy * 12).toFixed(1)}px`)
        }
      })
    },
    { passive: true },
  )

  document.querySelectorAll<HTMLElement>('.btn-lg').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect()
      const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 10
      const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 8
      button.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`
    })
    button.addEventListener('pointerleave', () => {
      button.style.translate = ''
    })
  })
}

/** Endless loops pause while off screen. */
function initIdle(): void {
  const blocks = document.querySelectorAll<HTMLElement>('[data-marquee]')
  if (!blocks.length || !('IntersectionObserver' in window)) return
  const observer = new IntersectionObserver((entries) =>
    entries.forEach((entry) => entry.target.classList.toggle('is-idle', !entry.isIntersecting)),
  )
  blocks.forEach((block) => observer.observe(block))
}

/** The opening moment leaves the DOM once played. */
function initPreloader(): void {
  const preloader = document.querySelector('.preloader')
  if (!preloader) return
  if (root.dataset.intro === 'seen') preloader.remove()
  else setTimeout(() => preloader.remove(), 3200)
}

// ---------------------------------------------------------------------------
// Live signals
// ---------------------------------------------------------------------------
const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string)

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json() as Promise<T>
}

interface GithubUser {
  public_repos: number
  followers: number
  html_url: string
}
interface GithubRepo {
  name: string
  stargazers_count: number
}
interface Weather {
  current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number }
}

function initSignals(): void {
  const section = document.querySelector<HTMLElement>('[data-live-signals]')
  const i18nNode = section?.querySelector('[data-live-i18n]')
  if (!section || !i18nNode) return

  const i18n = JSON.parse(i18nNode.textContent ?? '{}')
  const lang = root.lang === 'en' ? 'en-GB' : 'vi-VN'
  const body = (name: string): HTMLElement | null => section.querySelector(`[data-live-card="${name}"] [data-live-body]`)
  const refresh = section.querySelector<HTMLButtonElement>('[data-live-refresh]')
  const wait = `<p class="wait">${escapeHtml(i18n.loading)}</p>`
  const fail = `<p class="wait">${escapeHtml(i18n.error)}</p>`
  const metric = (value: unknown, label: string): string => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`

  const clock = section.querySelector<HTMLElement>('[data-live-clock]')
  const date = section.querySelector<HTMLElement>('[data-live-date]')
  const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
  const dateFmt = new Intl.DateTimeFormat(lang, { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: 'numeric', month: 'long' })
  const tick = (): void => {
    const now = new Date()
    const [hh, mm, ss] = timeFmt.format(now).split(':')
    if (clock) clock.innerHTML = `${hh}:${mm}<span class="sec">:${ss}</span>`
    if (date) date.textContent = dateFmt.format(now)
  }
  tick()
  setInterval(tick, 1000)

  const load = async (): Promise<void> => {
    ;['github', 'weather'].forEach((name) => {
      const target = body(name)
      if (target) target.innerHTML = wait
    })
    refresh?.setAttribute('aria-busy', 'true')

    const [user, repos, weather] = await Promise.allSettled([
      fetchJson<GithubUser>('https://api.github.com/users/maiviet283'),
      fetchJson<GithubRepo[]>('https://api.github.com/users/maiviet283/repos?per_page=100&sort=updated'),
      fetchJson<Weather>(
        'https://api.open-meteo.com/v1/forecast?latitude=16.0471&longitude=108.2068&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FHo_Chi_Minh',
      ),
    ])

    const gh = body('github')
    if (gh) {
      if (user.status === 'fulfilled') {
        const list = repos.status === 'fulfilled' && Array.isArray(repos.value) ? repos.value : []
        const stars = list.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)
        const latest = list[0]
        gh.innerHTML = `
          <dl class="metrics">
            ${metric(user.value.public_repos, i18n.github.repos)}
            ${metric(user.value.followers, i18n.github.followers)}
            ${metric(stars, i18n.github.stars)}
          </dl>
          ${latest ? `<p class="line">${escapeHtml(i18n.github.latest)} → <strong>${escapeHtml(latest.name)}</strong></p>` : ''}
          <a class="link" href="${escapeHtml(user.value.html_url)}" target="_blank" rel="noreferrer">${escapeHtml(i18n.github.profile)} ↗</a>`
      } else {
        gh.innerHTML = fail
      }
    }

    const wx = body('weather')
    if (wx) {
      if (weather.status === 'fulfilled') {
        const current = weather.value.current
        const label = i18n.weather.codes[String(current.weather_code)] || i18n.weather.unknown
        wx.innerHTML = `
          <p class="big">${escapeHtml(label)}</p>
          <dl class="metrics">
            ${metric(`${Math.round(current.temperature_2m)}°`, i18n.weather.temperature)}
            ${metric(`${current.relative_humidity_2m}%`, i18n.weather.humidity)}
            ${metric(Math.round(current.wind_speed_10m), `${i18n.weather.wind} km/h`)}
          </dl>`
      } else {
        wx.innerHTML = fail
      }
    }
    refresh?.removeAttribute('aria-busy')
  }

  refresh?.addEventListener('click', () => void load())

  // Only hit the APIs once the console is near the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      void load()
    },
    { rootMargin: '400px 0px' },
  )
  observer.observe(section)
}

initScroll()
initPreloader()
initReveals()
initWipe()
initChrome()
initTheme()
initMenu()
initPointer()
initIdle()
initSignals()

export {}
