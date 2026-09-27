import { CloudSun } from 'lucide-react'
import { WeatherDashboard } from '@/components/weather-dashboard'

export default function Page() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-accent">
            <CloudSun className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold leading-tight">Trivandrum AI Weather</h1>
            <p className="text-xs text-muted-foreground">
              {"Live data + AI predictions across Thiruvananthapuram"}
            </p>
          </div>
        </div>
        <p className="hidden rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:block">
          Data: Open-Meteo · Forecast AI via Vercel AI Gateway
        </p>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 pb-6 md:px-6">
        <WeatherDashboard />
      </main>
    </div>
  )
}
