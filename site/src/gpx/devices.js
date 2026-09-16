export const DEVICES = [
  { id: 'polar', label: 'Polar', pointsPerFile: 500 },
  { id: 'garmin', label: 'Garmin', pointsPerFile: 1000 },
]

export const DEFAULT_DEVICE_ID = 'polar'

export const deviceById = (id) =>
  DEVICES.find((device) => device.id === id) ?? DEVICES[0]
