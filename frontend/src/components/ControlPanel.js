/**
 * ControlPanel.js
 *
 * Provides interactive UI elements for the EPSI Visualization App, enabling
 * users to adjust image slice, contrast, and EPSI dataset values. This
 * component manages the application state for these parameters and updates
 * the display based on user input. Version 1.2.0 includes a refined UI with
 * vertical sliders for contrast and EPSI dataset adjustments.
 *
 * @version 1.2.0
 * @author Benjamin Yoon
 * @date 2024-04-12
 */

import React, { useState, useEffect } from 'react';

/**
 * Renders a set of UI controls comprising of sliders and displays for image slice
 * and dataset parameters. Adjustments made via the sliders are propagated upwards
 * to the parent component to update the visualization accordingly.
 */
function ControlPanel({ onSliderChange, onContrastChange, onEpsiChange, epsiValue }) {
  // States for slider values
  const [sliderValue, setSliderValue] = useState(3);
  const [contrastValue, setContrastValue] = useState(1);

  // Side effect for initializing and updating the slider value display
  useEffect(() => {
    const slider = document.getElementById('imageSliceSlider');
    const sliderValueDisplay = document.getElementById('sliderValueDisplay');

    const updateSliderValuePosition = () => {
      const percentage = (slider.value - slider.min) / (slider.max - slider.min);
      const sliderWidth = slider.getBoundingClientRect().width;
      const valueDisplayWidth = sliderValueDisplay.offsetWidth;

      const additionalOffset = 22 - slider.value;
      const leftPosition = percentage * sliderWidth - (valueDisplayWidth / 2) + additionalOffset;

      sliderValueDisplay.style.left = `${leftPosition}px`;
      sliderValueDisplay.textContent = slider.value;
    };

    updateSliderValuePosition();

    slider.addEventListener('input', updateSliderValuePosition);
    window.addEventListener('resize', updateSliderValuePosition);

    return () => {
      slider.removeEventListener('input', updateSliderValuePosition);
      window.removeEventListener('resize', updateSliderValuePosition);
    };
  }, []); // Dependency array left empty to denote effect should run on mount only

  // Event handlers for the sliders
  const handleSliderChange = (event) => {
    const newValue = event.target.value;
    setSliderValue(newValue);
    onSliderChange(newValue, contrastValue);
    const sliderValueDisplay = document.getElementById('sliderValueDisplay');
    sliderValueDisplay.textContent = newValue;
  };
  const handleContrastChange = (event) => {
    const newContrastValue = parseFloat(event.target.value);
    setContrastValue(newContrastValue);
    onContrastChange(sliderValue, newContrastValue);
  };
  const handleEpsiChange = (event) => {
    const newEpsiValue = parseInt(event.target.value);
    onEpsiChange(newEpsiValue);
  };

  // JSX rendering the component's UI, including vertical sliders
  return (
    <div>
      <div className="slider-under-top-panel">
        <input
          type="range"
          min="1"
          max="20"
          value={sliderValue}
          onChange={handleSliderChange}
          className="image-slice-slider"
          id="imageSliceSlider"
        />
        <div
          id="sliderValueDisplay"
          className="slider-value-display"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '-2.5em',
            color: '#6c6c70',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1em',
            padding: '2px 5px',
          }}
        >
          {sliderValue}
        </div>
      </div>
      <div className="slider-container">
        <div className="vertical-slider-container">
          <h2><label htmlFor="contrastSlider">Contrast: {contrastValue}</label></h2>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={contrastValue}
            onChange={handleContrastChange}
            className="vertical-slider"
            id="contrastSlider"
          />
        </div>

        <div className="vertical-slider-container">
          <h2><label htmlFor="epsiSlider">EPSI: {epsiValue}</label></h2>
          <input
            type="range"
            min="0"
            max={17}
            value={epsiValue}
            onChange={handleEpsiChange}
            className="vertical-slider"
            id="epsiSlider"
          />
        </div>
      </div>
    </div>
  );
}

export default ControlPanel; 