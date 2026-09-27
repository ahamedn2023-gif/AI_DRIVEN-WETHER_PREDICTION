import { Droplets } from 'lucide-react'
import { describeWeatherCode, type DailyForecast } from '@/lib/weather'
import { WeatherIcon } from './weather-icon'

function dayLabel(date: string, index: number) {
  if (index === 0) return 'Today'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })
}

export function ForecastList({ daily }: { daily: DailyForecast[] }) {
  const min = Math.min(...daily.map((d) => d.tempMin))
  const max = Math.max(...daily.map((d) => d.tempMax))
  const range = Math.max(max - min, 1)

  return (
    <section aria-labelledby="forecast-heading" className="rounded-2xl border bg-card p-4">
      <h3 id="forecast-heading" className="mb-2 font-heading text-sm font-semibold">
        7-day forecast
      </h3>
      <ul className="divide-y">
        {daily.map((d, i) => (
          <li key={d.date} className="grid grid-cols-[3rem_1.5rem_3rem_1fr] items-center gap-3 py-2 text-sm">
            <span className="font-medium">{dayLabel(d.date, i)}</span>
            <WeatherIcon code={d.weatherCode} className="size-5 text-primary" />
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
              <Droplets className="size-3" aria-hidden="true" />
              {d.precipitationProbability}%
            </span>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="w-7 text-right text-muted-foreground">{Math.round(d.tempMin)}°</span>
              <div className="relative h-1.5 flex-1 rounded-full bg-secondary" aria-hidden="true">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{
                    left: `${((d.tempMin - min) / range) * 100}%`,
                    right: `${100 - ((d.tempMax - min) / range) * 100}%`,
                  }}
                />
              </div>
              <span className="w-7 font-medium">{Math.round(d.tempMax)}°</span>
            </div>
            <span className="sr-only">{describeWeatherCode(d.weatherCode)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
