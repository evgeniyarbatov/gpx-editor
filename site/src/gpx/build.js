export const buildGpx = (points) => {
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
