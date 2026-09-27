export type Pin = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  custom?: boolean
}

export const TRIVANDRUM_CENTER: [number, number] = [8.5241, 76.9366]

export const SAMPLE_PINS: Pin[] = [
  { id: 'east-fort', name: 'East Fort', area: 'City centre', latitude: 8.4829, longitude: 76.9474 },
  { id: 'technopark', name: 'Technopark', area: 'Kazhakkoottam', latitude: 8.5581, longitude: 76.8816 },
  { id: 'kovalam', name: 'Kovalam Beach', area: 'Coastal', latitude: 8.4004, longitude: 76.9787 },
  { id: 'vizhinjam', name: 'Vizhinjam Port', area: 'Coastal', latitude: 8.3775, longitude: 77.0015 },
  { id: 'airport', name: 'TRV Airport', area: 'Shanghumugham', latitude: 8.4821, longitude: 76.9201 },
  { id: 'varkala', name: 'Varkala Cliff', area: 'North coast', latitude: 8.7379, longitude: 76.7163 },
  { id: 'neyyar', name: 'Neyyar Dam', area: 'Western Ghats foothills', latitude: 8.5335, longitude: 77.1467 },
  { id: 'ponmudi', name: 'Ponmudi Hills', area: 'Hill station', latitude: 8.7597, longitude: 77.1167 },
]
