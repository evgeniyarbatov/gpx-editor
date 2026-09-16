const GPX_NS = 'http://www.topografix.com/GPX/1/1'
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance'
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/'

export const buildGpx = (points) => {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx', null)
  const gpx = doc.documentElement
  gpx.setAttribute('creator', 'StravaGPX')
  gpx.setAttributeNS(XMLNS_NS, 'xmlns:xsi', XSI_NS)
  gpx.setAttributeNS(XSI_NS, 'xsi:schemaLocation', `${GPX_NS} ${GPX_NS}/gpx.xsd`)
  gpx.setAttribute('version', '1.1')

  const trk = doc.createElementNS(GPX_NS, 'trk')
  const trkseg = doc.createElementNS(GPX_NS, 'trkseg')
  trk.appendChild(trkseg)
  gpx.appendChild(trk)

  points.forEach((point) => {
    const trkpt = doc.createElementNS(GPX_NS, 'trkpt')
    trkpt.setAttribute('lat', String(point.lat))
    trkpt.setAttribute('lon', String(point.lng))
    trkseg.appendChild(trkpt)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>${new XMLSerializer().serializeToString(doc)}`
}
