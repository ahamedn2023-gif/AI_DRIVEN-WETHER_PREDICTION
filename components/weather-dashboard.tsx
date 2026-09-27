'use client'

import { MousePointerClick } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import { SAMPLE_PINS, type Pin } from '@/lib/locations'
import type { PinSnapshot, WeatherReport } from '@/lib/weather'
import { AiPrediction } from './ai-prediction'
import { CurrentConditions } from './current-conditions'
import { ForecastList } from './forecast-list'
import { HourlyStrip } from './hourly-strip'
import { PinList } from './pin-list'
import { WeatherMapLoader } from './weather-map-loader'

async function fetchReport(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load weather')
  return (await res.json()) as WeatherReport
}

async function fetchSnapshots([, points]: [string, string]) {
  const res = await fetch('/api/snapshots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: points,
  })
  if (!res.ok) throw new Error('Failed to load pins')
  return (await res.json()) as PinSnapshot[]
}

export function WeatherDashboard() {
  const [pins, setPins] = useState<Pin[]>(SAMPLE_PINS)
  const [selectedId, setSelectedId] = useState(SAMPLE_PINS[0].id)
  const selectedPin = pins.find((p) => p.id === selectedId) ?? pins[0]

  const pointsKey = JSON.stringify({
    points: pins.map(({ latitude, longitude }) => ({ latitude, longitude })),
  })
  const { data: snapshotList } = useSWR(['snapshots', pointsKey] as [string, string], fetchSnapshots, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })

  const snapshots = useMemo(() => {
    const map: Record<string, PinSnapshot | undefined> = {}
    pins.forEach((pin) => {
      map[pin.id] = snapshotList?.find(
        (s) => s.latitude === pin.latitude && s.longitude === pin.longitude,
      )
    })
    return map
  }, [pins, snapshotList])

  const { data: report, error: reportError } = useSWR(
    `/api/weather?lat=${selectedPin.latitude}&lon=${selectedPin.longitude}`,
    fetchReport,
    { revalidateOnFocus: false },
  )

  const addPin = useCallback((latitude: number, longitude: number) => {
    const id = `custom-${Date.now()}`
    setPins((prev) => {
      const count = prev.filter((p) => p.custom).length + 1
      return [
        ...prev,
        {
          id,
          name: `My pin ${count}`,
          area: 'Custom location',
          latitude: Number(latitude.toFixed(4)),
          longitude: Number(longitude.toFixed(4)),
          custom: true,
        },
      ]
    })
    setSelectedId(id)
  }, [])

  const removePin = useCallback(
    (id: string) => {
      setPins((prev) => prev.filter((p) => p.id !== id))
      if (id === selectedId) setSelectedId(SAMPLE_PINS[0].id)
    },
    [selectedId],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="relative h-[55vh] overflow-hidden rounded-2xl border bg-card shadow-sm lg:h-[calc(100dvh-13rem)]">
          <WeatherMapLoader
            pins={pins}
            snapshots={snapshots}
            selectedId={selectedPin.id}
            onSelect={setSelectedId}
            onAddPin={addPin}
          />
          <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur">
            <MousePointerClick className="size-3.5 text-primary" aria-hidden="true" />
            Tap anywhere on the map to drop a pin
          </div>
        </div>
        <PinList
          pins={pins}
          snapshots={snapshots}
          selectedId={selectedPin.id}
          onSelect={setSelectedId}
          onRemove={removePin}
        />
      </div>

      <aside className="flex flex-col gap-3 lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:pr-1">
        {report ? (
          <>
            <CurrentConditions pin={selectedPin} report={report} />
            <AiPrediction key={selectedPin.id} pin={selectedPin} />
            <HourlyStrip hourly={report.hourly} />
            <ForecastList daily={report.daily} />
          </>
        ) : reportError ? (
          <p className="rounded-2xl border bg-card p-5 text-sm text-destructive">
            Weather data is unavailable right now. Please try again shortly.
          </p>
        ) : (
          <div className="space-y-3" role="status">
            <span className="sr-only">Loading weather…</span>
            <div className="h-64 animate-pulse rounded-2xl bg-primary/20" />
            <div className="h-72 animate-pulse rounded-2xl bg-secondary" />
          </div>
        )}
      </aside>
    </div>
  )
}
