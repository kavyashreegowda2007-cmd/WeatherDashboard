# WeatherDashboard — Weather Observatory

A responsive React weather dashboard with current conditions, location search, an hourly outlook, and a seven-day forecast. Weather data is provided by the free Open-Meteo APIs; no API key is required.

## Run locally

1. Install Node.js 18 or newer.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the local URL printed by Vite.

Create a production build with `npm run build`. Preview it locally with `npm run preview`.

## Data sources

- City search: [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/v1/search)
- Current conditions and forecasts: [Open-Meteo Forecast API](https://api.open-meteo.com/v1/forecast)

The dashboard uses the returned local timezone, provider observation time, page fetch time, current conditions, hourly temperature / precipitation probability / weather code, and seven days of daily highs and lows. Temperature values are converted for display between Celsius and Fahrenheit; wind is displayed consistently in km/h. An initial Hyderabad location is used only until the visitor searches for a place.

## Deploy to Vercel

Import the project repository into Vercel and keep the detected Vite settings, or enter:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No environment variables are required. Vercel's standard Vite support is sufficient; no custom rewrite or server configuration is needed.
