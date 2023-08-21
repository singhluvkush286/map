import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { GeolocateControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const cspWorkerUrl = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;

mapboxgl.accessToken = 'pk.eyJ1IjoibHV2MjEwMTIiLCJhIjoiY2xrd2h4MTRnMDNocTNjbnphMHIyOGYxbCJ9.1cAcp80juY-TkemwZ9UPOw';

mapboxgl.workerClass = cspWorkerUrl;

const MapboxDirectionsComponent = ({ origin, destination }) => {
  const [instructions, setInstructions] = useState([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0); 
  const [isNavigationStarted, setNavigationStarted] = useState(false); 

  const mapContainerRef = useRef(null);
  const geolocateControlRef = useRef(null);
  const mapRef = useRef(null);

  

  const updateUserLocation = (event) => {
    const userCoordinates = [event.coords.longitude, event.coords.latitude];

    if (currentInstructionIndex < instructions.length - 1) {
      const currentStep = instructions[currentInstructionIndex];
      const stepCoordinates = currentStep.maneuver.location;

      const distanceToStep = mapRef.current.distance(userCoordinates, stepCoordinates);

      if (distanceToStep < 20) { // Adjust the threshold as needed
        setCurrentInstructionIndex(currentInstructionIndex + 1);
      }
    }
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

  const createArrowElement = (color) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.innerHTML = `
      <path fill="${color}" d="M0 0h24v24H0z" fill-opacity="0"/>
      <path d="M12 2c-.14 0-.27.03-.39.08l-.52.23-.65.34-.82.53-.9.68L7 4v16h10V4l-1.72.57-.9-.68-.82-.53-.65-.34-.52-.23C12.27 2.03 12.14 2 12 2zm-2 3.5l1.79 1.03L12 7l1.21-.47L14 5.5l-1-.63-1 .63zm4 11l-3-3v2H9v-2l-3 3 3 3v-2h6v2l3-3zm-3-11.97L12 8.6l-.79-.46-.71-.41V5.53l-.29-.09L11 5l.71-.41L12 4.4l.29.09L13 5v1.66l-.71.41zM13 12v1H9v-1l-1-1v3h6v-3l-1 1zm-1-4v-.66l-.71-.41L11 6.4l-.29.09L10 7V6.52l-.71.41-.71.41-.79.46 1 1 .79.46.71.41V8l.21-.08L12 7.94zm3.44 7.28l.71-.41.71-.41.79-.46-1-1-.79-.46-.71-.41V16l-.21.08L14 16.06v.66l.71.41.71.41.79.46-1-1-.79-.46-.71-.41V17l-.21.08z"/>
    `;
    return svg;
  };
  

  const drawNavigationLine = (coordinates) => {
    const map = mapRef.current; // Retrieve the map instance from the ref
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

          if (data.routes && data.routes.length > 0 && data.routes[0].legs[0].steps && data.routes[0].legs[0].steps.length > 0) {
            setInstructions(data.routes[0].legs[0].steps);

            // Extract the coordinates from the instructions and draw the navigation line
            const coordinates = data.routes[0].geometry.coordinates;
            drawNavigationLine(coordinates);

            // Add the arrow marker for the starting point
            new mapboxgl.Marker({
              element: createArrowElement('limegreen'),
            })
              .setLngLat(origin)
              .addTo(map)
              .setPopup(new mapboxgl.Popup().setText('Starting Point'));

            // Add the arrow marker for the destination point
            new mapboxgl.Marker({
              element: createArrowElement(),
            })
              .setLngLat(destination)
              .addTo(map)
              .setPopup(new mapboxgl.Popup().setText('Destination Point'));

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
    }

    if (isNavigationStarted) {
      const geolocateControl = geolocateControlRef.current;
  
      const geolocateHandler = () => {
        navigator.geolocation.watchPosition(updateUserLocation);
      };
  
      geolocateControl.on('geolocate', geolocateHandler);
  
      return () => {
        geolocateControl.off('geolocate', geolocateHandler);
      };
    }
  }, [origin, destination, isNavigationStarted]);

 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '600px', marginBottom: '8px' }} />

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

      {/* Display current instruction */}
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