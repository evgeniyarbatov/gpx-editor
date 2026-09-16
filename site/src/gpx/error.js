import { perpendicularDistance, projectToMeters } from './geo.js'

const MAX_VISIBLE_SEGMENTS = 1000

export const trackError = (points, indices) => {
  if (points.length < 2 || indices.length < 2) {
    return { max: 0, mean: 0, segments: [] }
  }

  const projected = projectToMeters(points)
  const perPoint = new Array(points.length).fill(0)
  const segments = []

  for (let pair = 0; pair < indices.length - 1; pair += 1) {
    const from = indices[pair]
    const to = indices[pair + 1]
    const startPoint = projected[from]
    const endPoint = projected[to]
    let segmentMax = 0

    for (let index = from; index <= to; index += 1) {
      const distance = perpendicularDistance(
        projected[index],
        startPoint,
        endPoint,
      )
      perPoint[index] = distance
      if (distance > segmentMax) {
        segmentMax = distance
      }
    }

    segments.push({
      from,
      to,
      maxError: segmentMax,
      latlngs: points.slice(from, to + 1).map((point) => [point.lat, point.lng]),
    })
  }

  const max = perPoint.reduce((highest, value) => Math.max(highest, value), 0)
  const mean = perPoint.reduce((sum, value) => sum + value, 0) / perPoint.length

  return { max, mean, segments }
}

export const visibleErrorSegments = (segments) => {
  const withShape = segments.filter(
    (segment) => segment.maxError >= 0.5 && segment.latlngs.length >= 3,
  )
  if (withShape.length <= MAX_VISIBLE_SEGMENTS) {
    return withShape
  }

  return [...withShape]
    .sort((left, right) => right.maxError - left.maxError)
    .slice(0, MAX_VISIBLE_SEGMENTS)
}

export const errorFillColor = (meters, scale) => {
  const t = Math.min(1, meters / Math.max(scale, 1))
  const r = Math.round(30 + 210 * t)
  const g = Math.round(150 * (1 - t))
  return `rgba(${r}, ${g}, 36, 0.45)`
}
