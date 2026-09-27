import { Droplets, Gauge, Thermometer, Wind } from 'lucide-react'
import type { Pin } from '@/lib/locations'
import { compassDirection, describeWeatherCode, type WeatherReport } from '@/lib/weather'
import { WeatherIcon } from './weather-icon'

export function CurrentConditions({ pin, report }: { pin: Pin; report: WeatherReport }) {
  const c = report.current
  const today = report.daily[0]
  const stats = [
    { icon: Thermometer, label: 'Feels like', value: `${Math.round(c.feelsLike)}°C` },
    { icon: Droplets, label: 'Humidity', value: `${c.humidity}%` },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(c.windSpeed)} km/h ${compassDirection(c.windDirection)}`,
    },
    { icon: Gauge, label: 'Pressure', value: `${Math.round(c.pressure)} hPa` },
  ]

  return (
    <section aria-labelledby="current-heading" className="rounded-2xl bg-primary p-5 text-primary-foreground">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary-foreground/70">{pin.area}</p>
          <h2 id="current-heading" className="font-heading text-2xl font-semibold text-balance">
            {pin.name}
          </h2>
          <p className="mt-0.5 text-xs text-primary-foreground/70 tabular-nums">
            {pin.latitude.toFixed(3)}°N, {pin.longitude.toFixed(3)}°E
          </p>
        </div>
        <WeatherIcon code={c.weatherCode} className="size-12 shrink-0 text-accent" strokeWidth={1.5} />
      </div>

      <div className="mt-5 flex items-end gap-3">
        <span className="font-heading text-6xl font-semibold leading-none tabular-nums">
          {Math.round(c.temperature)}°
        </span>
        <div className="pb-1 text-sm">
          <p className="font-medium">{describeWeatherCode(c.weatherCode)}</p>
          {today && (
            <p className="text-primary-foreground/70 tabular-nums">
              H {Math.round(today.tempMax)}° · L {Math.round(today.tempMin)}°
            </p>
          )}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl bg-primary-foreground/10 px-3 py-2">
            <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-[11px] text-primary-foreground/70">{label}</dt>
              <dd className="truncate text-sm font-medium tabular-nums">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
