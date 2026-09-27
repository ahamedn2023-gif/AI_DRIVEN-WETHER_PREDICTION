import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideProps,
} from 'lucide-react'

export function WeatherIcon({ code, ...props }: { code: number } & LucideProps) {
  if (code === 0 || code === 1) return <Sun aria-hidden="true" {...props} />
  if (code === 2) return <CloudSun aria-hidden="true" {...props} />
  if (code === 3) return <Cloud aria-hidden="true" {...props} />
  if (code === 45 || code === 48) return <CloudFog aria-hidden="true" {...props} />
  if (code >= 51 && code <= 57) return <CloudDrizzle aria-hidden="true" {...props} />
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return <CloudRain aria-hidden="true" {...props} />
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return <CloudSnow aria-hidden="true" {...props} />
  if (code >= 95) return <CloudLightning aria-hidden="true" {...props} />
  return <Cloud aria-hidden="true" {...props} />
}
