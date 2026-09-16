import { perpendicularDistance, projectToMeters } from './geo.js'

export const simplifyRdp = (points, epsilonMeters) => {
  if (points.length <= 2 || epsilonMeters <= 0) {
    return {
      points,
      indices: points.map((_, index) => index),
    }
  }

  const projected = projectToMeters(points)
  const keep = new Array(points.length).fill(false)
  keep[0] = true
  keep[points.length - 1] = true

  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [start, end] = stack.pop()
    let maxDistance = 0
    let maxIndex = start
    const startPoint = projected[start]
    const endPoint = projected[end]

    for (let index = start + 1; index < end; index += 1) {
      const distance = perpendicularDistance(
        projected[index],
        startPoint,
        endPoint,
      )
      if (distance > maxDistance) {
        maxDistance = distance
        maxIndex = index
      }
    }

    if (maxDistance > epsilonMeters) {
      keep[maxIndex] = true
      stack.push([start, maxIndex], [maxIndex, end])
    }
  }

  const indices = []
  const simplified = []
  keep.forEach((shouldKeep, index) => {
    if (shouldKeep) {
      indices.push(index)
      simplified.push(points[index])
    }
  })

  return { points: simplified, indices }
}
