import { useEffect, useMemo, useState } from 'react'

const POINT_OPTIONS = [200, 500, 1000]
const DEFAULT_LAT = 1.3097970339490435
const DEFAULT_LNG = 103.89455470068188
const EARTH_RADIUS_METERS = 6371000

const parseGpxPoints = (text) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Unable to parse GPX file')
  }

  const nodes = Array.from(doc.getElementsByTagNameNS('*', 'trkpt'))
  const points = nodes.map((node) => ({
    lat: Number(node.getAttribute('lat')),
    lng: Number(node.getAttribute('lon')),
  }))

  if (!points.length) {
    throw new Error('No track points found in GPX file')
  }

  return points
}

const distanceMeters = (from, to) => {
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

const findClosestIndex = (points, target) => {
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

const buildGpx = (points) => {
  const doc = document.implementation.createDocument('', '', null)
  const gpx = doc.createElement('gpx')
  gpx.setAttribute('creator', 'StravaGPX')
  gpx.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
  gpx.setAttribute(
    'xsi:schemaLocation',
    'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd',
  )
  gpx.setAttribute('version', '1.1')
  gpx.setAttribute('xmlns', 'http://www.topografix.com/GPX/1/1')

  const trk = doc.createElement('trk')
  const trkseg = doc.createElement('trkseg')
  trk.appendChild(trkseg)
  gpx.appendChild(trk)
  doc.appendChild(gpx)

  points.forEach((point) => {
    const trkpt = doc.createElement('trkpt')
    trkpt.setAttribute('lat', String(point.lat))
    trkpt.setAttribute('lon', String(point.lng))
    trkseg.appendChild(trkpt)
  })

  return new XMLSerializer().serializeToString(doc)
}

const splitPoints = (points, pointsPerFile, startIndex) => {
  const segments = []
  let distance = 0
  let currentPoints = []
  let pointCount = 0
  let previousPoint = null

  for (let index = startIndex; index < points.length; index += 1) {
    const point = points[index]

    if (pointCount > 0 && previousPoint) {
      distance += distanceMeters(previousPoint, point)
    }

    if (pointCount > 0 && pointCount % pointsPerFile === 0) {
      segments.push({
        distanceKm: Math.round(distance / 1000),
        gpx: buildGpx(currentPoints),
      })
      currentPoints = []
    }

    currentPoints.push(point)
    previousPoint = point
    pointCount += 1
  }

  segments.push({
    distanceKm: Math.round(distance / 1000),
    gpx: buildGpx(currentPoints),
  })

  return segments
}

function App() {
  const [rawPoints, setRawPoints] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [reverseRoute, setReverseRoute] = useState(false)
  const [pointsPerFile, setPointsPerFile] = useState(POINT_OPTIONS[0])
  const [startFromBeginning, setStartFromBeginning] = useState(true)
  const [startCoordinates, setStartCoordinates] = useState(
    `${DEFAULT_LAT}, ${DEFAULT_LNG}`,
  )

  const segments = useMemo(() => {
    if (!rawPoints) {
      return []
    }

    const points = reverseRoute ? [...rawPoints].reverse() : rawPoints
    const [startLat, startLng] = startCoordinates
      .split(',')
      .map((value) => Number(value.trim()))

    const startIndex = startFromBeginning
      ? 0
      : findClosestIndex(points, { lat: startLat, lng: startLng })
    const splitSegments = splitPoints(points, pointsPerFile, startIndex)

    return splitSegments.map((segment) => ({
      ...segment,
      url: URL.createObjectURL(
        new Blob([segment.gpx], { type: 'application/gpx+xml' }),
      ),
    }))
  }, [rawPoints, reverseRoute, pointsPerFile, startFromBeginning, startCoordinates])

  useEffect(() => {
    return () => {
      segments.forEach((segment) => URL.revokeObjectURL(segment.url))
    }
  }, [segments])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setRawPoints(null)
      setFileName('')
      setParseError('')
      return
    }

    try {
      const text = await file.text()
      const points = parseGpxPoints(text)
      setRawPoints(points)
      setFileName(file.name)
      setParseError('')
    } catch (error) {
      setRawPoints(null)
      setFileName('')
      setParseError(error.message || 'Unable to read GPX file')
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 text-black">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            GPX Editor for Ultrarunners
          </h1>
          <p className="max-w-3xl text-sm text-black/70">
            Built for long-distance runners who want absolute control over ultra
            GPX files. Split huge tracks, reverse direction, and pin a precise
            starting point for race planning.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em]">
                  GPX file
                </label>
                <input
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  type="file"
                  accept=".gpx"
                  onChange={handleFileChange}
                />
                {fileName && (
                  <p className="text-xs text-black/60">Loaded {fileName}</p>
                )}
                {parseError && (
                  <p className="text-xs text-black">{parseError}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em]">
                    Points per file
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POINT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPointsPerFile(option)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          pointsPerFile === option
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black hover:border-black'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                    Reverse direction
                  </span>
                  <div className="flex items-center gap-3">
                    {['No', 'Yes'].map((label) => {
                      const isYes = label === 'Yes'
                      return (
                        <label
                          key={label}
                          className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                            reverseRoute === isYes
                              ? 'border-black bg-black text-white'
                              : 'border-black/15 bg-white text-black'
                          }`}
                        >
                          <input
                            className="hidden"
                            type="radio"
                            name="reverse"
                            checked={reverseRoute === isYes}
                            onChange={() => setReverseRoute(isYes)}
                          />
                          {label}
                        </label>
                      )
                    })}
                  </div>
                  <p className="text-xs text-black/60">
                    {reverseRoute ? 'GPX file reversed' : 'GPX file not reversed'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Start from beginning
                </span>
                <div className="flex items-center gap-3">
                  {['Yes', 'No'].map((label) => {
                    const isYes = label === 'Yes'
                    return (
                      <label
                        key={label}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          startFromBeginning === isYes
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black'
                        }`}
                      >
                        <input
                          className="hidden"
                          type="radio"
                          name="start-point"
                          checked={startFromBeginning === isYes}
                          onChange={() => setStartFromBeginning(isYes)}
                        />
                        {label}
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-black/60">
                  {startFromBeginning
                    ? 'Using GPX starting point'
                    : 'Using custom starting point'}
                </p>
              </div>

              {!startFromBeginning && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em]">
                    Start coordinates (lat, lon)
                  </label>
                  <input
                    className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                    type="text"
                    value={startCoordinates}
                    onChange={(event) => setStartCoordinates(event.target.value)}
                    placeholder="1.309797, 103.894555"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-black bg-black p-6 text-white shadow-sm">
            <div className="flex h-full flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold">Ultra-ready splits</h2>
                <p className="mt-2 text-sm text-white/70">
                  Download each segment with its cumulative distance in the file
                  name.
                </p>
              </div>

              {!rawPoints && (
                <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/70">
                  Upload a GPX file to generate split files.
                </div>
              )}

              {rawPoints && segments.length > 0 && (
                <div className="flex flex-col gap-3">
                  {segments.map((segment, index) => (
                    <a
                      key={`${segment.distanceKm}-${index}`}
                      href={segment.url}
                      download={`${segment.distanceKm}km.gpx`}
                      className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white"
                    >
                      <span>Segment {index + 1}</span>
                      <span className="text-white/70">
                        {segment.distanceKm} km
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {rawPoints && segments.length === 0 && (
                <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/70">
                  No segments generated.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
