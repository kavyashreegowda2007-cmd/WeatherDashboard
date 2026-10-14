import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const FALLBACK_LOCATION = {
  name: 'Hyderabad',
  admin1: 'Telangana',
  country: 'India',
  latitude: 17.385,
  longitude: 78.4867,
  timezone: 'Asia/Kolkata',
}

const WEATHER = {
  0: ['Clear sky', 'sun'],
  1: ['Mainly clear', 'sun'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Depositing rime fog', 'fog'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Heavy drizzle', 'rain'],
  56: ['Freezing drizzle', 'rain'],
  57: ['Freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Heavy showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm & hail', 'storm'],
  99: ['Thunderstorm & hail', 'storm'],
}

function describeWeather(code) {
  return WEATHER[code] || ['Conditions unavailable', 'cloud']
}

function weatherIconKind(code, isDay) {
  const kind = describeWeather(code)[1]
  if (isDay !== 0) return kind
  if (kind === 'sun') return 'moon'
  if (kind === 'partly') return 'night-partly'
  return kind
}

function WeatherIcon({ kind = 'partly', className = '' }) {
  const shared = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg className={`weather-icon ${className}`} viewBox="0 0 48 48" aria-hidden="true" {...shared}>
      {kind === 'sun' && <><circle cx="24" cy="24" r="8" /><path d="M24 4v5m0 30v5M4 24h5m30 0h5M9.9 9.9l3.5 3.5m21.2 21.2 3.5 3.5m0-28.2-3.5 3.5M13.4 34.6l-3.5 3.5" /></>}
      {kind === 'moon' && <path d="M34.5 30.5A16 16 0 0 1 17.5 9.3 16 16 0 1 0 38.7 30a15.8 15.8 0 0 1-4.2.5Z" />}
      {kind === 'partly' && <><circle cx="18" cy="17" r="6" /><path d="M18 5v2m0 20v2M6 17h2m20 0h2m-20-8 1.5 1.5m13 13 1.5 1.5m0-15L24.5 11M10 25.5l1.5-1.5" /><path d="M15 36h20a7 7 0 0 0 .5-14 10 10 0 0 0-19-1.5A8 8 0 0 0 15 36Z" /></>}
      {kind === 'night-partly' && <><path d="M22 8a11 11 0 0 0 14 14A13 13 0 1 1 22 8Z" /><path d="M14 37h21a7 7 0 0 0 .4-14A10 10 0 0 0 16 21a8 8 0 0 0-2 16Z" /></>}
      {kind === 'cloud' && <path d="M13 36h22a8 8 0 0 0 .4-16A11 11 0 0 0 14 18a9 9 0 0 0-1 18Z" />}
      {kind === 'fog' && <><path d="M14 27h20a7 7 0 0 0 0-14 9 9 0 0 0-17-1.5A7 7 0 0 0 14 27Z" /><path d="M8 33h32M12 39h25" /></>}
      {kind === 'rain' && <><path d="M13 29h22a7 7 0 0 0 .3-14A10 10 0 0 0 16 13a8 8 0 0 0-3 16Z" /><path d="m17 34-2 5m11-5-2 5m11-5-2 5" /></>}
      {kind === 'snow' && <><path d="M13 27h22a7 7 0 0 0 .3-14A10 10 0 0 0 16 11a8 8 0 0 0-3 16Z" /><path d="M17 34h.01M25 38h.01M33 33h.01" /></>}
      {kind === 'storm' && <><path d="M13 27h22a7 7 0 0 0 .3-14A10 10 0 0 0 16 11a8 8 0 0 0-3 16Z" /><path d="m26 29-6 9h6l-3 7 9-11h-6l3-5" /></>}
    </svg>
  )
}

function formatClock(value, _timezone, options = { hour: 'numeric', minute: '2-digit' }) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(new Date(`${value}Z`))
  } catch {
    return '—'
  }
}

function dateFromApi(value) {
  return value ? new Date(`${value}T12:00:00Z`) : new Date()
}

