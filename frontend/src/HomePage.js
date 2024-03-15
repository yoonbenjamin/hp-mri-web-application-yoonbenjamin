/**
 * HomePage Component for the EPSI Visualization App.
 * 
 * This component serves as the landing page of the EPSI Visualization Tool, showcasing
 * the main functionalities such as displaying proton images, adjusting EPSI plots, and
 * navigating to the About page. It facilitates user interaction with various controls
 * for data visualization and manipulation.
 * 
 * @version 1.1.1 - Includes navigation to About page and initial data fetching.
 * @author Benjamin Yoon
 * @date 2024-03-15
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import PlotComponent from './components/PlotComponent';
import { Link } from 'react-router-dom';

function HomePage() {
  // State management for image display and EPSI data visualization.
  const [imageURL, setImageURL] = useState('');
  const [epsiData, setEpsiData] = useState({
    xEpsi: [], epsi: [], columns: 0, spectralData: [], rows: 0,
    lroFid: 0, lpeFid: 0, lroEpsi: 0, lpeEpsi: 0, plotShift: [0, 0]
  });
  const [showEpsi, setShowEpsi] = useState(false); // Toggles the display of EPSI plot.
  const [offsetX, setOffsetX] = useState(0); // Horizontal offset for plot positioning.
  const [offsetY, setOffsetY] = useState(0); // Vertical offset for plot positioning.

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight }); // Tracks window size for responsive design.

  // Fetches initial data on component mount and handles window resizing.
  useEffect(() => {
    fetchInitialData();
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers for user inputs to adjust visualization parameters.
  const handleSliderChange = (newValue, contrastValue) => sendSliderValueToBackend(newValue, contrastValue);
  const handleContrastChange = (sliderValue, newContrastValue) => sendSliderValueToBackend(sliderValue, newContrastValue);
  const handleEpsiChange = (newEpsiValue) => sendEpsiValueToBackend(newEpsiValue);
  const toggleEpsi = () => setShowEpsi(!showEpsi);

  // Functions to adjust EPSI plot positioning.
  const moveLeft = () => setOffsetX(offsetX - 10);
  const moveRight = () => setOffsetX(offsetX + 10);
  const moveUp = () => setOffsetY(offsetY - 10);
  const moveDown = () => setOffsetY(offsetY + 10);
  const resetPlotShift = () => { setOffsetX(0); setOffsetY(0); };

  // Functions to fetch data from the backend for the proton image and EPSI data.
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
    // Send the EPSI value to the backend
    fetch(`http://127.0.0.1:5000/api/get_epsi_data/${newEpsiValue}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json()).then(data =>
      // Handle the EPSI-related data
      setEpsiData(data))
      .catch(error => console.error(error));
  };

  return (
    <div className="App">
      <div className="slider-container">
        <ControlPanel
          onSliderChange={handleSliderChange}
          onContrastChange={handleContrastChange}
          onEpsiChange={handleEpsiChange}
          toggleEpsi={toggleEpsi} // Pass toggle function to SliderComponent
          onMoveUp={moveUp}
          onMoveLeft={moveLeft}
          onMoveDown={moveDown}
          onMoveRight={moveRight}
          onResetPlotShift={resetPlotShift}
        />
      </div>
      <div className="image-and-plot-container">
        <img src={imageURL} alt="Proton" className="proton-image" />
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
      <footer>
        <Link to="/about">About</Link> • 2024 Universty of Pennsylvania Perelman School of Medicine
      </footer>
    </div>
  );
}

export default HomePage;
