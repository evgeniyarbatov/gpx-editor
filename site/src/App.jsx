import { useEffect, useMemo, useState } from 'react'
import MapView from './MapView.jsx'
import { trackError } from './gpx/error.js'
import { pathDistanceMeters } from './gpx/geo.js'
import { parseGpxPoints } from './gpx/parse.js'
import { simplifyRdp } from './gpx/simplify.js'
import { splitPoints } from './gpx/split.js'

const POINT_OPTIONS = [200, 500, 1000]

const formatCount = (value) => value.toLocaleString()
const formatKm = (meters) => `${(meters / 1000).toFixed(1)} km`
const formatMeters = (meters) => `${meters.toFixed(1)} m`

function Choice({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        selected
          ? 'border-black bg-black text-white'
          : 'border-black/15 bg-white text-black hover:border-black'
      }`}
    >
      {children}
    </button>
  )
}

function App() {
  const [rawPoints, setRawPoints] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [reverseRoute, setReverseRoute] = useState(false)
  const [pointsPerFile, setPointsPerFile] = useState(POINT_OPTIONS[1])
  const [startFromBeginning, setStartFromBeginning] = useState(true)
  const [startIndex, setStartIndex] = useState(0)
  const [toleranceMeters, setToleranceMeters] = useState(0)

  const oriented = useMemo(() => {
    if (!rawPoints) {
      return null
    }
    return reverseRoute ? [...rawPoints].reverse() : rawPoints
  }, [rawPoints, reverseRoute])

  const resolvedStart = startFromBeginning ? 0 : startIndex

  const cropped = useMemo(() => {
    if (!oriented) {
      return null
    }
    return oriented.slice(resolvedStart)
  }, [oriented, resolvedStart])

  const simplified = useMemo(() => {
    if (!cropped) {
      return null
    }
    return simplifyRdp(cropped, toleranceMeters)
  }, [cropped, toleranceMeters])

  const error = useMemo(() => {
    if (!cropped || !simplified) {
      return null
    }
    return trackError(cropped, simplified.indices)
  }, [cropped, simplified])

  const originalDistance = useMemo(
    () => (cropped ? pathDistanceMeters(cropped) : 0),
    [cropped],
  )
  const simplifiedDistance = useMemo(
    () => (simplified ? pathDistanceMeters(simplified.points) : 0),
    [simplified],
  )

  const segments = useMemo(() => {
    if (!simplified?.points.length) {
      return []
    }

    return splitPoints(simplified.points, pointsPerFile).map((segment) => ({
      ...segment,
      url: URL.createObjectURL(
        new Blob([segment.gpx], { type: 'application/gpx+xml' }),
      ),
    }))
  }, [simplified, pointsPerFile])

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
      setStartIndex(0)
      setStartFromBeginning(true)
      setReverseRoute(false)
      setToleranceMeters(0)
    } catch (error_) {
      setRawPoints(null)
      setFileName('')
      setParseError(error_.message || 'Unable to read GPX file')
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 text-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            GPX Editor for Ultrarunners
          </h1>
          <p className="max-w-3xl text-sm text-black/70">
            Simplify a track until it fits your watch, then split it. The map
            shows how far the simplified line drifts from the original.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          {oriented && simplified && error ? (
            <MapView
              fitId={fileName}
              original={oriented}
              startIndex={resolvedStart}
              simplified={simplified.points}
              errorSegments={error.segments}
              errorScale={Math.max(toleranceMeters, error.max, 1)}
              pickStart={!startFromBeginning}
              onPickStartIndex={setStartIndex}
            />
          ) : (
            <div className="flex h-[min(70vh,720px)] min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-black/20 bg-black/[0.02] p-6 text-sm text-black/55">
              Upload a GPX file to see the track, simplification error, and
              splits.
            </div>
          )}

          <section className="flex flex-col gap-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
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
              {parseError && <p className="text-xs text-black">{parseError}</p>}
            </div>

            {simplified && error && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4">
                <Stat
                  label="Points"
                  value={`${formatCount(cropped.length)} → ${formatCount(simplified.points.length)}`}
                />
                <Stat
                  label="Files"
                  value={`${formatCount(segments.length)} × ${pointsPerFile}`}
                />
                <Stat label="Max error" value={formatMeters(error.max)} />
                <Stat label="Mean error" value={formatMeters(error.mean)} />
                <Stat label="Original" value={formatKm(originalDistance)} />
                <Stat
                  label="Simplified"
                  value={formatKm(simplifiedDistance)}
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Accuracy
                </label>
                <span className="text-sm font-medium">
                  {toleranceMeters.toFixed(1)} m
                </span>
              </div>
              <input
                className="accuracy-slider w-full"
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={toleranceMeters}
                onChange={(event) =>
                  setToleranceMeters(Number(event.target.value))
                }
                disabled={!rawPoints}
              />
              <p className="text-xs text-black/55">
                Max allowed drift from the original track. Raise it until point
                count and file count look right.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.22em]">
                Points per file
              </label>
              <div className="flex flex-wrap gap-2">
                {POINT_OPTIONS.map((option) => (
                  <Choice
                    key={option}
                    selected={pointsPerFile === option}
                    onClick={() => setPointsPerFile(option)}
                  >
                    {option}
                  </Choice>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Reverse direction
              </span>
              <div className="flex items-center gap-2">
                <Choice
                  selected={!reverseRoute}
                  onClick={() => {
                    setReverseRoute(false)
                    setStartIndex(0)
                  }}
                >
                  No
                </Choice>
                <Choice
                  selected={reverseRoute}
                  onClick={() => {
                    setReverseRoute(true)
                    setStartIndex(0)
                  }}
                >
                  Yes
                </Choice>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Start from beginning
              </span>
              <div className="flex items-center gap-2">
                <Choice
                  selected={startFromBeginning}
                  onClick={() => setStartFromBeginning(true)}
                >
                  Yes
                </Choice>
                <Choice
                  selected={!startFromBeginning}
                  onClick={() => setStartFromBeginning(false)}
                >
                  No
                </Choice>
              </div>
              {!startFromBeginning && (
                <p className="text-xs text-black/55">
                  Click the track on the map to set the start. Unused prefix is
                  dashed.
                </p>
              )}
            </div>

            {rawPoints && segments.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Download
                </h2>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {segments.map((segment, index) => (
                    <a
                      key={`${segment.distanceKm}-${index}`}
                      href={segment.url}
                      download={`${segment.distanceKm}km.gpx`}
                      className="flex items-center justify-between rounded-xl border border-black/15 px-4 py-3 text-sm font-medium transition hover:border-black"
                    >
                      <span>Segment {index + 1}</span>
                      <span className="text-black/55">
                        {segment.distanceKm} km · {formatCount(segment.pointCount)}{' '}
                        pts
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

export default App
