import gpxpy
import base64

import streamlit as st

from utils import reverse_gpx, split_gpx


def create_download_link(gpx, distance):
    b64 = base64.b64encode(gpx.encode()).decode()
    href = f'<a href="data:application/octet-stream;base64,{b64}" download="{distance}km.gpx">{distance}km.gpx</a>'
    return href


def render_gpx_slits(gpx, points_per_file, start_lat, start_lng):
    gpx_segments = split_gpx(gpx, points_per_file, start_lat, start_lng)
    for distance, gpx_segment in gpx_segments:
        st.markdown(create_download_link(gpx_segment, distance), unsafe_allow_html=True)


st.title("GPX Editor")

uploaded_file = st.file_uploader("GPX file", type=["gpx"])
points_per_file = st.selectbox("How many points per file?", [200, 500, 1000], index=0)

if uploaded_file is not None:
    gpx_file = uploaded_file.read()
    gpx = gpxpy.parse(gpx_file)

    reverse_choice = st.radio(
        "Reverse direction?",
        ("Yes", "No"),
        index=1,
    )
    if reverse_choice == "Yes":
        gpx = reverse_gpx(gpx)
        st.success("GPX file reversed")
    else:
        st.info("GPX file NOT reversed")

    start_choice = st.radio(
        "Start from the beginning of the GPX file?",
        ("Yes", "No"),
        index=0,
    )
    start_lat, start_lng = None, None
    if start_choice == "Yes":
        st.info("Using GPX starting point")
    else:
        start_lat = st.number_input(
            "Start latitude:",
            value=1.3097970339490435,
            format="%.6f",
            step=0.000001,
        )
        start_lng = st.number_input(
            "Start longitude:",
            value=103.89455470068188,
            format="%.6f",
            step=0.000001,
        )
        st.success("Using custom starting point")

    render_gpx_slits(gpx, points_per_file, start_lat, start_lng)
