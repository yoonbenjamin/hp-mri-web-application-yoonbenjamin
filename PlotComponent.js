/**
 * PlotComponent.js
 * 
 * React component for rendering EPSI data plots using Plotly.js. It manages the plot's lifecycle
 * and ensures it responds to prop changes.
 * 
 * @version 1.0.0
 * @author Benjamin Yoon
 * @date 2024-02-02
 */

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js';

function PlotComponent({ xEpsi, epsi, columns, spectralData, rows, lroFid, lpeFid, lroEpsi, lpeEpsi, plotShift }) {
    // Reference to the div where the plot will be rendered
    const plotContainerRef = useRef(null);

    // Function to update the plot based on incoming props
    const updatePlot = () => {
        try {
            // Calculate the domain for the plot based on the plot shifts and fiducial lengths
            const domain = {
                x: [
                    ((lroFid - lroEpsi) / 2 + plotShift[0] * lroEpsi / columns) / lroFid,
                    ((lroFid - lroEpsi) / 2 + plotShift[0] * lroEpsi / columns) / lroFid + lroEpsi / lroFid
                ],
                y: [
                    ((lpeFid - lpeEpsi) / 2 + plotShift[1] * lpeEpsi / rows) / lpeFid,
                    ((lpeFid - lpeEpsi) / 2 + plotShift[1] * lpeEpsi / rows) / lpeFid + lpeEpsi / lpeFid
                ]
            };

            // Setup the data for the line plot with the EPSI values
            const lineData = {
                x: xEpsi,
                y: epsi,
                type: 'scatter',
                mode: 'lines',
                line: { color: '#FF00FF', width: 1 },
                connectgaps: false,
                xaxis: 'x',
                yaxis: 'y'
            };

            // Prepare grid lines data for visual reference
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

            // Combine data for Plotly
            const plotData = [lineData, ...gridData];

            // Define the layout for the plot
            const layout = {
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

            // Render the plot using Plotly.
            Plotly.react(plotContainerRef.current, plotData, layout, { staticPlot: true });
        } catch (error) {
            console.error('Error while updating the plot:', error);
        }
    };

    // Effect hook to update the plot when props change.
    useEffect(updatePlot, [xEpsi, epsi, columns, spectralData, rows, lroFid, lpeFid, lroEpsi, lpeEpsi, plotShift]);

    // Render the plot container.
    return (
        <div className="plot-container" style={{ width: '100%', height: '100%' }}>
            <div ref={plotContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

export default PlotComponent;
