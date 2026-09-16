export const parseDownloadedGpx = (xml) => {
  const points = []
  const tags = xml.matchAll(/<trkpt\b([^>]*)\/?>/gi)
  for (const tag of tags) {
    const lat = Number(/lat="([^"]+)"/i.exec(tag[1])?.[1])
    const lon = Number(/lon="([^"]+)"/i.exec(tag[1])?.[1])
    points.push({ lat, lng: lon })
  }
  return points
}
