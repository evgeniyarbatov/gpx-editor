import { describe, expect, it } from 'vitest'
import { POINTS_PER_FILE } from './devices.js'

describe('devices', () => {
  it('splits Garmin courses at 1000 points per file', () => {
    expect(POINTS_PER_FILE).toBe(1000)
  })
})
