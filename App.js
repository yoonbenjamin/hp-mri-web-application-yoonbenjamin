/**
 * App.js
 * 
 * Main application component for the EPSI data visualization tool. This component 
 * manages state for the entire application, handles user interactions with slider 
 * components, and fetches image data from the backend. The component also renders 
 * the main UI structure including the slider controls, image display, and the EPSI plot.
 * 
 * @version 1.0.0
 * @author Benjamin Yoon
 * @date 2024-02-02
 */

import React, { useState } from 'react';
import './App.css';
import SliderComponent from './components/SliderComponent';
import PlotComponent from './components/PlotComponent';

function App() {
  const [imageURL, setImageURL] = useState('');
  const [epsiData, setEpsiData] = useState({
    xEpsi: [],
    epsi: [],
    columns: 0,
    spectralData: [],
    rows: 0,
    lroFid: 0,
    lpeFid: 0,
    lroEpsi: 0,
    lpeEpsi: 0,
    plotShift: [0, 0],
  });

  const handleSliderChange = (newValue, contrastValue) => {
    sendSliderValueToBackend(newValue, contrastValue);
  };

  const handleContrastChange = (sliderValue, newContrastValue) => {
    sendSliderValueToBackend(sliderValue, newContrastValue);
  };

  const handleEpsiChange = (newEpsiValue) => {
    sendEpsiValueToBackend(newEpsiValue);
  };

  /**
   * Sends the current slider values to the backend and updates the displayed proton image.
   * @param {number} newValue - The new value from the image slice slider.
   * @param {number} newContrastValue - The new value from the contrast slider.
   */
  const sendSliderValueToBackend = (newValue, newContrastValue) => {
    fetch(`http://127.0.0.1:5000/api/get_proton_picture/${newValue}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contrast: newContrastValue }),
    })
      .then((response) => response.blob())
      .then((imageBlob) => {
        const imageURL = URL.createObjectURL(imageBlob);
        setImageURL(imageURL);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const sendEpsiValueToBackend = (newEpsiValue) => {
    // Send the EPSI value to the backend
    fetch(`http://127.0.0.1:5000/api/get_epsi_data/${newEpsiValue}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the EPSI-related data
        setEpsiData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="App">
      <div className="slider-container">
        {/* All the slider components */}
        <SliderComponent
          onSliderChange={handleSliderChange}
          onContrastChange={handleContrastChange}
          onEpsiChange={handleEpsiChange}
        />
      </div>

      <div className="image-and-plot-container">
        <img src={imageURL} alt="Proton" className="proton-image" />
        <PlotComponent
          xEpsi={epsiData.xEpsi}
          epsi={epsiData.epsi}
          columns={epsiData.columns}
          spectralData={epsiData.spectralData}
          rows={epsiData.rows}
          lroFid={epsiData.lroFid}
          lpeFid={epsiData.lpeFid}
          lroEpsi={epsiData.lroEpsi}
          lpeEpsi={epsiData.lpeEpsi}
          plotShift={epsiData.plotShift}
        />
      </div>
    </div>
  );
}

export default App;