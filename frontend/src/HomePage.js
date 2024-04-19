/**
 * HomePage.js
 *
 * The HomePage component serves as the central interface for the HP MRI Web Application.
 * It provides functionalities such as displaying proton images, adjusting EPSI plots,
 * and offering navigation to the About page. This version introduces an updated GUI
 * with improved controls for enhanced data visualization and user interaction.
 *
 * Version 1.2.0: Introduces a refined GUI with new controls and layout adjustments and official title: HP MRI Web Application.
 * Author: Benjamin Yoon
 * Date: 2024-04-16
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import ButtonPanel from './components/ButtonPanel';
import PlotComponent from './components/PlotComponent';
import { Link } from 'react-router-dom';

function HomePage() {
  // State hooks for image URL and EPSI data visualization.
  const [imageURL, setImageURL] = useState('');
  const [epsiData, setEpsiData] = useState({
    xEpsi: [], epsi: [], columns: 0, spectralData: [], rows: 0,
    lroFid: 0, lpeFid: 0, lroEpsi: 0, lpeEpsi: 0, plotShift: [0, 0]
  });
  const [showEpsi, setShowEpsi] = useState(false); // Flag for EPSI plot display.
  // Offsets for EPSI plot positioning.
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // Window dimensions for responsive design.
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [epsiValue, setEpsiValue] = useState(3);

  // Effect hook for initial data fetch and window resize event listener.
  useEffect(() => {
    fetchInitialData();
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Event handlers for UI control components.
  const handleSliderChange = (newValue, contrastValue) => sendSliderValueToBackend(newValue, contrastValue);
  const handleContrastChange = (sliderValue, newContrastValue) => sendSliderValueToBackend(sliderValue, newContrastValue);
  const handleEpsiChange = (newEpsiValue) => { setEpsiValue(newEpsiValue); sendEpsiValueToBackend(epsiValue); }
  const toggleEpsi = (newStatus) => { setShowEpsi(newStatus); sendEpsiValueToBackend(epsiValue); }

  // Event handlers for plot position adjustment.
  const moveLeft = () => setOffsetX(offsetX - 10);
  const moveRight = () => setOffsetX(offsetX + 10);
  const moveUp = () => setOffsetY(offsetY - 10);
  const moveDown = () => setOffsetY(offsetY + 10);
  const resetPlotShift = () => { setOffsetX(0); setOffsetY(0); };

  // File upload handler.
  const handleFileUpload = (files) => {
    const fileList = Array.from(files); // Convert FileList to array for easier processing.

    fileList.forEach((file) => {
    });

    const formData = new FormData();
    fileList.forEach(file => formData.append('files', file));

    const uploadEndpoint = 'http://127.0.0.1:5000/api/upload';
    fetch(uploadEndpoint, { method: 'POST', body: formData })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error uploading files:', error));
  };

  // Data fetch functions for proton image and EPSI data.
  const fetchInitialData = () => {
    sendSliderValueToBackend(3, 1);
    sendEpsiValueToBackend(3);
  };

  /**
   * Fetches and updates the proton image based on slider input.
   * @param {number} newValue - The new value from the image slice slider.
   * @param {number} newContrastValue - The new value from the contrast slider.
   */
  const sendSliderValueToBackend = (newValue, newContrastValue) => {
    fetch(`http://127.0.0.1:5000/api/get_proton_picture/${newValue}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contrast: newContrastValue }),
    }).then(response => response.blob()).then(imageBlob => setImageURL(URL.createObjectURL(imageBlob)))
      .catch(error => console.error(error));
  };

  /**
   * Fetches and updates the EPSI plot based on slider input.
   * @param {number} newEpsiValue - The new value from the epsi plot slider.
   */
  const sendEpsiValueToBackend = (newEpsiValue) => {
    fetch(`http://127.0.0.1:5000/api/get_epsi_data/${newEpsiValue}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json()).then(data =>
      setEpsiData(data))
      .catch(error => console.error(error));
  };

  // Render the HomePage component.
  return (
    <div className="App">
      {/* Top panel with button controls */}
      <div clssName="top-panel">
        <ButtonPanel
          onEpsiChange={handleEpsiChange}
          toggleEpsi={toggleEpsi}
          onMoveUp={moveUp}
          onMoveLeft={moveLeft}
          onMoveDown={moveDown}
          onMoveRight={moveRight}
          onResetPlotShift={resetPlotShift}
          onFileUpload={handleFileUpload}
        />
      </div>
      <ControlPanel
        onSliderChange={handleSliderChange}
        onContrastChange={handleContrastChange}
        onEpsiChange={handleEpsiChange}
        epsiValue={epsiValue}
      />
      <div className="image-and-plot-container">
        <div className="app-content">
        </div>
        <img src={imageURL} alt="Proton" className="proton-image" />
        {/* Plot container with dynamic transformation for positioning */}
        <div className='plot-container' style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}>
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
            windowSize={windowSize} // Pass window size as a prop
            showEpsi={showEpsi}
          />
        </div>
      </div>
      {/* Footer with navigation link to the About page */}
      <footer>
        <Link to="/about">About</Link> • 2024 Universty of Pennsylvania Perelman School of Medicine
      </footer>
    </div>
  );
}

export default HomePage;