function temperature(celsius, unit) {
  if (!Number.isFinite(celsius)) return '—'
  return Math.round(unit === 'F' ? (celsius * 9) / 5 + 32 : celsius)
}

function direction(degrees) {
  if (!Number.isFinite(degrees)) return '—'
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8]
}

function Metric({ label, value, detail, icon }) {
  return (
    <div className="metric">
      <span className="metric-symbol" aria-hidden="true">{icon}</span>
      <div className="metric-copy">
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  )
}

function App() {
  const [location, setLocation] = useState(FALLBACK_LOCATION)
  const [weatherLocation, setWeatherLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [unit, setUnit] = useState('C')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [activeResult, setActiveResult] = useState(-1)
  const shellRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorRippleRef = useRef(null)
  const weatherRequestId = useRef(0)
  const weatherAbortController = useRef(null)
  const searchRequestId = useRef(0)
  const searchAbortController = useRef(null)

  const loadWeather = useCallback(async (place) => {
    const requestId = ++weatherRequestId.current
    weatherAbortController.current?.abort()
    const controller = new AbortController()
    weatherAbortController.current = controller
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        latitude: place.latitude,
        longitude: place.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index',
        hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
        timezone: place.timezone || 'auto',
        forecast_days: '7',
        wind_speed_unit: 'kmh',
      })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error(`Weather service returned ${response.status}. Please try again.`)
      const data = await response.json()
      if (!data.current || !data.daily || !data.hourly) throw new Error('Weather data was incomplete. Please try again.')
      if (requestId !== weatherRequestId.current) return
      const resolvedPlace = { ...place, timezone: data.timezone || place.timezone }
      setWeather(data)
      setWeatherLocation(resolvedPlace)
      setLocation(resolvedPlace)
      setUpdatedAt(new Date())
    } catch (cause) {
      if (requestId === weatherRequestId.current && !controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Could not load weather. Please try again.')
      }
    } finally {
      if (requestId === weatherRequestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeather(FALLBACK_LOCATION)
    return () => {
      weatherRequestId.current += 1
      weatherAbortController.current?.abort()
    }
  }, [loadWeather])

  const searchLocations = async (event) => {
    event.preventDefault()
    const term = query.trim()
    const requestId = ++searchRequestId.current
    searchAbortController.current?.abort()
    setActiveResult(-1)
    if (term.length < 2) {
      setSearchError('Enter at least two characters to search.')
      setResults([])
      setSearching(false)
      setSearchOpen(true)
      return
    }
    const controller = new AbortController()
    searchAbortController.current = controller
    setSearching(true)
    setSearchError('')
    setResults([])
    setSearchOpen(true)
    try {
      const params = new URLSearchParams({ name: term, count: '6', language: 'en', format: 'json' })
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error(`Location search returned ${response.status}.`)
      const data = await response.json()
      if (requestId !== searchRequestId.current) return
      setResults(data.results || [])
      if (!data.results?.length) setSearchError(`No places found for “${term}”. Try another city.`)
    } catch (cause) {
      if (requestId === searchRequestId.current && !controller.signal.aborted) {
        setSearchError(cause instanceof Error ? cause.message : 'Could not search locations.')
      }
    } finally {
      if (requestId === searchRequestId.current) setSearching(false)
    }
  }

  const selectLocation = (place) => {
    setLocation(place)
    setQuery('')
    setResults([])
    setSearchOpen(false)
    setSearchError('')
    setActiveResult(-1)
    loadWeather(place)
  }

  const handleSearchChange = (event) => {
    searchRequestId.current += 1
    searchAbortController.current?.abort()
    setSearching(false)
    setResults([])
    setSearchError('')
    setSearchOpen(false)
    setActiveResult(-1)
    setQuery(event.target.value)
  }

  const handleSearchKeyDown = (event) => {
    if (!searchOpen || !results.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveResult((currentIndex) => (currentIndex + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveResult((currentIndex) => (currentIndex <= 0 ? results.length - 1 : currentIndex - 1))
    } else if (event.key === 'Enter' && activeResult >= 0) {
      event.preventDefault()
      selectLocation(results[activeResult])
    }
  }

  useEffect(() => () => {
    searchRequestId.current += 1
    searchAbortController.current?.abort()
  }, [])

  useEffect(() => {
    const shell = shellRef.current
    if (!shell || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const sections = shell.querySelectorAll('[data-reveal]')
    if (!sections.length) return undefined

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -32px 0px', threshold: 0.08 })

    shell.classList.add('reveal-ready')
    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
      shell.classList.remove('reveal-ready')
      sections.forEach((section) => section.classList.remove('is-visible'))
    }
  }, [])

  useEffect(() => {
    const shell = shellRef.current
    const cursor = cursorRef.current
    const ripple = cursorRippleRef.current
    if (!shell || !cursor || !ripple) return undefined

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let pulseFrame = 0
    let pulseTimeout = 0
    let pointerPosition = null

    const updateAvailability = () => {
      const enabled = finePointer.matches && !reducedMotion.matches
      shell.classList.toggle('cursor-enabled', enabled)
      if (!enabled) cursor.removeAttribute('data-visible')
    }
    const handlePointerMove = (event) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return
      pointerPosition = { x: event.clientX, y: event.clientY }
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        if (!pointerPosition) return
        cursor.style.transform = `translate3d(${pointerPosition.x}px, ${pointerPosition.y}px, 0) translate(-50%, -50%)`
        cursor.setAttribute('data-visible', 'true')
      })
    }
    const handleClick = (event) => {
      if (!finePointer.matches || reducedMotion.matches || event.detail === 0 || !(event.target instanceof Element)) return
      if (!event.target.closest('button, a, input[type="submit"], [role="option"]')) return
      if (pulseFrame) window.cancelAnimationFrame(pulseFrame)
      if (pulseTimeout) window.clearTimeout(pulseTimeout)
      ripple.classList.remove('is-pulsing')
      pulseFrame = window.requestAnimationFrame(() => {
        pulseFrame = 0
        ripple.classList.add('is-pulsing')
        pulseTimeout = window.setTimeout(() => {
          ripple.classList.remove('is-pulsing')
          pulseTimeout = 0
        }, 500)
      })
    }
    const handlePointerLeave = (event) => {
      if (event.relatedTarget === null) cursor.removeAttribute('data-visible')
    }

    updateAvailability()
    finePointer.addEventListener('change', updateAvailability)
    reducedMotion.addEventListener('change', updateAvailability)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('click', handleClick)
    window.addEventListener('pointerout', handlePointerLeave)

    return () => {
      finePointer.removeEventListener('change', updateAvailability)
      reducedMotion.removeEventListener('change', updateAvailability)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('pointerout', handlePointerLeave)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      if (pulseFrame) window.cancelAnimationFrame(pulseFrame)
      if (pulseTimeout) window.clearTimeout(pulseTimeout)
      shell.classList.remove('cursor-enabled')
    }
  }, [])

  const current = weather?.current
  const daily = weather?.daily
  const displayedLocation = weatherLocation || location
  const hourlySlots = useMemo(() => {
    if (!weather?.hourly?.time) return []
    const times = weather.hourly.time
    const start = times.findIndex((time) => time > weather.current.time)
    const future = times.slice(start < 0 ? 0 : start, (start < 0 ? 0 : start) + 23)
      .map((time, offset) => ({ time, index: (start < 0 ? 0 : start) + offset }))
    return [{ time: weather.current.time, now: true }, ...future]
  }, [weather])
  const forecastRange = useMemo(() => {
    if (!daily?.temperature_2m_max) return [0, 1]
    return [
      Math.min(...daily.temperature_2m_min.filter(Number.isFinite)),
      Math.max(...daily.temperature_2m_max.filter(Number.isFinite)),
    ]
  }, [daily])
  const condition = describeWeather(current?.weather_code)
  const currentIconKind = weatherIconKind(current?.weather_code, current?.is_day)
  const isWarm = Number.isFinite(current?.temperature_2m) && current.temperature_2m >= 25
  const isInitialLoading = loading && !weather
  const fetchingTime = updatedAt && weatherLocation
    ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: displayedLocation.timezone }).format(updatedAt)
    : '—'

  return (
    <main ref={shellRef} className={`app-shell weather-${condition[1]} ${isWarm ? 'warm' : ''}`}>
      <div className="ambient-glow" aria-hidden="true" />
      <div className="observatory-cursor" ref={cursorRef} aria-hidden="true">
        <span className="cursor-reticle"><i /><i /><i /><i /></span>
        <span className="cursor-ripple" ref={cursorRippleRef} />
      </div>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Weather Observatory home">
          <span className="brand-mark"><span /></span>
          <span>FIELDNOTES <b>/</b> WEATHER</span>
        </a>
        <div className="topbar-right">
          <span className="live-indicator"><i /> {loading ? 'UPDATING WEATHER' : 'WEATHER DATA'}</span>
          <div className="unit-switch" role="group" aria-label="Temperature units">
            <button className={unit === 'C' ? 'selected' : ''} onClick={() => setUnit('C')} aria-pressed={unit === 'C'}>°C</button>
            <button className={unit === 'F' ? 'selected' : ''} onClick={() => setUnit('F')} aria-pressed={unit === 'F'}>°F</button>
          </div>
        </div>
      </header>

      <section className="dashboard">
        <div className="intro-row" data-reveal>
          <div>
            <p className="eyebrow">YOUR PERSONAL WEATHER OBSERVATORY <span>—</span> 01</p>
            <h1>Look closer<br className="mobile-break" /> at the sky.</h1>
          </div>
          <p className="intro-note">A little more context for<br />whatever the day brings.</p>
        </div>

        <div
          className="search-wrap"
          data-reveal
          onKeyDown={(event) => {
            if (event.key === 'Escape' && searchOpen) {
              event.preventDefault()
              setSearchOpen(false)
              setActiveResult(-1)
            }
          }}
        >
          <form className="search-form" onSubmit={searchLocations} role="search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
            <label className="sr-only" htmlFor="location-search">Search for a city</label>
            <input
              id="location-search"
              type="search"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => (results.length || searching || searchError) && setSearchOpen(true)}
              placeholder="Find a city..."
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={searchOpen}
              aria-controls={searchOpen ? 'location-results' : undefined}
              aria-activedescendant={activeResult >= 0 ? `location-option-${activeResult}` : undefined}
              aria-describedby="location-search-status"
              aria-invalid={Boolean(searchError)}
            />
            <button className="search-button" type="submit" aria-label={searching ? 'Search locations again' : 'Search locations'}>{searching ? <span className="spinner" /> : 'SEARCH'}</button>
          </form>
          {searchOpen && (results.length > 0 || searching || searchError) && (
            <div className="search-popover">
              {searching && <p className="search-message">Searching the atlas<span className="loading-dots">...</span></p>}
              {!searching && searchError && <p className="search-message search-error">{searchError}</p>}
              {!searching && results.length > 0 && (
                <div id="location-results" className="search-results" role="listbox" aria-label="City suggestions">
                  {results.map((place, index) => (
                    <div
                      id={`location-option-${index}`}
                      className={`result-item ${activeResult === index ? 'active' : ''}`}
                      key={`${place.id}-${place.latitude}`}
                      role="option"
                      aria-selected={activeResult === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveResult(index)}
                      onClick={() => selectLocation(place)}
                    >
                      <span className="result-pin" aria-hidden="true">↗</span>
                      <span><strong>{place.name}</strong><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small></span>
                      <span className="result-coords">{place.latitude.toFixed(1)}° · {place.longitude.toFixed(1)}°</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="popover-close" type="button" onClick={() => { setSearchOpen(false); setActiveResult(-1) }}>Close suggestions</button>
            </div>
          )}
          <span className="sr-only" id="location-search-status" role="status" aria-live="polite">
            {searching ? 'Searching locations.' : searchError || (results.length ? `${results.length} city suggestions available.` : '')}
          </span>
        </div>

        {loading && weather && (
          <p className="weather-update" role="status">
            Updating weather for {location.name}. Showing the last successful data for {weatherLocation.name}.
          </p>
        )}
        {error && weather && (
          <p className="weather-update weather-update-error" role="alert">
            Could not update {location.name}: {error} The dashboard still shows the last successful data for {weatherLocation.name}.{' '}
            <button className="inline-retry" onClick={() => loadWeather(location)}>Try again</button>
          </p>
        )}

        {error && !weather ? (
          <section className="error-panel" role="alert" data-reveal>
            <span className="error-icon">!</span>
            <div><h2>We lost the signal.</h2><p>{error}</p><button className="retry-button" onClick={() => loadWeather(location)}>Try again <span>↻</span></button></div>
          </section>
        ) : (
          <>
            <section className="weather-grid" aria-label="Current weather">
              <article className="current-card" data-reveal>
                <div className="card-kicker"><span>RIGHT NOW</span><span className="card-index">OBS. 001</span></div>
                {isInitialLoading ? (
                  <div className="loading-current" aria-label="Loading current weather"><div className="skeleton skeleton-city" /><div className="skeleton skeleton-temp" /><div className="skeleton skeleton-line" /></div>
                ) : (
                  <>
                    <div className="place-heading">
                      <div><h2>{displayedLocation.name}</h2><p>{[displayedLocation.admin1, displayedLocation.country].filter(Boolean).join(', ')}</p></div>
                      <span className="location-cross" aria-hidden="true">⌖</span>
                    </div>
                    <div className="current-main">
                      <div className="temperature-wrap">
                        <p className="current-condition"><span className="condition-dot" /> {condition[0]}</p>
                        <div className="temperature">{temperature(current?.temperature_2m, unit)}<span>°{unit}</span></div>
                        <p className="feels-like">Feels like {temperature(current?.apparent_temperature, unit)}° <span>·</span> H:{temperature(daily?.temperature_2m_max?.[0], unit)}° L:{temperature(daily?.temperature_2m_min?.[0], unit)}°</p>
                      </div>
                      <div className="hero-weather-icon"><WeatherIcon kind={currentIconKind} className={`weather-${currentIconKind}`} /></div>
                    </div>
                    <div className="current-footer">
                      <span><span className="clock-icon">◷</span> OBSERVED <b>{formatClock(current?.time, displayedLocation.timezone)}</b></span>
                      <span>PAGE FETCHED <b>{fetchingTime}</b></span>
                    </div>
                  </>
                )}
              </article>

              <article className="conditions-card" data-reveal>
                <div className="section-heading"><div><p className="eyebrow">THE ATMOSPHERE</p><h2>Conditions</h2></div><span className="section-symbol">✳</span></div>
                {isInitialLoading ? <div className="metrics-loading"><div /><div /><div /><div /></div> : (
                  <div className="metrics-grid">
                    <Metric label="HUMIDITY" value={Number.isFinite(current?.relative_humidity_2m) ? `${current.relative_humidity_2m}%` : '—'} detail="relative" icon="◌" />
                    <Metric label="WIND" value={Number.isFinite(current?.wind_speed_10m) ? `${Math.round(current.wind_speed_10m)} km/h` : '—'} detail={direction(current?.wind_direction_10m) !== '—' ? `${direction(current?.wind_direction_10m)} direction` : 'direction unavailable'} icon="↗" />
                    <Metric label="VISIBILITY" value={Number.isFinite(current?.visibility) ? `${(current.visibility / 1000).toFixed(1)} km` : '—'} detail="horizontal range" icon="◎" />
                    <Metric label="UV INDEX" value={Number.isFinite(current?.uv_index) ? current.uv_index.toFixed(1) : '—'} detail={Number.isFinite(current?.uv_index) ? current.uv_index < 3 ? 'low exposure' : current.uv_index < 6 ? 'moderate exposure' : 'high exposure' : 'not available'} icon="☼" />
                  </div>
                )}
                <div className="sunline">
                  <span>☀ &nbsp; DAYLIGHT</span>
                  <div className="sun-track"><i /></div>
                  <span>{daily?.sunrise?.[0] ? formatClock(daily.sunrise[0], displayedLocation.timezone) : '—'} <b>→</b> {daily?.sunset?.[0] ? formatClock(daily.sunset[0], displayedLocation.timezone) : '—'}</span>
                </div>
              </article>
            </section>

            <section className="hourly-card" aria-labelledby="hourly-heading" data-reveal>
              <div className="section-heading forecast-heading">
                <div><p className="eyebrow">A CLOSER LOOK</p><h2 id="hourly-heading">The next 24 hours</h2></div>
                <span className="forecast-unit">TEMPERATURE · °{unit}</span>
              </div>
              {isInitialLoading ? <p className="forecast-loading">Gathering hourly observations<span className="loading-dots">...</span></p> : (
                <div className="hourly-scroll">
                  <div className="hourly-list">
                    {hourlySlots.map((slot, item) => {
                      const index = slot.index
                      const code = slot.now ? current?.weather_code : weather.hourly.weather_code?.[index]
                      const isDay = slot.now ? current?.is_day : weather.hourly.is_day?.[index]
                      const iconKind = weatherIconKind(code, isDay)
                      const chance = slot.now ? undefined : weather.hourly.precipitation_probability?.[index]
                      return (
                        <div className={`hour-item ${slot.now ? 'hour-now' : ''}`} key={slot.time}>
                          <span className="hour-time">{slot.now ? 'NOW' : formatClock(slot.time, displayedLocation.timezone, { hour: 'numeric' })}</span>
                          <WeatherIcon kind={iconKind} className={`hour-icon weather-${iconKind}`} />
                          <strong>{temperature(slot.now ? current?.temperature_2m : weather.hourly.temperature_2m?.[index], unit)}°</strong>
                          {Number.isFinite(chance) && chance > 10 ? <small className="rain-chance">↘ {chance}%</small> : <small className="rain-chance muted">—</small>}
                        </div>
                      )
                    })}
                    {!hourlySlots.length && <p className="forecast-loading">Hourly observations are not available right now.</p>}
                  </div>
                </div>
              )}
            </section>

            <section className="weekly-section" aria-labelledby="weekly-heading" data-reveal>
              <div className="section-heading forecast-heading">
                <div><p className="eyebrow">THE LONG VIEW</p><h2 id="weekly-heading">Seven day outlook</h2></div>
                <span className="forecast-unit">DAILY RANGE · °{unit}</span>
              </div>
              {isInitialLoading ? <p className="forecast-loading">Gathering the week ahead<span className="loading-dots">...</span></p> : (
                <div className="weekly-list">
                  {daily?.time?.map((day, index) => {
                    const [label, kind] = describeWeather(daily.weather_code?.[index])
                    const low = daily.temperature_2m_min?.[index]
                    const high = daily.temperature_2m_max?.[index]
                    const spread = forecastRange[1] - forecastRange[0] || 1
                    const left = Number.isFinite(low) ? ((low - forecastRange[0]) / spread) * 100 : 0
                    const width = Number.isFinite(high - low) ? Math.max(8, ((high - low) / spread) * 100) : 0
                    const date = dateFromApi(day)
                    return (
                      <div className="day-row" key={day}>
                        <span className="day-name">{index === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</span>
                        <WeatherIcon kind={kind} className="day-icon" />
                        <span className="day-condition">{label}</span>
                        <span className="day-low">{temperature(low, unit)}°</span>
                        <div className="range-track" aria-label={`Low ${temperature(low, unit)} degrees, high ${temperature(high, unit)} degrees`}>
                          <i style={{ left: `${left}%`, width: `${width}%` }} />
                        </div>
                        <span className="day-high">{temperature(high, unit)}°</span>
                      </div>
                    )
                  })}
                  {!daily?.time?.length && <p className="forecast-loading">Daily outlook is not available right now.</p>}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="page-footer" data-reveal>
          <span>FIELDNOTES <b>/</b> WEATHER</span>
          <span>WEATHER DATA BY <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">OPEN-METEO</a></span>
          <span>MADE FOR THE MOMENT <i>✳</i></span>
        </footer>
      </section>
    </main>
  )
}

export default App
