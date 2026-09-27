# Trivandrum AI Weather

AI-driven weather prediction for Thiruvananthapuram (Trivandrum) with an interactive map where you can pin any location and get its forecast.

- Live weather and forecast data from [Open-Meteo](https://open-meteo.com) (free, no key needed)
- Map tiles from OpenStreetMap via Leaflet
- AI prediction summary via the Vercel AI SDK + AI Gateway

## Requirements

- [Node.js](https://nodejs.org) 20 or newer
- [pnpm](https://pnpm.io) (run `npm install -g pnpm` once), or use npm
- [VS Code](https://code.visualstudio.com)

## Run it in VS Code

1. Unzip the downloaded folder and open it in VS Code (**File > Open Folder...**).
2. Open the terminal in VS Code (**Terminal > New Terminal**).
3. Install dependencies:

   ```bash
   pnpm install
   ```

   (or `npm install`)

4. Enable the AI prediction (optional). Copy `.env.example` to a new file named `.env.local` and paste your AI Gateway key:

   ```bash
   AI_GATEWAY_API_KEY=your_key_here
   ```

   Get a key at https://vercel.com/ai-gateway. Without a key, the map, pins, and forecasts still work; only the AI summary card shows an error.

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open http://localhost:3000 in your browser.

## Production build

```bash
pnpm build
pnpm start
```

## Project structure

```
app/
  page.tsx              Home page
  api/weather/          Forecast for a coordinate (Open-Meteo)
  api/snapshots/        Current conditions for all pinned places
  api/predict/          AI prediction endpoint
components/             Map, forecast, hourly strip, AI card, pin list
lib/                    Weather helpers, preset Trivandrum locations, AI prompt
```
