'use client'

import dynamic from 'next/dynamic'

export const WeatherMapLoader = dynamic(() => import('./weather-map'), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-secondary text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})
