import { describe, expect, it } from 'vitest'
import { COURSE_SPIKE_INDEX, makeCoursePoints } from '../../test/course.js'
import { maxSegmentErrorMeters } from '../../test/watch-gpx.js'
import { trackError } from './error.js'
import { simplifyRdp } from './simplify.js'

const line = (count) =>
  Array.from({ length: count }, (_, index) => ({
    lat: 1,
    lng: 103 + index * 0.001,
  }))

describe('simplifyRdp', () => {
  it('keeps every point when tolerance is 0', () => {
    const points = makeCoursePoints()
    const result = simplifyRdp(points, 0)
    expect(result.points).toBe(points)
    expect(result.indices).toEqual(points.map((_, index) => index))
  })

  it('always keeps the first and last points', () => {
    const points = makeCoursePoints()
    const result = simplifyRdp(points, 20)
    expect(result.points[0]).toEqual(points[0])
    expect(result.points.at(-1)).toEqual(points.at(-1))
    expect(result.indices[0]).toBe(0)
    expect(result.indices.at(-1)).toBe(points.length - 1)
  })

  it('collapses a straight line to its endpoints', () => {
    const result = simplifyRdp(line(11), 1)
    expect(result.indices).toEqual([0, 10])
  })

  it('keeps a 40m spike at 10 m tolerance and drops it at 100 m', () => {
    const points = makeCoursePoints()
    const tight = simplifyRdp(points, 10)
    const loose = simplifyRdp(points, 100)
    expect(tight.indices).toContain(COURSE_SPIKE_INDEX)
    expect(loose.indices).not.toContain(COURSE_SPIKE_INDEX)
  })

  it('never lets a dropped point drift more than the tolerance', () => {
    const points = makeCoursePoints()
    for (const epsilon of [1, 5, 10, 20, 50]) {
      const result = simplifyRdp(points, epsilon)
      const reported = trackError(points, result.indices)
      const independent = maxSegmentErrorMeters(points, result.indices)
      expect(reported.max).toBeLessThanOrEqual(epsilon)
      expect(independent).toBeLessThanOrEqual(epsilon + 1)
      expect(result.points.length).toBe(result.indices.length)
      result.indices.forEach((index, order) => {
        expect(result.points[order]).toBe(points[index])
      })
    }
  })

  it('holds the error bound on random walks', () => {
    let seed = 1
    const next = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }

    for (let walk = 0; walk < 20; walk += 1) {
      const points = [{ lat: 1.3, lng: 103.8 }]
      for (let step = 0; step < 120; step += 1) {
        const prev = points.at(-1)
        points.push({
          lat: prev.lat + (next() - 0.5) * 0.0004,
          lng: prev.lng + (next() - 0.5) * 0.0004,
        })
      }
      for (const epsilon of [2, 8, 25]) {
        const result = simplifyRdp(points, epsilon)
        expect(trackError(points, result.indices).max).toBeLessThanOrEqual(
          epsilon,
        )
      }
    }
  })
})
