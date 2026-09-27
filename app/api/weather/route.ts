import { fetchWeatherReport, isValidCoordinate } from '@/lib/weather'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))

  if (!isValidCoordinate(lat, lon)) {
    return Response.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    const report = await fetchWeatherReport(lat, lon)
    return Response.json(report)
  } catch (error) {
    console.error('[weather] fetch failed', error)
    return Response.json({ error: 'Unable to load weather data' }, { status: 502 })
  }
}
