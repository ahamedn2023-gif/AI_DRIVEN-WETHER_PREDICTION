'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { TRIVANDRUM_CENTER, type Pin } from '@/lib/locations'
import type { PinSnapshot } from '@/lib/weather'

type WeatherMapProps = {
  pins: Pin[]
  snapshots: Record<string, PinSnapshot | undefined>
  selectedId: string
  onSelect: (id: string) => void
  onAddPin: (latitude: number, longitude: number) => void
}

function buildIcon(label: string, selected: boolean, custom: boolean) {
  const tone = selected
    ? 'bg-primary text-primary-foreground ring-4 ring-primary/25 scale-110'
    : custom
      ? 'bg-accent text-accent-foreground'
      : 'bg-card text-foreground'
  return L.divIcon({
    className: 'weather-pin',
    iconSize: [56, 44],
    iconAnchor: [28, 44],
    html: `<div class="flex flex-col items-center transition-transform ${selected ? 'z-10' : ''}">
      <div class="rounded-full px-2.5 py-1 text-xs font-semibold shadow-md border border-border tabular-nums ${tone}">${label}</div>
      <div class="h-2.5 w-0.5 ${selected ? 'bg-primary' : 'bg-foreground/60'}"></div>
      <div class="size-2 rounded-full ${selected ? 'bg-primary' : 'bg-foreground/60'}"></div>
    </div>`,
  })
}

function ClickToPin({ onAddPin }: { onAddPin: WeatherMapProps['onAddPin'] }) {
  useMapEvents({
    click(event) {
      onAddPin(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function FlyToSelected({ pin }: { pin?: Pin }) {
  const map = useMap()
  useEffect(() => {
    if (!pin) return
    map.flyTo([pin.latitude, pin.longitude], Math.max(map.getZoom(), 11), { duration: 0.8 })
  }, [map, pin])
  return null
}

export default function WeatherMap({
  pins,
  snapshots,
  selectedId,
  onSelect,
  onAddPin,
}: WeatherMapProps) {
  const selectedPin = useMemo(() => pins.find((p) => p.id === selectedId), [pins, selectedId])

  return (
    <MapContainer
      center={TRIVANDRUM_CENTER}
      zoom={10}
      scrollWheelZoom
      className="size-full"
      aria-label="Map of Thiruvananthapuram with weather pins"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPin onAddPin={onAddPin} />
      <FlyToSelected pin={selectedPin} />
      {pins.map((pin) => {
        const snap = snapshots[pin.id]
        const label = snap ? `${Math.round(snap.temperature)}°` : '···'
        const selected = pin.id === selectedId
        return (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={buildIcon(label, selected, Boolean(pin.custom))}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(pin.id) }}
            title={pin.name}
          >
            <Tooltip direction="top" offset={[0, -44]}>
              {pin.name}
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
