import { useEffect, useMemo, useState } from 'react'

const API_STATUS = {
  loading: 'loading',
  ready: 'ready',
  error: 'error',
}

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

function SignalLoader({ label }) {
  return (
    <div className="signal-loader" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  )
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

function LiveSignalsSection({ text, externalLinkProps }) {
  const [status, setStatus] = useState(API_STATUS.loading)
  const [pulse, setPulse] = useState(null)

  const loadPulse = async () => {
    setStatus(API_STATUS.loading)

    try {
      setPulse(await getLivePulse(text.api.time.fallback))
      setStatus(API_STATUS.ready)
    } catch {
      setPulse(null)
      setStatus(API_STATUS.error)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialPulse = async () => {
      try {
        const nextPulse = await getLivePulse(text.api.time.fallback)

        if (isMounted) {
          setPulse(nextPulse)
          setStatus(API_STATUS.ready)
        }
      } catch {
        if (isMounted) {
          setPulse(null)
          setStatus(API_STATUS.error)
        }
      }
    }

    loadInitialPulse()

    return () => {
      isMounted = false
    }
  }, [text.api.time.fallback])

  const weatherLabel = useMemo(() => {
    const weatherCode = pulse?.weather?.weather_code
    return text.api.weather.codes[String(weatherCode)] || text.api.weather.unknown
  }, [pulse?.weather?.weather_code, text.api.weather.codes, text.api.weather.unknown])

  return (
    <section className="section live-section" aria-live="polite">
      <div className="section-heading reveal">
        <p className="eyebrow">{text.api.eyebrow}</p>
        <h2>{text.api.title}</h2>
        <p>{text.api.body}</p>
      </div>

      <div className="live-grid">
        <article className="live-card reveal">
          <div className="live-card-head">
            <p>{text.api.github.title}</p>
            <button type="button" onClick={loadPulse}>
              {text.api.refresh}
            </button>
          </div>
          {status === API_STATUS.loading && <SignalLoader label={text.api.loading} />}
          {status === API_STATUS.error && <strong>{text.api.error}</strong>}
          {status === API_STATUS.ready && pulse?.github && (
            <>
              <div className="live-metrics">
                <span>
                  <strong>{pulse.github.repos}</strong>
                  {text.api.github.repos}
                </span>
                <span>
                  <strong>{pulse.github.followers}</strong>
                  {text.api.github.followers}
                </span>
                <span>
                  <strong>{pulse.github.stars}</strong>
                  {text.api.github.stars}
                </span>
              </div>
              <p>
                {text.api.github.latest}: <strong>{pulse.github.latest}</strong>
              </p>
              <a href={pulse.github.profileUrl} {...externalLinkProps}>
                {text.api.github.profile}
              </a>
            </>
          )}
        </article>

        <article className="live-card reveal">
          <div className="live-card-head">
            <p>{text.api.weather.title}</p>
          </div>
          {status === API_STATUS.loading && <SignalLoader label={text.api.loading} />}
          {status === API_STATUS.error && <strong>{text.api.error}</strong>}
          {status === API_STATUS.ready && pulse?.weather && (
            <>
              <strong className="live-big">{weatherLabel}</strong>
              <div className="live-metrics">
                <span>
                  <strong>{Math.round(pulse.weather.temperature_2m)}°C</strong>
                  {text.api.weather.temperature}
                </span>
                <span>
                  <strong>{pulse.weather.relative_humidity_2m}%</strong>
                  {text.api.weather.humidity}
                </span>
                <span>
                  <strong>{Math.round(pulse.weather.wind_speed_10m)} km/h</strong>
                  {text.api.weather.wind}
                </span>
              </div>
            </>
          )}
        </article>

        <article className="live-card reveal">
          <div className="live-card-head">
            <p>{text.api.time.title}</p>
          </div>
          {status === API_STATUS.loading && <SignalLoader label={text.api.loading} />}
          {status === API_STATUS.error && <strong>{text.api.error}</strong>}
          {status === API_STATUS.ready && pulse?.time && (
            <>
              <strong className="live-clock">{pulse.time.value}</strong>
              <p>{text.api.time.label}</p>
              <small>
                {text.api.time.zone} / {pulse.time.source}
              </small>
            </>
          )}
        </article>
      </div>
    </section>
  )
}

export default LiveSignalsSection
