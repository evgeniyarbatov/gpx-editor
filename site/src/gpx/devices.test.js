import { describe, expect, it } from 'vitest'
import { DEFAULT_DEVICE_ID, DEVICES, deviceById } from './devices.js'

describe('devices', () => {
  it('hardcodes Polar at 500 points and Garmin at 1000', () => {
    expect(deviceById('polar')).toEqual({
      id: 'polar',
      label: 'Polar',
      pointsPerFile: 500,
    })
    expect(deviceById('garmin')).toEqual({
      id: 'garmin',
      label: 'Garmin',
      pointsPerFile: 1000,
    })
    expect(DEFAULT_DEVICE_ID).toBe('polar')
    expect(DEVICES.map((device) => device.id)).toEqual(['polar', 'garmin'])
  })
})
