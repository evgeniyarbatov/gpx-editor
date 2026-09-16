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

  it('keeps track elements in the GPX 1.1 namespace', () => {
    const xml = buildGpx(points)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).not.toContain('xmlns=""')
    expect(xml).toContain('xsi:schemaLocation')

    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    const ns = 'http://www.topografix.com/GPX/1/1'
    expect(doc.documentElement.namespaceURI).toBe(ns)
    expect(doc.getElementsByTagNameNS(ns, 'trk')).toHaveLength(1)
    expect(doc.getElementsByTagNameNS(ns, 'trkseg')).toHaveLength(1)
    expect(doc.getElementsByTagNameNS(ns, 'trkpt')).toHaveLength(points.length)
    expect(doc.getElementsByTagNameNS('', 'trk')).toHaveLength(0)
    expect(doc.getElementsByTagNameNS('', 'trkpt')).toHaveLength(0)
  })

  it('keeps only lat/lon on track points', () => {
    const xml = buildGpx([{ lat: 1, lng: 2 }])
    expect(xml).not.toMatch(/<ele>|<time>|<extensions>/)
  })
})
