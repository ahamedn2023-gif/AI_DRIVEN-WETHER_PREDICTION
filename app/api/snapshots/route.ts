import { z } from 'zod'
import { fetchPinSnapshots } from '@/lib/weather'

const bodySchema = z.object({
  points: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
    )
    .max(40),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const snapshots = await fetchPinSnapshots(parsed.data.points)
    return Response.json(snapshots)
  } catch (error) {
    console.error('[snapshots] fetch failed', error)
    return Response.json({ error: 'Unable to load weather data' }, { status: 502 })
  }
}
