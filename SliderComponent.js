/**
 * SliderComponent.js
 *
 * A functional React component to render sliders for controlling the image slice,
 * contrast, and EPSI dataset. It allows users to adjust these parameters and sends
 * the updated values to the parent component through callback props.
 *
 * @version 1.0.0
 * @author Benjamin Yoon
 * @date 2024-02-02
 */

import React, { useState } from 'react';

function SliderComponent({ onSliderChange, onContrastChange, onEpsiChange }) {
  // State hooks for each slider's value and the EPSI toggle.
  const [sliderValue, setSliderValue] = useState(10); // Initial slider value
  const [contrastValue, setContrastValue] = useState(1); // Initial contrast value
  const [epsiValue, setEpsiValue] = useState(1); // Initial EPSI value
  const [isEpsiOn, setIsEpsiOn] = useState(false); // Initial EPSI toggle state

  // Handler for changes to the image slice slider.
  const handleSliderChange = (event) => {
    const newValue = event.target.value;
    setSliderValue(newValue);
    onSliderChange(newValue, contrastValue); // Invoke callback with new value
  };

  // Handler for changes to the contrast slider.
  const handleContrastChange = (event) => {
    const newContrastValue = parseFloat(event.target.value);
    setContrastValue(newContrastValue);
    onContrastChange(sliderValue, newContrastValue); // Invoke callback with new value
  };

  // Handler for changes to the EPSI dataset slider.
  const handleEpsiChange = (event) => {
    const newEpsiValue = parseInt(event.target.value);
    setEpsiValue(newEpsiValue);
    onEpsiChange(newEpsiValue); // Invoke callback with new value
  };

  // JSX to render the slider interface.
  return (
    <div className="slider-container">
      <h2>Image Slice</h2>
      <input
        type="range"
        min="1"
        max={20}
        value={sliderValue}
        onChange={handleSliderChange}
      />
      <p>Slider Value: {sliderValue}</p>

      <h2>Contrast</h2>
      <input
        type="range"
        min="0.1"
        max="2.5"
        step="0.1"
        value={contrastValue}
        onChange={handleContrastChange}
      />
      <p>Contrast Value: {contrastValue}</p>

      <h2>EPSI Dataset</h2>
      <input
        type="range"
        min="0"
        max={17}
        value={epsiValue}
        onChange={handleEpsiChange}
      />
      <p>EPSI Value: {epsiValue}</p>

      <button onClick={() => setIsEpsiOn(!isEpsiOn)}>
        {isEpsiOn ? "EPSI OFF" : "EPSI ON"}
      </button>
    </div>
  );
}

export default SliderComponent; 