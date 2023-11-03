import React, { useState } from 'react';

function SliderComponent() {
  const [sliderValue, setSliderValue] = useState(10); // Default value
  const [contrastValue, setContrastValue] = useState(1); // Default value for contrast slider
  const [imageURL, setImageURL] = useState('');

  const handleSliderChange = (event) => {
    const newValue = event.target.value;
    setSliderValue(newValue);
    sendSliderValueToBackend(newValue, contrastValue);
  };

  const handleContrastChange = (event) => {
    const newContrastValue = parseFloat(event.target.value);
    setContrastValue(newContrastValue);
    sendSliderValueToBackend(sliderValue, newContrastValue);
  };

  const sendSliderValueToBackend = (newValue, newContrastValue) => {
    fetch(`http://127.0.0.1:5000/api/get_proton_picture/${newValue}`, {
      method: 'POST', // Send a POST request to include the contrast value
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contrast: newContrastValue }),
    })
      .then((response) => response.blob())
      .then((imageBlob) => {
        const imageURL = URL.createObjectURL(imageBlob);
        setImageURL(imageURL); // Update the state
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
        max="3" 
        step="0.1" 
        value={contrastValue}
        onChange={handleContrastChange}
      />
      <p>Contrast Value: {contrastValue}</p>
      
      {imageURL && <img src={imageURL} alt="Proton" />}
    </div>
  );
}

export default SliderComponent;