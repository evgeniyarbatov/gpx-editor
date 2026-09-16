export const COURSE = {
  start: { lat: 1.3, lng: 103.8 },
  northStep: 0.00008,
  spikeEast: 0.0004,
  beforeSpike: 250,
  afterSpike: 399,
}

export const makeCoursePoints = () => {
  const points = []
  const { start, northStep, spikeEast, beforeSpike, afterSpike } = COURSE

  for (let index = 0; index < beforeSpike; index += 1) {
    points.push({
      lat: start.lat + index * northStep,
      lng: start.lng,
    })
  }

  const spikeLat = start.lat + beforeSpike * northStep
  points.push({ lat: spikeLat, lng: start.lng + spikeEast })

  for (let index = 1; index <= afterSpike; index += 1) {
    points.push({
      lat: spikeLat + index * northStep,
      lng: start.lng,
    })
  }

  return points
}

export const courseGpx = (points = makeCoursePoints()) => {
  const trackPoints = points
    .map(
      (point) =>
        `      <trkpt lat="${point.lat.toFixed(7)}" lon="${point.lng.toFixed(7)}"></trkpt>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="fixture" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Test course</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>
`
}

export const COURSE_SPIKE_INDEX = COURSE.beforeSpike
export const COURSE_POINT_COUNT =
  COURSE.beforeSpike + 1 + COURSE.afterSpike
