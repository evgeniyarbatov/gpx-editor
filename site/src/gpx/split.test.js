import { describe, expect, it } from 'vitest'
import { assertWatchGpx } from '../../test/watch-gpx.js'
import { parseGpxPoints } from './parse.js'
import { splitPoints } from './split.js'

const points = Array.from({ length: 650 }, (_, index) => ({
  lat: 1.3 + index * 0.00008,
  lng: 103.8,
}))

describe('splitPoints', () => {
  it('emits disjoint slices whose GPX concatenates back to the input', () => {
    const segments = splitPoints(points, 200)
    expect(segments.map((segment) => segment.pointCount)).toEqual([
      200, 200, 200, 50,
    ])

    const rebuilt = segments.flatMap((segment) => parseGpxPoints(segment.gpx))
    expect(rebuilt).toEqual(points)

    let offset = 0
    segments.forEach((segment) => {
      assertWatchGpx(segment.gpx, points.slice(offset, offset + segment.pointCount))
      offset += segment.pointCount
    })
  })

  it('keeps a short track as a single file', () => {
    const short = points.slice(0, 40)
    const segments = splitPoints(short, 200)
    expect(segments).toHaveLength(1)
    expect(parseGpxPoints(segments[0].gpx)).toEqual(short)
  })

  it('names files with cumulative distance in kilometres', () => {
    const segments = splitPoints(points, 200)
    const names = segments.map((segment) => segment.distanceKm)
    expect(names[0]).toBeGreaterThan(0)
    for (let index = 1; index < names.length; index += 1) {
      expect(names[index]).toBeGreaterThanOrEqual(names[index - 1])
    }
    segments.forEach((segment) => {
      expect(segment.gpx).toContain(`<name>${segment.distanceKm}km</name>`)
    })
  })
})
