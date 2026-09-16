import { describe, expect, it } from 'vitest'
import {
  distanceMeters,
  findClosestIndex,
  pathDistanceMeters,
} from './geo.js'

describe('distanceMeters', () => {
  it('is ~0 for the same point', () => {
    const point = { lat: 1.3, lng: 103.8 }
    expect(distanceMeters(point, point)).toBeLessThan(1e-6)
  })

  it('treats one degree of latitude as about 111 km', () => {
    const km = distanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }) / 1000
    expect(km).toBeGreaterThan(110)
    expect(km).toBeLessThan(112)
  })
})

describe('pathDistanceMeters', () => {
  it('sums consecutive legs', () => {
    const points = [
      { lat: 1.3, lng: 103.8 },
      { lat: 1.31, lng: 103.8 },
      { lat: 1.32, lng: 103.8 },
    ]
    const first = distanceMeters(points[0], points[1])
    const second = distanceMeters(points[1], points[2])
    expect(pathDistanceMeters(points)).toBeCloseTo(first + second, 6)
  })
})

describe('findClosestIndex', () => {
  it('returns the nearest track point', () => {
    const points = [
      { lat: 1.3, lng: 103.8 },
      { lat: 1.31, lng: 103.8 },
      { lat: 1.32, lng: 103.8 },
    ]
    expect(
      findClosestIndex(points, { lat: 1.311, lng: 103.8 }),
    ).toBe(1)
  })
})
