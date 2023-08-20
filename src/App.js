import React, { useState } from 'react';
import './App.css';
import MapboxDirections from './Component/MapboxDirectionsComponent';
import Header from './Component/Header';
import Main from './Component/Main';

function App() {
    return (
    <div className="App">
      <Header/>
      <Main/>
    </div>
  );
  
}

export default App;