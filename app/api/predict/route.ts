import { generateText, Output } from 'ai'
import { z } from 'zod'
import { estimatePrediction, predictionSchema, type PredictionResponse } from '@/lib/prediction'
import { describeWeatherCode, fetchWeatherReport } from '@/lib/weather'

export const maxDuration = 30

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, latitude, longitude } = parsed.data

  let report: Awaited<ReturnType<typeof fetchWeatherReport>>
  try {
    report = await fetchWeatherReport(latitude, longitude)
  } catch (error) {
    console.error('[predict] weather fetch failed', error)
    return Response.json({ error: 'Unable to load weather data' }, { status: 502 })
  }

  try {

    const observations = {
      location: name,
      coordinates: { latitude, longitude },
      localTime: report.current.time,
      current: {
        ...report.current,
        condition: describeWeatherCode(report.current.weatherCode),
      },
      next24Hours: report.hourly.filter((_, i) => i % 3 === 0),
      next7Days: report.daily.map((d) => ({
        ...d,
        condition: describeWeatherCode(d.weatherCode),
      })),
    }

    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      instructions:
        'You are a meteorologist specialising in Thiruvananthapuram (Trivandrum), Kerala, India. ' +
        'Use the supplied numerical forecast data plus your knowledge of local climate — the southwest monsoon (June–September), ' +
        'the northeast monsoon (October–December), sea breeze along the Arabian Sea coast, and orographic rain near the Western Ghats — ' +
        'to produce a concise, practical AI weather prediction. Ground every claim in the data. Use °C and km/h.',
      prompt: `Weather data (JSON):\n${JSON.stringify(observations)}`,
      output: Output.object({ schema: predictionSchema }),
    })

    return Response.json({ ...output, source: 'ai' } satisfies PredictionResponse)
  } catch (error) {
    console.error('[predict] AI generation failed, using data-driven estimate', error)
    return Response.json({
      ...estimatePrediction(report),
      source: 'estimate',
     
    } satisfies PredictionResponse)
  }
}
