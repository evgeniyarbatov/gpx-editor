import { expect } from 'vitest'
import { perpendicularDistance } from '../src/gpx/geo.js'
import { parseGpxPoints } from '../src/gpx/parse.js'
import { parseDownloadedGpx } from './parse-downloaded-gpx.js'

const METERS_PER_DEG_LAT = 111320

export { parseDownloadedGpx }

export const assertWatchGpx = (xml, expectedPoints) => {
  expect(xml).toContain('<gpx')
  expect(xml).toContain('version="1.1"')
  expect(xml).toContain('http://www.topografix.com/GPX/1/1')
  expect(xml).toMatch(/<trkpt\b/i)
  expect(xml).not.toContain('xmlns=""')
  expect(xml).not.toMatch(/lat="NaN"|lon="NaN"|lat="undefined"|lon="undefined"/i)

  const fromApp = parseGpxPoints(xml)
  const independent = parseDownloadedGpx(xml)
  expect(independent).toHaveLength(expectedPoints.length)
  expect(fromApp).toHaveLength(expectedPoints.length)

  expectedPoints.forEach((expected, index) => {
    const got = independent[index]
    expect(Number.isFinite(got.lat)).toBe(true)
    expect(Number.isFinite(got.lng)).toBe(true)
    expect(got.lat).toBeGreaterThanOrEqual(-90)
    expect(got.lat).toBeLessThanOrEqual(90)
    expect(got.lng).toBeGreaterThanOrEqual(-180)
    expect(got.lng).toBeLessThanOrEqual(180)
    expect(got.lat).toBeCloseTo(expected.lat, 7)
    expect(got.lng).toBeCloseTo(expected.lng, 7)
    expect(fromApp[index].lat).toBeCloseTo(expected.lat, 7)
    expect(fromApp[index].lng).toBeCloseTo(expected.lng, 7)
  })
}

export const maxSegmentErrorMeters = (original, indices) => {
  let max = 0
  for (let pair = 0; pair < indices.length - 1; pair += 1) {
    const from = indices[pair]
    const to = indices[pair + 1]
    const origin = original[from]
    const cosLat = Math.cos((origin.lat * Math.PI) / 180)
    const toXY = (point) => ({
      x: (point.lng - origin.lng) * METERS_PER_DEG_LAT * cosLat,
      y: (point.lat - origin.lat) * METERS_PER_DEG_LAT,
    })
    const start = toXY(original[from])
    const end = toXY(original[to])
    for (let index = from; index <= to; index += 1) {
      max = Math.max(max, perpendicularDistance(toXY(original[index]), start, end))
    }
  }
  return max
}

export const samePoint = (left, right) =>
  left.lat === right.lat && left.lng === right.lng
