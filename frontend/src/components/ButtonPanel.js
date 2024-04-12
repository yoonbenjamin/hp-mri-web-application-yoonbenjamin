/**
 * ButtonPanel.js
 *
 * Renders a panel containing interactive buttons for various functionalities within the EPSI Visualization App.
 * This includes buttons for toggling EPSI plot visibility, adjusting plot position, saving the current state as an image,
 * and uploading a dataset. Icons are used to visually represent the actions, providing a more intuitive user experience.
 * 
 * Version 1.2.0: Introduces a refined GUI with image icons for buttons and a dedicated upload functionality.
 * Author: Benjamin Yoon
 * Date: 2024-04-12
 */

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import saveIcon from './icons/saveicon.png';
import databaseIcon from './icons/database.png'
import right from './icons/right.png';
import up from './icons/up.png';
import left from './icons/left.png';
import down from './icons/down.png';
import reset from './icons/reset.png';

function ButtonPanel({
    toggleEpsi, onMoveUp, onMoveLeft, onMoveDown, onMoveRight, onResetPlotShift, onFileUpload
}) {
    const [isEpsiOn, setIsEpsiOn] = useState(false);
    const fileInputRef = useRef();

    /**
     * Toggles the visibility of the EPSI plot.
     * @param {boolean} newStatus - True to show the EPSI plot, false to hide it.
     */
    const handleToggleEpsi = (newStatus) => {
        setIsEpsiOn(newStatus === 'on');
        toggleEpsi(newStatus === 'on');
    };

    /**
     * Triggers movement of the EPSI plot based on the given direction.
     * @param {string} direction - Direction to move the plot ('up', 'down', 'left', 'right').
     */
    const handleMove = (direction) => {
        switch (direction) {
            case 'up': onMoveUp(); break;
            case 'down': onMoveDown(); break;
            case 'left': onMoveLeft(); break;
            case 'right': onMoveRight(); break;
            default: console.error("Invalid direction");
        }
    };

    // Save the current state as a PNG image.
    const handleSaveScreenshot = () => {
        html2canvas(document.body).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'screenshot.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    // Trigger file upload dialog.
    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    /**
     * Handles the files selected for upload and passes them to the parent component.
     * @param {Event} event - Event triggered on file selection.
     */
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            onFileUpload(files);
        }
    };

    return (
        <div className="top-panel">
            {/* Upload dataset button */}
            <div className="icon-button-container">
                <button className="icon-button" onClick={handleFileSelect}>
                    <img src={databaseIcon} alt="Upload Icon" className="button-icon" />
                </button>
                <span className="button-text">Database</span>
                <input
                    type="file"
                    webkitdirectory="true"
                    mozdirectory="true"
                    directory="true"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
            </div>

            {/* Save as PNG button */}
            <div className="icon-button-container">
                <button className="icon-button" onClick={handleSaveScreenshot}>
                    <img src={saveIcon} alt="Save Icon" className="button-icon" />
                </button>
                <span className="button-text">Save</span>
            </div>

            {/* EPSI toggle radio buttons */}
            <div className="epsi-radio-buttons">
                <label className="radio-button-label">
                    <input
                        type="radio"
                        name="epsiStatus"
                        value="on"
                        checked={isEpsiOn}
                        onChange={() => handleToggleEpsi('on')}
                    />
                    ON
                </label>
                <label className="radio-button-label">
                    <input
                        type="radio"
                        name="epsiStatus"
                        value="off"
                        checked={!isEpsiOn}
                        onChange={() => handleToggleEpsi('off')}
                    />
                    OFF
                </label>
                <span className="epsi-button-text">EPSI</span>
            </div>

            {/* Plot position adjustment buttons */}
            <div className="button-container">
                <div className="top-button-group">
                    <button className="button" onClick={() => handleMove('up')}>
                        <img src={up} alt="Up" />
                    </button>
                </div>
                <div className="bottom-button-group">
                    <button className="button" onClick={() => handleMove('left')}>
                        <img src={left} alt="Left" />
                    </button>
                    <button className="button" onClick={() => handleMove('down')}>
                        <img src={down} alt="Down" />
                    </button>
                    <button className="button" onClick={() => handleMove('right')}>
                        <img src={right} alt="Right" />
                    </button>
                </div>
                <span className="button-text-shift">Plot shift</span>
            </div>

            <div className="reset-button-container">
                <button className="reset-button" onClick={onResetPlotShift}>
                    <img src={reset} alt="Plot reset" className="button-reset" />
                </button>
                <span className="button-text-reset">Plot reset</span>
            </div>

        </div>
    );
}

export default ButtonPanel; 