import React, { useState, useEffect } from 'react';

import './App.css';
import SliderImageSlice from './components/SliderComponent'; // Custom Slider Component

function App() {
  return (
    <div className="App">
      <div className="sidebar">
        <h1>EPSI GUI</h1>
        <SliderImageSlice /> {/* Slider */}
      </div>
      <div className="image-container">
        {/* Image Display Here */}
      </div>
    </div>
  );
}

export default App;
