const EARTH_RADIUS_METERS = 6371000
const METERS_PER_DEG_LAT = 111320

export const distanceMeters = (from, to) => {
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const deltaLat = lat2 - lat1
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_METERS * c
}

export const pathDistanceMeters = (points) => {
  let distance = 0
  for (let index = 1; index < points.length; index += 1) {
    distance += distanceMeters(points[index - 1], points[index])
  }
  return distance
}

export const findClosestIndex = (points, target) => {
  let minDistance = Infinity
  let closestIndex = 0

  points.forEach((point, index) => {
    const distance = distanceMeters(point, target)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = index
    }
  })

  return closestIndex
}

export const projectToMeters = (points) => {
  const origin = points[0]
  const metersPerDegLng =
    METERS_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180)

  return points.map((point) => ({
    x: (point.lng - origin.lng) * metersPerDegLng,
    y: (point.lat - origin.lat) * METERS_PER_DEG_LAT,
  }))
}

export const perpendicularDistance = (point, start, end) => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y)
  }

  const t =
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
  const projectedX = start.x + t * dx
  const projectedY = start.y + t * dy
  return Math.hypot(point.x - projectedX, point.y - projectedY)
}
