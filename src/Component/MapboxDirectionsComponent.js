import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { GeolocateControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import distance from '@turf/distance';
import { point } from 'turf';

const cspWorkerUrl = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;

mapboxgl.accessToken = 'pk.eyJ1IjoibHV2MjEwMTIiLCJhIjoiY2xrd2h4MTRnMDNocTNjbnphMHIyOGYxbCJ9.1cAcp80juY-TkemwZ9UPOw';

const MapboxDirectionsComponent = ({ origin, destination }) => {
  const [instructions, setInstructions] = useState([]);
  const [userCoordinates, setuserCoordinates] = useState([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isNavigationStarted, setNavigationStarted] = useState(false);

  const mapContainerRef = useRef(null);
  const geolocateControlRef = useRef(null);
  const mapRef = useRef(null);

  // Function to remove the navigation line
  const removeNavigationLine = () => {
    const map = mapRef.current;
    map.removeLayer('route');
    map.removeSource('route');
  };

  const createMarkers = () => {
    const map = mapRef.current;

    // Add the green marker for the starting point
    new mapboxgl.Marker({
      color: 'limegreen',
    })
      .setLngLat(origin)
      .addTo(map)
      .setPopup(new mapboxgl.Popup().setText('Starting Point'));

    // Add the red marker for the destination point
    new mapboxgl.Marker({
      color: 'red',
    })
      .setLngLat(destination)
      .addTo(map)
      .setPopup(new mapboxgl.Popup().setText('Destination Point'));
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/luv21012/clky5i0qg006v01ph6el85bgj',
      center: [80.1223289, 12.9172955],
      zoom: 15,
      pitch: 25,
    });

    map.addControl(new mapboxgl.NavigationControl());

    const geolocateControl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true, // Enable tracking user's location
    });

    map.addControl(geolocateControl);
    geolocateControlRef.current = geolocateControl;

    mapRef.current = map; // Store the map instance in the ref

    return () => {
      map.remove();
    };
  }, []);

  const drawNavigationLine = (coordinates) => {
    const map = mapRef.current;

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

  const handleStartNavigation = () => {
    setNavigationStarted(true);

    // Start tracking the user's location
    const geolocateControl = geolocateControlRef.current;
    geolocateControl.trigger();

    // Add markers for starting and destination points
    // createMarkers();
  };

  useEffect(() => {
    const map = mapRef.current; // Retrieve the map instance from the ref

    if (origin && destination) {
      // Fetch directions from the Mapbox Directions API
      const fetchDirections = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
          );

          const data = await response.json();
          console.log('Directions API Response:', data);



          if (
            data.routes &&
            data.routes.length > 0 &&
            data.routes[0].legs[0].steps &&
            data.routes[0].legs[0].steps.length > 0
          ) {
            setInstructions(data.routes[0].legs[0].steps);
            console.log(data.routes[0].legs[0].steps);
            // Extract the coordinates from the instructions and draw the navigation line
            const coordinates = data.routes[0].geometry.coordinates;
            drawNavigationLine(coordinates);

            // Initialize instruction display
            setCurrentInstructionIndex(0);
          } else {
            console.error('Error fetching directions: Invalid API response');
          }
        } catch (error) {
          console.error('Error fetching directions:', error);
        }
      };

      fetchDirections();
      createMarkers();
    }

    if (isNavigationStarted) {
      const geolocateControl = geolocateControlRef.current;

      const geolocateHandler = (position) => {
        setuserCoordinates([position.coords.latitude, position.coords.longitude]);

        if (currentInstructionIndex < instructions.length - 1) {
          const currentStep = instructions[currentInstructionIndex];
          const stepCoordinates = currentStep.maneuver.location;

          const from = point([userCoordinates[1], userCoordinates[0]]);
          const to = point([stepCoordinates[1], stepCoordinates[0]]);
          const distanceToStep = distance(from, to);

          console.log('Distance between user and step: ' + distanceToStep);

          if (distanceToStep < 20) {
            setCurrentInstructionIndex(currentInstructionIndex + 1);
          }
        } else {
          // All instructions completed, remove the navigation line
          removeNavigationLine();
        }
      };

      geolocateControl.on('geolocate', geolocateHandler);

      return () => {
        geolocateControl.off('geolocate', geolocateHandler);
      };
    }
  }, [origin, destination, isNavigationStarted, userCoordinates, instructions, currentInstructionIndex]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '300px', marginBottom: '8px' }} />

      {/* Display the "Start" button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        {!isNavigationStarted && (
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
            }}
            onClick={handleStartNavigation}
          >
            Start Navigation
          </button>
        )}
      </div>
      {isNavigationStarted && instructions.length > 0 && (
        <div style={{ width: '100%', maxWidth: '400px', padding: '10px', border: '1px solid #ccc', marginTop: '8px' }}>
          <h3>Current Instruction</h3>
          <p>{instructions[currentInstructionIndex].maneuver.instruction}</p>
        </div>
      )}
    </div>
  );
};

export default MapboxDirectionsComponent;
