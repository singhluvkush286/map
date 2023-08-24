import React, { useEffect, useState } from 'react';

const NavigationInstructions = ({ instructions }) => {
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);

  const updateUserLocation = (event) => {
    const userCoordinates = [event.coords.longitude, event.coords.latitude];

    if (currentInstructionIndex < instructions.length - 1) {
      const currentStep = instructions[currentInstructionIndex];
      const stepCoordinates = currentStep.maneuver.location;

      const distanceToStep = calculateDistance(userCoordinates, stepCoordinates);

      if (distanceToStep < 20) { // Adjust the threshold as needed
        setCurrentInstructionIndex(currentInstructionIndex + 1);
      }
    }
  };

  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(updateUserLocation);

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [currentInstructionIndex, instructions]);

  const calculateDistance = (coord1, coord2) => {
    // Calculate distance between two coordinates (you can use a library for this)
    // Return the distance in meters
    return 0; // Replace with your actual distance calculation
  };

  return (
    <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
      <h3>Navigation Instructions</h3>
      <p>{instructions[currentInstructionIndex]?.maneuver.instruction}</p>
    </div>
  );
};

export default NavigationInstructions;
