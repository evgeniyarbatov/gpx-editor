import { describe, expect, it } from 'vitest'
import { parseGpxPoints } from './parse.js'

describe('parseGpxPoints', () => {
  it('reads namespaced trkpt nodes in order', () => {
    const xml = `<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <trk><trkseg>
    <trkpt lat="1.2000000" lon="103.8000000"></trkpt>
    <trkpt lat="1.2001000" lon="103.8000000"></trkpt>
  </trkseg></trk>
</gpx>`
    expect(parseGpxPoints(xml)).toEqual([
      { lat: 1.2, lng: 103.8 },
      { lat: 1.2001, lng: 103.8 },
    ])
  })

  it('reads prefixed GPX namespaces', () => {
    const xml = `<g:gpx xmlns:g="http://www.topografix.com/GPX/1/1">
  <g:trk><g:trkseg>
    <g:trkpt lat="2" lon="4"></g:trkpt>
  </g:trkseg></g:trk>
</g:gpx>`
    expect(parseGpxPoints(xml)).toEqual([{ lat: 2, lng: 4 }])
  })

  it('concatenates multiple track segments in document order', () => {
    const xml = `<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
      <trkpt lat="1" lon="2"></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="3" lon="4"></trkpt>
    </trkseg>
  </trk>
</gpx>`
    expect(parseGpxPoints(xml)).toEqual([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ])
  })

  it('rejects invalid XML', () => {
    expect(() => parseGpxPoints('this is not gpx')).toThrow(
      'Unable to parse GPX file',
    )
  })

  it('rejects a GPX with no track points', () => {
    const xml = `<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk></trk></gpx>`
    expect(() => parseGpxPoints(xml)).toThrow('No track points found in GPX file')
  })

  it('rejects a route-only file (rtept is not a track)', () => {
    const xml = `<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <rte><rtept lat="1" lon="2"></rtept></rte>
</gpx>`
    expect(() => parseGpxPoints(xml)).toThrow('No track points found in GPX file')
  })
})
