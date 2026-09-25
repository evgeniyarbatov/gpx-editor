import { useEffect, useMemo, useState } from 'react'
import MapView from './MapView.jsx'
import { POINTS_PER_FILE } from './gpx/devices.js'
import { parseGpxPoints } from './gpx/parse.js'
import { processTrack } from './gpx/process.js'

const formatCount = (value) => value.toLocaleString()
const formatKm = (meters) => `${(meters / 1000).toFixed(1)} km`
const formatMeters = (meters) => `${meters.toFixed(1)} m`
const DEFAULT_TOLERANCE_METERS = 5

function DropZone({ error, onFile }) {
  const [over, setOver] = useState(false)

  return (
    <label
      htmlFor="gpx-file-input"
      onDragEnter={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return
        }
        setOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        onFile(event.dataTransfer.files?.[0])
      }}
      className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        over
          ? 'border-black bg-black/[0.04]'
          : 'border-black/20 bg-black/[0.02] hover:border-black/40'
      }`}
    >
      <p className="text-sm font-medium">Drop a GPX file here, or click to choose</p>
      <p className="text-xs text-black/55">
        Simplify until it fits your watch, then download the splits.
      </p>
      {error && (
        <p className="mt-2 text-xs text-black" data-testid="parse-error">
          {error}
        </p>
      )}
    </label>
  )
}

function App() {
  const [rawPoints, setRawPoints] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [toleranceMeters, setToleranceMeters] = useState(
    DEFAULT_TOLERANCE_METERS,
  )

  const processed = useMemo(() => {
    if (!rawPoints) {
      return null
    }
    return processTrack({
      points: rawPoints,
      toleranceMeters,
    })
  }, [rawPoints, toleranceMeters])

  const segments = useMemo(() => {
    if (!processed?.segments.length) {
      return []
    }

    return processed.segments.map((segment) => ({
      ...segment,
      url: URL.createObjectURL(
        new Blob([segment.gpx], { type: 'application/gpx+xml' }),
      ),
    }))
  }, [processed])

  useEffect(() => {
    return () => {
      segments.forEach((segment) => URL.revokeObjectURL(segment.url))
    }
  }, [segments])

  const loadGpxFile = async (file) => {
    if (!file) {
      return
    }

    try {
      const points = parseGpxPoints(await file.text())
      setRawPoints(points)
      setFileName(file.name)
      setParseError('')
      setToleranceMeters(DEFAULT_TOLERANCE_METERS)
    } catch (error_) {
      setRawPoints(null)
      setFileName('')
      setParseError(error_.message || 'Unable to read GPX file')
    }
  }

  return (
    <div className="min-h-screen px-5 py-8 text-black sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <input
          id="gpx-file-input"
          className="sr-only"
          data-testid="gpx-file-input"
          type="file"
          accept=".gpx"
          onChange={(event) => {
            loadGpxFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        {processed ? (
          <>
            <section className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <label
                htmlFor="gpx-file-input"
                className="shrink-0 cursor-pointer rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] hover:border-black"
              >
                Replace
              </label>
            </section>

            <MapView
              fitId={fileName}
              original={processed.cropped}
              simplified={processed.simplified.points}
              errorSegments={processed.error.segments}
              errorScale={Math.max(toleranceMeters, processed.error.max, 1)}
            />

            <section className="flex flex-col gap-3">
              <Stat
                testId="stat-points"
                data-from={processed.cropped.length}
                data-to={processed.simplified.points.length}
                label="Points"
                value={`${formatCount(processed.cropped.length)} → ${formatCount(processed.simplified.points.length)}`}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.22em]"
                    htmlFor="accuracy-slider"
                  >
                    Accuracy
                  </label>
                  <span className="text-sm font-medium">
                    {toleranceMeters.toFixed(1)} m
                  </span>
                </div>
                <input
                  id="accuracy-slider"
                  className="accuracy-slider w-full"
                  data-testid="accuracy-slider"
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={toleranceMeters}
                  onChange={(event) =>
                    setToleranceMeters(Number(event.target.value))
                  }
                />
                <p className="text-xs text-black/55">
                  Max drift from the original. Splits at {POINTS_PER_FILE}{' '}
                  points.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <Stat
                  testId="stat-files"
                  data-count={segments.length}
                  data-points-per-file={POINTS_PER_FILE}
                  data-device="garmin"
                  label="Files"
                  value={formatCount(segments.length)}
                />
                <Stat
                  testId="stat-max-error"
                  data-meters={processed.error.max}
                  label="Max error"
                  value={formatMeters(processed.error.max)}
                />
                <Stat
                  testId="stat-mean-error"
                  data-meters={processed.error.mean}
                  label="Mean error"
                  value={formatMeters(processed.error.mean)}
                />
                <Stat
                  testId="stat-original"
                  data-meters={processed.originalDistance}
                  label="Original"
                  value={formatKm(processed.originalDistance)}
                />
                <Stat
                  testId="stat-simplified"
                  data-meters={processed.simplifiedDistance}
                  label="Simplified"
                  value={formatKm(processed.simplifiedDistance)}
                />
              </div>
            </section>

            {segments.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Download
                </h2>
                <div
                  className="grid w-full gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]"
                  data-testid="download-list"
                >
                  {segments.map((segment, index) => (
                    <a
                      key={`${segment.distanceKm}-${index}`}
                      href={segment.url}
                      download={`${segment.distanceKm}km.gpx`}
                      data-testid={`download-segment-${index}`}
                      data-points={segment.pointCount}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/15 px-4 py-3 text-sm font-medium transition hover:border-black"
                    >
                      <span>Segment {index + 1}</span>
                      <span className="text-black/55">
                        {segment.distanceKm} km ·{' '}
                        {formatCount(segment.pointCount)} pts
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <DropZone error={parseError} onFile={loadGpxFile} />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, testId, ...data }) {
  return (
    <div className="flex flex-col gap-0.5" data-testid={testId} {...data}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

export default App
