import { MapPin, X } from 'lucide-react'
import type { Pin } from '@/lib/locations'
import type { PinSnapshot } from '@/lib/weather'
import { cn } from '@/lib/utils'
import { WeatherIcon } from './weather-icon'

type PinListProps = {
  pins: Pin[]
  snapshots: Record<string, PinSnapshot | undefined>
  selectedId: string
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

export function PinList({ pins, snapshots, selectedId, onSelect, onRemove }: PinListProps) {
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Pinned locations">
      {pins.map((pin) => {
        const snap = snapshots[pin.id]
        const selected = pin.id === selectedId
        return (
          <li key={pin.id} className="relative shrink-0">
            <button
              type="button"
              onClick={() => onSelect(pin.id)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-secondary',
                pin.custom && 'pr-8',
              )}
            >
              {snap ? (
                <WeatherIcon
                  code={snap.weatherCode}
                  className={cn('size-5', selected ? 'text-accent' : 'text-primary')}
                />
              ) : (
                <MapPin className="size-5 opacity-60" aria-hidden="true" />
              )}
              <span>
                <span className="block max-w-36 truncate text-sm font-medium">{pin.name}</span>
                <span
                  className={cn(
                    'block text-xs tabular-nums',
                    selected ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {snap ? `${Math.round(snap.temperature)}°C` : 'Loading…'}
                </span>
              </span>
            </button>
            {pin.custom && (
              <button
                type="button"
                onClick={() => onRemove(pin.id)}
                aria-label={`Remove ${pin.name}`}
                className={cn(
                  'absolute right-1.5 top-1.5 rounded-md p-1 transition-colors',
                  selected ? 'hover:bg-primary-foreground/15' : 'hover:bg-muted',
                )}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
