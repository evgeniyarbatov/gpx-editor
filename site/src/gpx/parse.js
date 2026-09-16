export const parseGpxPoints = (text) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Unable to parse GPX file')
  }

  const nodes = Array.from(doc.getElementsByTagNameNS('*', 'trkpt'))
  const points = nodes
    .map((node) => ({
      lat: Number(node.getAttribute('lat')),
      lng: Number(node.getAttribute('lon')),
    }))
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))

  if (!points.length) {
    throw new Error('No track points found in GPX file')
  }

  return points
}
