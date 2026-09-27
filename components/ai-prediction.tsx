'use client'

import { AlertTriangle, Clock, RefreshCw, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import type { Pin } from '@/lib/locations'
import type { Prediction, PredictionResponse } from '@/lib/prediction'
import { cn } from '@/lib/utils'

async function fetchPrediction([, name, latitude, longitude]: [string, string, number, number]) {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, latitude, longitude }),
  })
  if (!res.ok) throw new Error('Prediction failed')
  return (await res.json()) as PredictionResponse
}

const riskStyles: Record<Prediction['riskLevel'], string> = {
  low: 'bg-chart-3/15 text-chart-3',
  moderate: 'bg-accent/30 text-accent-foreground',
  high: 'bg-destructive/15 text-destructive',
  severe: 'bg-destructive text-primary-foreground',
}

export function AiPrediction({ pin }: { pin: Pin }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['predict', pin.name, pin.latitude, pin.longitude] as [string, string, number, number],
    fetchPrediction,
    { revalidateOnFocus: false, dedupingInterval: 5 * 60 * 1000 },
  )

  return (
    <section
      aria-labelledby="ai-heading"
      aria-busy={isLoading}
      className="rounded-2xl border border-primary/20 bg-secondary/60 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id="ai-heading" className="flex items-center gap-2 font-heading text-sm font-semibold">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          AI prediction
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          disabled={isValidating}
          aria-label="Regenerate AI prediction"
        >
          <RefreshCw className={cn('size-3.5', isValidating && 'animate-spin')} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {isLoading && <PredictionSkeleton />}

      {error && !isLoading && (
        <p className="text-sm text-destructive">
          {"Couldn't generate a prediction right now. Try refreshing."}
        </p>
      )}

      {data && !isLoading && (
        <div className={cn('space-y-4 transition-opacity', isValidating && 'opacity-60')}>
          {data.source === 'estimate' && data.notice && (
            <p className="rounded-lg border border-accent/60 bg-accent/15 px-3 py-2 text-xs text-accent-foreground">
              {data.notice}
            </p>
          )}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                  riskStyles[data.riskLevel],
                )}
              >
                {data.riskLevel} risk
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round(data.confidence)}% confidence
              </span>
            </div>
            <p className="font-heading text-lg font-semibold leading-snug text-balance">{data.headline}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{data.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card p-3">
              <p className="text-[11px] text-muted-foreground">Rain next 24h</p>
              <p className="font-heading text-2xl font-semibold tabular-nums">
                {Math.round(data.rainChance24h)}%
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${data.rainChance24h}%` }} />
              </div>
            </div>
            <div className="rounded-xl bg-card p-3">
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                Best time outdoors
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">{data.bestTimeOutdoors}</p>
            </div>
          </div>

          {data.alerts.length > 0 && (
            <ul className="space-y-1.5">
              {data.alerts.map((alert) => (
                <li
                  key={alert}
                  className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {alert}
                </li>
              ))}
            </ul>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {data.recommendations.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

function PredictionSkeleton() {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">Generating AI prediction…</span>
      <div className="h-4 w-24 animate-pulse rounded-full bg-primary/15" />
      <div className="h-5 w-3/4 animate-pulse rounded bg-primary/15" />
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-primary/10" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-primary/10" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 animate-pulse rounded-xl bg-card" />
        <div className="h-20 animate-pulse rounded-xl bg-card" />
      </div>
    </div>
  )
}
