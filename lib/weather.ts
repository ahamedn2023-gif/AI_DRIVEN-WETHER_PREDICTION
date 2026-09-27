export type CurrentWeather = {
  time: string
  temperature: number
  feelsLike: number
  humidity: number
  precipitation: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  pressure: number
}

export type DailyForecast = {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationSum: number
  precipitationProbability: number
  windSpeedMax: number
  uvIndexMax: number
}

export type HourlyPoint = {
  time: string
  temperature: number
  precipitationProbability: number
}

export type WeatherReport = {
  latitude: number
  longitude: number
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyForecast[]
}

export type PinSnapshot = {
  latitude: number
  longitude: number
  temperature: number
  weatherCode: number
}

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'cloud_cover',
  'pressure_msl',
].join(',')

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'uv_index_max',
].join(',')

export function isValidCoordinate(lat: number, lon: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  )
}

export async function fetchWeatherReport(
  latitude: number,
  longitude: number,
): Promise<WeatherReport> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: CURRENT_FIELDS,
    hourly: 'temperature_2m,precipitation_probability',
    daily: DAILY_FIELDS,
    timezone: 'Asia/Kolkata',
    forecast_days: '7',
    forecast_hours: '24',
  })

  const res = await fetch(`${BASE_URL}?${params}`, {
    next: { revalidate: 600 },
  })
  if (!res.ok) throw new Error(`Weather service responded with ${res.status}`)
  const data = await res.json()

  const c = data.current
  const h = data.hourly
  const d = data.daily

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      weatherCode: c.weather_code,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
    },
    hourly: (h.time as string[]).map((time, i) => ({
      time,
      temperature: h.temperature_2m[i],
      precipitationProbability: h.precipitation_probability[i] ?? 0,
    })),
    daily: (d.time as string[]).map((date, i) => ({
      date,
      weatherCode: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipitationSum: d.precipitation_sum[i],
      precipitationProbability: d.precipitation_probability_max[i] ?? 0,
      windSpeedMax: d.wind_speed_10m_max[i],
      uvIndexMax: d.uv_index_max[i],
    })),
  }
}

export async function fetchPinSnapshots(
  points: { latitude: number; longitude: number }[],
): Promise<PinSnapshot[]> {
  if (points.length === 0) return []
  const params = new URLSearchParams({
    latitude: points.map((p) => p.latitude.toFixed(4)).join(','),
    longitude: points.map((p) => p.longitude.toFixed(4)).join(','),
    current: 'temperature_2m,weather_code',
    timezone: 'Asia/Kolkata',
  })
  const res = await fetch(`${BASE_URL}?${params}`, {
    next: { revalidate: 600 },
  })
  if (!res.ok) throw new Error(`Weather service responded with ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : [data]
  return list.map((item, i) => ({
    latitude: points[i].latitude,
    longitude: points[i].longitude,
    temperature: item.current.temperature_2m,
    weatherCode: item.current.weather_code,
  }))
}

export function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code === 66 || code === 67) return 'Freezing rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Unknown'
}

export function compassDirection(degrees: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(degrees / 45) % 8]
}
