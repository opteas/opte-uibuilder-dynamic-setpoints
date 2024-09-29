/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

'use strict';

const storageKeys = {
    temperature: 'setpointTemperature',
    pressure: 'setpointPressure'
};

// Send a message back to Node-RED
function sendSetpointsToNR(temp, pressure) {
    uibuilder.send({
        topic: 'setpoints',
        payload: {
            temperature: temp,
            pressure: pressure
        },
        source: "user"
    });
}

// Initialize setpoints from local storage or set defaults
function initializeSetpoints() {
    let setpointTemperature = localStorage.getItem(storageKeys.temperature);
    let setpointPressure = localStorage.getItem(storageKeys.pressure);

    return {
        setpointTemperature: setpointTemperature ? parseFloat(setpointTemperature).toFixed(1) : 32.0,  // Default temperature
        setpointPressure: setpointPressure ? parseFloat(setpointPressure).toFixed(1) : 1.5  // Default pressure
    };
}

// Update the UI with the current setpoints
function updateSetpointsUI(temperature, pressure) {
    document.getElementById('setpointTemperature').textContent = `${temperature} °C`;
    document.getElementById('setpointPressure').textContent = `${pressure} mbar`;
}

// Initialize everything on window load
window.onload = function () {
    // Start up uibuilder
    uibuilder.start();

    // Initialize setpoints
    const setpoints = initializeSetpoints();
    let setpointTemperature = parseFloat(setpoints.setpointTemperature);
    let setpointPressure = parseFloat(setpoints.setpointPressure);

    // Update UI with initial setpoints
    updateSetpointsUI(setpointTemperature, setpointPressure);

    // Event listeners for temperature adjustment
    document.getElementById('increaseTemp').addEventListener('click', function () {
        if (setpointTemperature < 100) {
            setpointTemperature = (setpointTemperature + 0.5).toFixed(1);
            updateSetpointsUI(setpointTemperature, setpointPressure);
        }
    });

    document.getElementById('decreaseTemp').addEventListener('click', function () {
        if (setpointTemperature > 0) {
            setpointTemperature = (setpointTemperature - 0.5).toFixed(1);
            updateSetpointsUI(setpointTemperature, setpointPressure);
        }
    });

    // Event listeners for pressure adjustment
    document.getElementById('increasePressure').addEventListener('click', function () {
        if (setpointPressure < 10) {
            setpointPressure = (setpointPressure + 0.1).toFixed(1);
            updateSetpointsUI(setpointTemperature, setpointPressure);
        }
    });

    document.getElementById('decreasePressure').addEventListener('click', function () {
        if (setpointPressure > 0) {
            setpointPressure = (setpointPressure - 0.1).toFixed(1);
            updateSetpointsUI(setpointTemperature, setpointPressure);
        }
    });

    // Submit button event listener
    document.getElementById('submitSetpoints').addEventListener('click', function () {
        // Save setpoints to localStorage
        localStorage.setItem(storageKeys.temperature, setpointTemperature);
        localStorage.setItem(storageKeys.pressure, setpointPressure);

        // Send setpoints to Node-RED
        sendSetpointsToNR(setpointTemperature, setpointPressure);
    });

    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function (msg) {
        if (msg.topic === 'setpoints') {
            setpointTemperature = parseFloat(msg.payload.temperature).toFixed(1);
            setpointPressure = parseFloat(msg.payload.pressure).toFixed(1);

            // Update UI and local storage with new setpoints
            updateSetpointsUI(setpointTemperature, setpointPressure);
            localStorage.setItem(storageKeys.temperature, setpointTemperature);
            localStorage.setItem(storageKeys.pressure, setpointPressure);
        }
    });
};
