import React, { useState, useEffect } from 'react';
import './Main.css'; // Import your CSS file

import MapboxDirectionsComponent from './MapboxDirectionsComponent';

const Main = () => {
  const initialPlaces = [
    { name: "International Guest House", coordinates: [80.1234, 12.3456] },
    { name: "Commerce Block", coordinates: [80.1196482, 12.9225965] },
    { name: "Martin Hall", coordinates: [80.118857, 12.9200416] },
    { name: "Margret Hall", coordinates: [80.1194167, 12.9203111] },
    { name: "Barnes Hall", coordinates: [80.119031, 12.9202077] },
    { name: "Student Centre", coordinates: [80.1227692, 12.9201743] },
    { name: "IBC", coordinates: [80.1189707, 12.918309] },
    { name: "Pavilion", coordinates: [80.1168207, 12.9192925] },
    { name: "Heber Chapel", coordinates: [80.1230878, 12.9197962] }
  ];

  const [origin, setOrigin] = useState(null); // Store user's current location
  const [destination, setDestination] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(true);

  useEffect(() => {
    // Automatically fetch the user's current location when the component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.longitude, position.coords.latitude];
          setOrigin(userLocation);
          setShowMap(true); // Show the default map when the user location is fetched
        },
        (error) => {
          console.error(error.message);
          setShowMap(true); // Still show the map even if geolocation fails
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setShowMap(true); // Still show the map even if geolocation is unsupported
    }
  }, []);

  function handleDestinationChange(event) {
    setDestination(event.target.value);
  }

  const handleSearch = () => {
    setShowSearchBox(false);

    // Find the selected destination object based on its name
    const selectedDestination = initialPlaces.find(place => place.name === destination);

    // Pass the coordinates of the selected destination to the MapboxDirections component
    setDestination(selectedDestination.coordinates);
  };

  return (
    <main>
      {showSearchBox && (
        <div className="search-box">
          <input
            type="text"
            list="destinationOptions"
            placeholder="Enter destination"
            onChange={handleDestinationChange}
          />
          <datalist id="destinationOptions">
            {initialPlaces.map((place, index) => (
              <option key={index} value={place.name} />
            ))}
          </datalist>
          <button onClick={handleSearch}>Find</button>
        </div>
      )}

      {!showSearchBox && origin && destination && (
        <div className="map-container">
          <MapboxDirectionsComponent
            origin={origin}
            destination={destination}
            // Add necessary props to control map size on mobile
            mapWidth="100%" // Set the map width to occupy the entire container on mobile
            mapHeight="300px" // Set a fixed height or adjust as needed for the best mobile view
          />
        </div>
      )}

      {/* Additional information cards */}
      <div className="college-info-container">
        <div className="college-info-card">
          <h2>St. Thomas Hall</h2>
          <p>The Hall entrance was built in memory of Mr. Alexander Duff Watson, who was a Scottish Missionary.</p>
<p>The present E-Block is earlier a campus school and also known as St.Thomas’s Annex.</p>

        </div>

        <div className="college-info-card">
          <h2>Selaiyur Hall</h2>
          <p>Oldest tree in MCC - skull tree which is located in Selaiyur Hall</p>
          <p>Moonshadow started in the year 1978-1979</p>
        </div>

        <div className="college-info-card">
          <h2>Martin Hall</h2>
          <p>It is the first & oldest women's hall...</p>
          <p>The center of the hall is the Palm Tree</p>
        </div>
        {/* Add more cards for other colleges if needed */}
      </div>
    </main>
  );
};

export default Main;
