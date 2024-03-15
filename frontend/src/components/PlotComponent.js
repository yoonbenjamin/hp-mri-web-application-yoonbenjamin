/**
 * PlotComponent.js
 * 
 * Renders EPSI data plots using Plotly.js, dynamically updating to reflect prop changes.
 * It calculates plot dimensions and grid alignment based on provided prop values.
 * 
 * @version 1.1.0
 * @author Benjamin Yoon
 * @date 2024-03-01
 */

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js';

/**
 * Component to render dynamic EPSI data plots using Plotly.js.
 * Adjusts plots based on user interactions and window size.
 *
 * Props:
 * - xEpsi, epsi: Arrays containing the X and Y data for the EPSI plot.
 * - columns, rows: The number of columns and rows in the EPSI grid.
 * - lroFid, lpeFid: Longitudinal and perpendicular fiducial lengths.
 * - lroEpsi, lpeEpsi: Longitudinal and perpendicular EPSI lengths.
 * - plotShift: Object containing X and Y shift values for the plot.
 * - windowSize: Object containing width and height of the window.
 * - showEpsi: Boolean indicating if EPSI data should be displayed.
 */
function PlotComponent({ xEpsi, epsi, columns, spectralData, rows, lroFid, lpeFid, lroEpsi, lpeEpsi, plotShift, windowSize, showEpsi }) {
    const plotContainerRef = useRef(null);

    // Effect hook to redraw plot when window size changes.
    useEffect(() => {
        updatePlot();
    }, [windowSize, showEpsi, xEpsi, epsi, columns, rows, lroFid, lpeFid, lroEpsi, lpeEpsi, plotShift]);

    const updatePlot = () => {
        try {
            // Calculate plot domain based on input props.
            const domain = calculateDomain(lroFid, lroEpsi, plotShift[0], columns, lpeFid, lpeEpsi, plotShift[1], rows);

            // Process EPSI data, excluding out-of-range values.
            const processedEpsi = epsi.map(value => (value < 0.1 || value > 9.9) ? null : value);

            // Prepare grid data.
            const gridData = prepareGridData(domain, columns, rows);

            // Generate plot data, including EPSI line data if visible.
            const plotData = showEpsi ? [...gridData, createLineData(xEpsi, processedEpsi)] : gridData;

            // Configure and render plot.
            const layout = configureLayout(domain, columns, spectralData, rows, plotContainerRef, gridData);
            Plotly.react(plotContainerRef.current, plotData, layout, { staticPlot: true });
        } catch (error) {
            console.error('Error updating plot:', error);
        }
    };

    return (
        <div className="plot-container" style={{ width: '100%', height: '100%' }}>
            <div ref={plotContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

/**
 * Calculates the domain for the plot based on provided parameters.
 * @param {number} lroFid, lpeFid, lroEpsi, lpeEpsi: Fiducial and EPSI lengths.
 * @param {number} plotShiftX, plotShiftY: Shifts in X and Y directions.
 * @param {number} columns, rows: Number of columns and rows in the grid.
 * @returns {Object} Domain object with x and y arrays.
 */
function calculateDomain(lroFid, lroEpsi, plotShiftX, columns, lpeFid, lpeEpsi, plotShiftY, rows) {
    return {
        x: [
            ((lroFid - lroEpsi) / 2 + plotShiftX * lroEpsi / columns) / lroFid,
            ((lroFid - lroEpsi) / 2 + plotShiftX * lroEpsi / columns) / lroFid + lroEpsi / lroFid
        ],
        y: [
            ((lpeFid - lpeEpsi) / 2 + plotShiftY * lpeEpsi / rows) / lpeFid,
            ((lpeFid - lpeEpsi) / 2 + plotShiftY * lpeEpsi / rows) / lpeFid + lpeEpsi / lpeFid
        ]
    };
}

/**
 * Prepares grid data for plotting based on domain and grid size.
 * @param {Object} domain: Plot domain.
 * @param {number} columns, rows: Grid dimensions.
 * @returns {Array} Grid data for plotting.
 */
function prepareGridData(domain, columns, rows) {
    const gridData = [];
    // Horizontal grid lines
    for (let i = 0; i <= columns; i++) {
        gridData.push({
            type: 'line',
            // Align grid lines with the domain
            x0: domain.x[0] + (i / columns) * (domain.x[1] - domain.x[0]),
            y0: domain.y[0],
            x1: domain.x[0] + (i / columns) * (domain.x[1] - domain.x[0]),
            y1: domain.y[1],
            line: { color: 'white', width: 1, dash: 'dash' },
            xref: 'paper', yref: 'paper'
        });
    }
    // Vertical grid lines
    for (let j = 0; j <= rows; j++) {
        gridData.push({
            type: 'line',
            // Align grid lines with the domain
            x0: domain.x[0],
            y0: domain.y[0] + (j / rows) * (domain.y[1] - domain.y[0]),
            x1: domain.x[1],
            y1: domain.y[0] + (j / rows) * (domain.y[1] - domain.y[0]),
            line: { color: 'white', width: 1, dash: 'dash' },
            xref: 'paper', yref: 'paper'
        });
    }
    return gridData;
}

/**
 * Creates line data for EPSI plot.
 * @param {Array} xEpsi, processedEpsi: X and Y data for the plot.
 * @returns {Object} Line data object for plotting.
 */
function createLineData(xEpsi, processedEpsi) {
    return {
        x: xEpsi,
        y: processedEpsi,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#FF00FF', width: 1 },
        connectgaps: false, // Prevent connecting lines across gaps.
        xaxis: 'x',
        yaxis: 'y'
    };
}

/**
 * Configures plot layout based on domain and container dimensions.
 * @param {Object} domain: Plot domain.
 * @param {number} columns: Number of columns in the grid.
 * @param {Array} spectralData: Spectral data for width calculation.
 * @param {number} rows: Number of rows in the grid.
 * @param {Object} plotContainerRef: Ref to the plot container.
 * @param {Object} gridData Grid data object for plotting.
 * @returns {Object} Layout configuration for the plot.
 */
function configureLayout(domain, columns, spectralData, rows, plotContainerRef, gridData) {
    return {
        showlegend: false,
        xaxis: {
            domain: domain.x,
            range: [0, columns * spectralData[0][0].length],
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
        },
        yaxis: {
            domain: domain.y,
            range: [0, rows],
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
        width: plotContainerRef.current.offsetWidth,
        height: plotContainerRef.current.offsetHeight,
        shapes: gridData.map(line => ({
            ...line,
            line: { ...line.line, color: 'rgba(255, 255, 255, 0.5)' } // Set color with transparency
        }))
    };
}

export default PlotComponent;
