import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { GeolocateControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import NavigationInstructions from './NavigationInstructions';
import Geolib from 'geolib'; // Import the geolib libraryns';

const cspWorkerUrl = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;

mapboxgl.accessToken = 'pk.eyJ1IjoibHV2MjEwMTIiLCJhIjoiY2xrd2h4MTRnMDNocTNjbnphMHIyOGYxbCJ9.1cAcp80juY-TkemwZ9UPOw';

mapboxgl.workerClass = cspWorkerUrl;

const MapboxDirectionsComponent = ({ origin, destination }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const arrowMarkerRef = useRef(null);
  const [instructions, setInstructions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/luv21012/clky5i0qg006v01ph6el85bgj',
      center: [80.1223289, 12.9172955],
      zoom: 15,
      pitch: 25,
    });

    const geolocate = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.addControl(geolocate);

    const drawNavigationLine = (coordinates) => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    };

    if (origin && destination) {
      // Fetch directions from the Mapbox Directions API
      const fetchDirections = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
          );
    
          const data = await response.json();
          console.log('Directions API Response:', data);
    
          if (data.routes && data.routes.length > 0 && data.routes[0].legs[0].steps && data.routes[0].legs[0].steps.length > 0) {
            setInstructions(data.routes[0].legs[0].steps); // Update the instructions state
    
            // Extract the coordinates from the instructions and draw the navigation line
            const coordinates = data.routes[0].geometry.coordinates;
            drawNavigationLine(coordinates);
    
            // Add a marker at the starting location
            new mapboxgl.Marker({
              color: 'limegreen',
            })
              .setLngLat([origin[0], origin[1]])
              .addTo(map)
              .setPopup(new mapboxgl.Popup().setText('Starting Point'));
    
            // Add a marker at the destination location
            new mapboxgl.Marker({
              color: 'red', // Set the color of the marker to red
            })
              .setLngLat([destination[0], destination[1]])
              .addTo(map)
              .setPopup(new mapboxgl.Popup().setText('Destination Point'));
          } else {
            console.error('Error fetching directions: Invalid API response');
          }
        } catch (error) {
          console.error('Error fetching directions:', error);
        }
      };
    
      fetchDirections();
    
      // Store the map instance in the ref
      mapRef.current = map;
    }

    return () => {
      map.remove();
    };
  }, [origin, destination]);

  const handleStartNavigation = () => {
    setShowInstructions(true);
  };


  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '75vh' }}>
      <div ref={mapContainerRef} style={{ flex: 1, width: '100%' }} />
      {showInstructions && (
        <div style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <NavigationInstructions instructions={instructions} />
        </div>
      )}
      {!showInstructions && (
        <button
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#007bff',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
          onClick={handleStartNavigation}
        >
          Start Navigation
        </button>
      )}
    </div>
  );
};

export default MapboxDirectionsComponent;
