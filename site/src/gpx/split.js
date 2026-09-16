import { buildGpx } from './build.js'
import { distanceMeters } from './geo.js'

export const splitPoints = (points, pointsPerFile) => {
  const segments = []
  let distance = 0
  let currentPoints = []
  let pointCount = 0
  let previousPoint = null

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index]

    if (pointCount > 0 && previousPoint) {
      distance += distanceMeters(previousPoint, point)
    }

    if (pointCount > 0 && pointCount % pointsPerFile === 0) {
      segments.push({
        distanceKm: Math.round(distance / 1000),
        pointCount: currentPoints.length,
        gpx: buildGpx(currentPoints),
      })
      currentPoints = []
    }

    currentPoints.push(point)
    previousPoint = point
    pointCount += 1
  }

  if (currentPoints.length) {
    segments.push({
      distanceKm: Math.round(distance / 1000),
      pointCount: currentPoints.length,
      gpx: buildGpx(currentPoints),
    })
  }

  return segments
}
