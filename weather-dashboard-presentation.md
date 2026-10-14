# Weather Observatory — 5-slide presentation outline

Visual direction: use the website's deep ink-blue canvas, warm sunrise accent, fine observatory-style labels, pale atmospheric lines, and restrained cyan for rain/snow conditions. The CSS-designed hero card and weather icon can serve as the representative visual; label it as a concept visual if captured screenshots are unavailable.

## Slide 1 — Weather Observatory
**Look closer at the sky.** A little more context for whatever the day brings.

Visual: dark ink-blue title slide with the diamond observatory mark, a large warm-accent temperature, and a minimal line-art partly-cloudy icon. This is a representative visual, not a captured live screenshot.

## Slide 2 — The idea
Weather is more useful when it is quick to read and easy to put in context. This dashboard is for people planning a commute, a day outdoors, or simply what to wear. It brings local conditions and the next week into one calm, readable view.

## Slide 3 — The experience
- Search for a city and select a geocoded location.
- Scan current temperature, feels-like, high/low, local observation time, and conditions.
- Check humidity, wind and direction, visibility, UV, and daylight.
- Explore the next 24 hours and a seven-day temperature range.
- Switch Celsius/Fahrenheit; layouts stack for phone screens.

Visual: annotate a compact recreation of the current-weather card, location search, hourly strip, and weekly range rows in the website palette.

## Slide 4 — How it works
- React function components and hooks power the interface.
- Open-Meteo Geocoding resolves city names to coordinates.
- Open-Meteo Forecast provides current, hourly, and daily values without an API key.
- Vite builds the static production bundle; Vercel can deploy it with the standard Vite build and `dist` output.

## Slide 5 — Next steps
**Implemented:** live city search, current observations, weather-code labels/icons, hourly and seven-day forecasts, unit conversion, loading/error/retry states, responsive layout.

**Limitations:** initial city is a fallback; search and forecast require network access; no saved places or severe-weather alerts.

**Next:** favorite locations, precipitation radar, richer accessibility testing, and optional weather alerts.
