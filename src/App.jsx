import { useEffect, useMemo, useRef, useState } from 'react'
import ContactSection from './components/ContactSection'
import FamilyQuotesSection from './components/FamilyQuotesSection'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import LiveSignalsSection from './components/LiveSignalsSection'
import ProjectsSection from './components/ProjectsSection'
import SiteFooter from './components/SiteFooter'
import StackSection from './components/StackSection'
import StatsStrip from './components/StatsStrip'
import VietDonSection from './components/VietDonSection'
import WorkSection from './components/WorkSection'
import avatar from './data/images/avatar.png'
import vietDonBanner from './data/images/banner_vietdon.png'
import myFamily from './data/images/myfamily.jpg'
import myFamily2 from './data/images/myfamily2.png'
import en from './localet/en.json'
import vi from './localet/vi.json'
import './theme.css'
import './App.css'

const locales = { vi, en }
const vietDonLogo = '/logo.png'
const resume = '/MAI_QUOC_VIET.pdf'

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'vi')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [isThemeSwitching, setIsThemeSwitching] = useState(false)
  const themeSwitchTimerRef = useRef(null)
  const text = locales[language]
  const nextLanguage = language === 'vi' ? 'en' : 'vi'

  useEffect(() => {
    document.documentElement.lang = language
    document.title = text.meta.pageTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', text.meta.description)
    localStorage.setItem('language', language)
  }, [language, text])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
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

    return () => observer.disconnect()
  }, [language])

  const externalLinkProps = useMemo(
    () => ({
      target: '_blank',
      rel: 'noreferrer',
    }),
    [],
  )

  const switchTheme = () => {
    setIsThemeSwitching(true)
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))

    if (themeSwitchTimerRef.current) {
      window.clearTimeout(themeSwitchTimerRef.current)
    }

    themeSwitchTimerRef.current = window.setTimeout(() => {
      setIsThemeSwitching(false)
      themeSwitchTimerRef.current = null
    }, 620)
  }

  useEffect(() => () => {
    if (themeSwitchTimerRef.current) {
      window.clearTimeout(themeSwitchTimerRef.current)
    }
  }, [])

  return (
    <main className={`site-shell${isThemeSwitching ? ' theme-is-switching' : ''}`}>
      <Header
        text={text}
        theme={theme}
        logo={vietDonLogo}
        onLanguageChange={() => setLanguage(nextLanguage)}
        onThemeChange={switchTheme}
      />
      <HeroSection
        text={text}
        avatar={avatar}
        resume={resume}
        externalLinkProps={externalLinkProps}
      />
      <StatsStrip text={text} />
      <FamilyQuotesSection text={text} images={[myFamily, myFamily2]} />
      <LiveSignalsSection text={text} externalLinkProps={externalLinkProps} />
      <VietDonSection text={text} banner={vietDonBanner} logo={vietDonLogo} />
      <StackSection text={text} />
      <WorkSection text={text} externalLinkProps={externalLinkProps} />
      <ProjectsSection text={text} externalLinkProps={externalLinkProps} />
      <ContactSection text={text} externalLinkProps={externalLinkProps} />
      <SiteFooter text={text} />
    </main>
  )
}

export default App
