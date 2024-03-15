/**
 * SliderComponent.js
 *
 * A functional React component to render sliders for controlling the image slice,
 * contrast, and EPSI dataset. It allows users to adjust these parameters and sends
 * the updated values to the parent component through callback props.
 *
 * @version 1.1.0
 * @author Benjamin Yoon
 * @date 2024-03-01
 */

import React, { useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * Renders a control panel with sliders for adjusting image slice, contrast,
 * and EPSI dataset. Provides buttons for EPSI visibility, plot position adjustments,
 * and saving the current view as a PNG image.
 */
function ControlPanel({
  onSliderChange, onContrastChange, onEpsiChange,
  toggleEpsi, onMoveUp, onMoveLeft, onMoveDown, onMoveRight, onResetPlotShift
}) {
  // Initialize state for sliders and EPSI visibility toggle.
  const [sliderValue, setSliderValue] = useState(3);
  const [contrastValue, setContrastValue] = useState(1);
  const [epsiValue, setEpsiValue] = useState(3);
  const [isEpsiOn, setIsEpsiOn] = useState(false);

  // Handlers for user interactions.
  const handleSliderChange = (event) => {
    const newValue = event.target.value;
    setSliderValue(newValue);
    onSliderChange(newValue, contrastValue);
  };
  const handleContrastChange = (event) => {
    const newContrastValue = parseFloat(event.target.value);
    setContrastValue(newContrastValue);
    onContrastChange(sliderValue, newContrastValue);
  };
  const handleEpsiChange = (event) => {
    const newEpsiValue = parseInt(event.target.value);
    setEpsiValue(newEpsiValue);
    onEpsiChange(newEpsiValue);
  };
  const handleToggleEpsi = (isToggled) => {
    setIsEpsiOn(isToggled);
    toggleEpsi();
    onEpsiChange(epsiValue);
  };

  // Position adjustment handlers.
  const handleMove = (direction) => {
    switch (direction) {
      case 'up': onMoveUp(); break;
      case 'down': onMoveDown(); break;
      case 'left': onMoveLeft(); break;
      case 'right': onMoveRight(); break;
      default: console.error("Invalid direction");
    }
  };

  // Saves the current state as a PNG image.
  const handleSaveScreenshot = () => {
    html2canvas(document.body).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'screenshot.png';
      document.body.appendChild(link); // Necessary for Firefox
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="slider-container">
      <h2>Image Slice</h2>
      <input type="range" min="1" max={20} value={sliderValue} onChange={handleSliderChange} />
      <p>Slider Value: {sliderValue}</p>

      <h2>Contrast</h2>
      <input type="range" min="0.1" max="3.0" step="0.1" value={contrastValue} onChange={handleContrastChange} />
      <p>Contrast Value: {contrastValue}</p>

      <h2>EPSI Dataset</h2>
      <input type="range" min="0" max={17} value={epsiValue} onChange={handleEpsiChange} />
      <p>EPSI Value: {epsiValue}</p>

      <button onClick={() => handleToggleEpsi(!isEpsiOn)}>{isEpsiOn ? "EPSI OFF" : "EPSI ON"}</button>

      <h2>Plot Shift</h2>
      <div className="button-container">
        <div className="top-button-group">
          <button className="button" onClick={() => handleMove('up')}>U</button>
        </div>
        <div className="bottom-button-group">
          <button className="button" onClick={() => handleMove('left')}>L</button>
          <button className="button" onClick={() => handleMove('down')}>D</button>
          <button className="button" onClick={() => handleMove('right')}>R</button>
        </div>
      </div>
      <div className="button-reset">
        <button onClick={onResetPlotShift}>Reset Plot Shift</button>
      </div>

      <h2>Save</h2>
      <button onClick={handleSaveScreenshot}>Save as PNG</button>
    </div>
  );
}

export default ControlPanel; 