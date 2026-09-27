import type { HourlyPoint } from '@/lib/weather'

function formatHour(time: string) {
  const hour = Number(time.slice(11, 13))
  const suffix = hour >= 12 ? 'p' : 'a'
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`
}

export function HourlyStrip({ hourly }: { hourly: HourlyPoint[] }) {
  const points = hourly.filter((_, i) => i % 2 === 0).slice(0, 12)

  return (
    <section aria-labelledby="hourly-heading" className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 id="hourly-heading" className="font-heading text-sm font-semibold">
          Next 24 hours
        </h3>
        <span className="text-xs text-muted-foreground">Rain chance</span>
      </div>
      <ol className="grid grid-cols-12 items-end gap-1">
        {points.map((p) => (
          <li key={p.time} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium tabular-nums">{Math.round(p.temperature)}°</span>
            <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-secondary">
              <div
                className="w-full rounded-md bg-primary/80"
                style={{ height: `${Math.max(p.precipitationProbability, 4)}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">{`${p.precipitationProbability}% chance of rain`}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{formatHour(p.time)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
