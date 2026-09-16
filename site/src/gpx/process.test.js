import { describe, expect, it } from 'vitest'
import {
  COURSE_POINT_COUNT,
  courseGpx,
  makeCoursePoints,
} from '../../test/course.js'
import { assertWatchGpx, samePoint } from '../../test/watch-gpx.js'
import { parseGpxPoints } from './parse.js'
import { processTrack } from './process.js'

describe('processTrack', () => {
  const points = makeCoursePoints()

  it('at 0 m tolerance exports the original course across watch-sized files', () => {
    const result = processTrack({
      points,
      pointsPerFile: 200,
      toleranceMeters: 0,
    })

    expect(result.cropped).toHaveLength(COURSE_POINT_COUNT)
    expect(result.simplified.points).toHaveLength(COURSE_POINT_COUNT)
    expect(result.error.max).toBe(0)
    expect(result.segments).toHaveLength(4)

    const exported = result.segments.flatMap((segment) =>
      parseGpxPoints(segment.gpx),
    )
    expect(exported).toEqual(points)
    expect(samePoint(exported[0], points[0])).toBe(true)
    expect(samePoint(exported.at(-1), points.at(-1))).toBe(true)
    result.segments.forEach((segment, index) => {
      const start = index * 200
      assertWatchGpx(segment.gpx, points.slice(start, start + segment.pointCount))
    })
  })

  it('round-trips a saved GPX file at 0 m without moving any point', () => {
    const fromFile = parseGpxPoints(courseGpx(points))
    const result = processTrack({
      points: fromFile,
      pointsPerFile: 200,
      toleranceMeters: 0,
    })
    const exported = result.segments.flatMap((segment) =>
      parseGpxPoints(segment.gpx),
    )
    expect(exported).toEqual(fromFile)
  })

  it('reverses the course before simplify and split', () => {
    const result = processTrack({
      points,
      reverseRoute: true,
      pointsPerFile: 1000,
      toleranceMeters: 0,
    })
    const exported = parseGpxPoints(result.segments[0].gpx)
    expect(samePoint(exported[0], points.at(-1))).toBe(true)
    expect(samePoint(exported.at(-1), points[0])).toBe(true)
    expect(exported).toEqual([...points].reverse())
  })

  it('drops the prefix when a custom start index is set', () => {
    const startIndex = 400
    const result = processTrack({
      points,
      startFromBeginning: false,
      startIndex,
      pointsPerFile: 1000,
      toleranceMeters: 0,
    })
    const exported = parseGpxPoints(result.segments[0].gpx)
    expect(exported).toEqual(points.slice(startIndex))
    expect(samePoint(exported[0], points[startIndex])).toBe(true)
  })

  it('keeps exported points inside the accuracy budget', () => {
    const result = processTrack({
      points,
      pointsPerFile: 200,
      toleranceMeters: 10,
    })
    expect(result.error.max).toBeLessThanOrEqual(10)
    expect(result.simplified.points.length).toBeLessThan(points.length)
    expect(result.simplifiedDistance).toBeLessThanOrEqual(
      result.originalDistance + 1,
    )

    const exported = result.segments.flatMap((segment) =>
      parseGpxPoints(segment.gpx),
    )
    expect(exported).toEqual(result.simplified.points)
    expect(samePoint(exported[0], points[0])).toBe(true)
    expect(samePoint(exported.at(-1), points.at(-1))).toBe(true)
  })
})
