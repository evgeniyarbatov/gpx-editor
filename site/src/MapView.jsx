import { useEffect, useRef } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { errorFillColor, visibleErrorSegments } from './gpx/error.js'

function FitTrack({ positions, fitId }) {
  const map = useMap()
  const lastFitId = useRef(null)

  useEffect(() => {
    if (!positions.length || lastFitId.current === fitId) {
      return
    }
    lastFitId.current = fitId
    if (positions.length === 1) {
      map.setView(positions[0], 14)
      return
    }
    map.fitBounds(positions, { padding: [32, 32], maxZoom: 16 })
  }, [fitId, map, positions])

  return null
}

function MapView({
  fitId,
  original,
  simplified,
  errorSegments,
  errorScale,
}) {
  const originalLatLngs = original.map((point) => [point.lat, point.lng])
  const simplifiedLatLngs = simplified.map((point) => [point.lat, point.lng])
  const startPoint = original[0]
  const ribbons = visibleErrorSegments(errorSegments)
  const legendMax = Math.max(errorScale, 1)

  return (
    <div className="relative h-[min(58vh,560px)] min-h-[280px] overflow-hidden rounded-2xl border border-black/10 sm:min-h-[360px]">
      <MapContainer
        key={fitId}
        center={originalLatLngs[0] || [0, 0]}
        zoom={12}
        scrollWheelZoom
        preferCanvas
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitTrack positions={originalLatLngs} fitId={fitId} />
        {ribbons.map((segment) => (
          <Polygon
            key={`${segment.from}-${segment.to}`}
            positions={segment.latlngs}
            pathOptions={{
              color: errorFillColor(segment.maxError, legendMax),
              weight: 0,
              fillColor: errorFillColor(segment.maxError, legendMax),
              fillOpacity: 0.9,
            }}
          />
        ))}
        {originalLatLngs.length > 1 && (
          <Polyline
            positions={originalLatLngs}
            pathOptions={{ color: '#6b6b6b', weight: 3, opacity: 0.85 }}
          />
        )}
        {simplifiedLatLngs.length > 1 && (
          <Polyline
            positions={simplifiedLatLngs}
            pathOptions={{ color: '#111111', weight: 4, opacity: 0.95 }}
          />
        )}
        {startPoint && (
          <CircleMarker
            center={[startPoint.lat, startPoint.lng]}
            radius={7}
            pathOptions={{
              color: '#111111',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 3,
            }}
          />
        )}
      </MapContainer>
      <div
        className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-[11px] shadow-sm"
        data-testid="map-legend"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-black/60">
            <span className="h-0.5 w-5 bg-[#6b6b6b]" />
            Original
          </span>
          <span className="flex items-center gap-1.5 text-black/60">
            <span className="h-0.5 w-5 bg-[#111111]" />
            Simplified
          </span>
        </div>
        {ribbons.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-black/60">Error</span>
            <span
              className="h-2 w-16 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(30,150,36,0.85), rgba(240,0,36,0.85))',
              }}
            />
            <span className="text-black/60">{legendMax.toFixed(0)} m</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapView
