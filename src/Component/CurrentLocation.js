import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const CurrentLocation = () => {
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHV2a3VzaDEyMyIsImEiOiJjbGtzazZkeXcwNDJqM2dvNHBmcHZrdXF6In0.momjBftdks2sw_GuG6g16Q';

    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [80.1223289, 12.9172955], // starting center in [lng, lat]
      zoom: 14 // starting zoom
    });

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    map.addControl(geolocateControl);

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} />;
};

export default CurrentLocation;
