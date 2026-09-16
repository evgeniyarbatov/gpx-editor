import { describe, expect, it } from 'vitest'
import { buildGpx } from './build.js'
import { parseGpxPoints } from './parse.js'
import { assertWatchGpx } from '../../test/watch-gpx.js'

describe('buildGpx', () => {
  const points = [
    { lat: 1.3097970339490435, lng: 103.89455470068188 },
    { lat: -1.5, lng: 179.9 },
    { lat: 1.31, lng: 103.9 },
  ]

  it('emits GPX 1.1 that round-trips through the parser', () => {
    const xml = buildGpx(points)
    expect(xml).toContain('creator="StravaGPX"')
    expect(xml).toContain('lon="')
    expect(xml).not.toContain('long="')
    assertWatchGpx(xml, points)
    expect(parseGpxPoints(xml)).toEqual(points)
  })

  it('keeps only lat/lon on track points', () => {
    const xml = buildGpx([{ lat: 1, lng: 2 }])
    expect(xml).not.toMatch(/<ele>|<time>|<extensions>/)
  })
})
