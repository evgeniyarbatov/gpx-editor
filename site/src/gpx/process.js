import { trackError } from './error.js'
import { pathDistanceMeters } from './geo.js'
import { simplifyRdp } from './simplify.js'
import { splitPoints } from './split.js'

export const processTrack = ({
  points,
  reverseRoute = false,
  startIndex = 0,
  startFromBeginning = true,
  toleranceMeters = 0,
  pointsPerFile = 500,
}) => {
  const oriented = reverseRoute ? [...points].reverse() : points
  const resolvedStart = startFromBeginning ? 0 : startIndex
  const cropped = oriented.slice(resolvedStart)
  const simplified = simplifyRdp(cropped, toleranceMeters)
  const error = trackError(cropped, simplified.indices)
  const segments = splitPoints(simplified.points, pointsPerFile)

  return {
    oriented,
    resolvedStart,
    cropped,
    simplified,
    error,
    originalDistance: pathDistanceMeters(cropped),
    simplifiedDistance: pathDistanceMeters(simplified.points),
    segments,
  }
}
