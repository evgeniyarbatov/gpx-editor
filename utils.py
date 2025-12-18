from geopy.distance import geodesic

import xml.dom.minidom
from xml.etree.ElementTree import Element, SubElement, tostring


def format_gpx(gpx, distance):
    gpx_file = xml.dom.minidom.parseString(
        tostring(gpx, encoding="unicode")
    ).toprettyxml()

    distance = round(distance / 1000.0)

    return (distance, gpx_file)


def create_gpx():
    gpx = Element(
        "gpx",
        {
            "creator": "StravaGPX",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd",
            "version": "1.1",
            "xmlns": "http://www.topografix.com/GPX/1/1",
        },
    )
    trk = SubElement(gpx, "trk")
    trkseg = SubElement(trk, "trkseg")
    return gpx, trkseg


def reverse_gpx(gpx):
    for track in gpx.tracks:
        for segment in track.segments:
            segment.points.reverse()
    return gpx


def find_closest_point(
    gpx,
    start_lat=None,
    start_lng=None,
):
    closest_point = None
    min_distance = float("inf")
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                distance = geodesic(
                    (point.latitude, point.longitude), (start_lat, start_lng)
                ).meters
                if distance < min_distance:
                    min_distance = distance
                    closest_point = point
    return str(closest_point.latitude), str(closest_point.longitude)


def split_gpx(
    gpx,
    points_per_file=200,
    start_lat=None,
    start_lng=None,
):
    split_gpx_files = []
    distance = 0
    gpx_out, trkseg_out = create_gpx()

    route_started = True
    if start_lat != None and start_lng != None:
        route_started = False
        start_lat, start_lng = find_closest_point(gpx, start_lat, start_lng)

    point_count = 0
    prev_lat, prev_lng = None, None

    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                lat, lng = str(point.latitude), str(point.longitude)

                if start_lat != None and start_lng != None:
                    if lat == start_lat and lng == start_lng:
                        route_started = True

                if not route_started:
                    continue

                if point_count > 0:
                    if prev_lat != None and prev_lng != None:
                        distance += geodesic((prev_lat, prev_lng), (lat, lng)).meters

                    if point_count % points_per_file == 0:
                        split_gpx_files.append(format_gpx(gpx_out, distance))
                        gpx_out, trkseg_out = create_gpx()

                SubElement(trkseg_out, "trkpt", attrib={"lat": lat, "lon": lng})

                prev_lat, prev_lng = lat, lng
                point_count += 1

    split_gpx_files.append(format_gpx(gpx_out, distance))

    return split_gpx_files
