import { z } from 'zod'

export const predictionSchema = z.object({
  headline: z.string().describe('Short, punchy forecast headline, max 10 words'),
  summary: z
    .string()
    .describe('2-3 sentence plain-language prediction for the next 24-48 hours'),
  riskLevel: z.enum(['low', 'moderate', 'high', 'severe']),
  rainChance24h: z.number().min(0).max(100).describe('Estimated rain probability next 24h in %'),
  confidence: z.number().min(0).max(100).describe('Model confidence in %'),
  bestTimeOutdoors: z.string().describe('Best window for outdoor activity, e.g. "6–9 AM"'),
  alerts: z.array(z.string()).max(3).describe('Notable weather hazards, empty if none'),
  recommendations: z.array(z.string()).min(2).max(4).describe('Practical local tips'),
})

export type Prediction = z.infer<typeof predictionSchema>

export type PredictionResponse = Prediction & {
  source: 'ai' | 'estimate'
  notice?: string
}

type EstimateInput = {
  current: { temperature: number; humidity: number; windSpeed: number; weatherCode: number }
  hourly: { time: string; temperature: number; precipitationProbability: number }[]
  daily: { precipitationProbability: number; tempMax: number }[]
}

export function estimatePrediction(report: EstimateInput): Prediction {
  const next24 = report.hourly.slice(0, 24)
  const rainChance = Math.max(0, ...next24.map((h) => h.precipitationProbability))
  const maxTemp = Math.max(...next24.map((h) => h.temperature))
  const stormy = report.current.weatherCode >= 95
  const riskLevel: Prediction['riskLevel'] = stormy
    ? 'high'
    : rainChance >= 80
      ? 'high'
      : rainChance >= 50 || maxTemp >= 34
        ? 'moderate'
        : 'low'

  const dry = next24.filter((h) => h.precipitationProbability < 30)
  const coolDry = dry.find((h) => {
    const hour = Number(h.time.slice(11, 13))
    return hour >= 6 && hour <= 10
  })
  const bestHour = coolDry ?? dry[0]
  const bestTimeOutdoors = bestHour
    ? `Around ${Number(bestHour.time.slice(11, 13)) % 12 || 12} ${Number(bestHour.time.slice(11, 13)) >= 12 ? 'PM' : 'AM'}`
    : 'Limited dry windows today'

  const alerts: string[] = []
  if (stormy) alerts.push('Thunderstorm activity reported nearby')
  if (rainChance >= 70) alerts.push(`High rain probability (${rainChance}%) in the next 24 hours`)
  if (maxTemp >= 34) alerts.push(`Heat peaking near ${Math.round(maxTemp)}°C`)

  const recommendations = [
    rainChance >= 50 ? 'Carry an umbrella or raincoat when heading out' : 'Light cotton clothing suits the conditions',
    report.current.humidity >= 75
      ? 'High humidity — stay hydrated and take breaks in shade'
      : 'Comfortable humidity for outdoor plans',
    report.current.windSpeed >= 25
      ? 'Breezy along the coast — take care at Kovalam and Shanghumugham beaches'
      : 'Calm winds — good for beach visits outside rain spells',
  ]

  return {
    headline:
      rainChance >= 60
        ? 'Wet spell likely over the next day'
        : rainChance >= 30
          ? 'Mostly warm with passing showers possible'
          : 'Warm, largely dry conditions ahead',
    summary: `Peak rain probability over the next 24 hours is ${rainChance}% with temperatures up to ${Math.round(maxTemp)}°C. Humidity is ${report.current.humidity}% and winds are around ${Math.round(report.current.windSpeed)} km/h.`,
    riskLevel,
    rainChance24h: rainChance,
    confidence: 55,
    bestTimeOutdoors,
    alerts: alerts.slice(0, 3),
    recommendations,
  }
}
