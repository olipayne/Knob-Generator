// /js/ui.js

/**
 * ui.js
 * 
 * This module sets up the user interface (UI) controls for the 3D Knob Generator.
 * It renders the necessary HTML elements and attaches event listeners to handle user interactions.
 */

/**
 * Sets up the UI panels by injecting the required HTML into the DOM.
 */
export function setupUI() {
    setupDimensionsPanel();
    setupShaftPanel();
    setupFeaturesPanel();
    // Optionally, you can set up additional UI panels here
}

/**
 * Sets up the "Basic Dimensions" panel with controls for knob diameter and height.
 */
function setupDimensionsPanel() {
    const container = document.getElementById('basic-dimensions');
    if (!container) {
        console.error('Container with ID "basic-dimensions" not found.');
        return;
    }

    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Basic Dimensions</h2>
            
            <!-- Knob Diameter Control -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Knob Diameter
                </label>
                <div class="flex items-center space-x-3">
                    <input type="range" 
                           min="10" max="100" value="35" 
                           class="flex-grow"
                           id="knobDia">
                    <span class="text-sm tabular-nums w-14 text-right text-gray-600 dark:text-gray-400" 
                          id="knobDiaValue">35mm</span>
                </div>
            </div>

            <!-- Knob Height Control -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Knob Height
                </label>
                <div class="flex items-center space-x-3">
                    <input type="range" 
                           min="5" max="50" value="14" 
                           class="flex-grow"
                           id="knobHeight">
                    <span class="text-sm tabular-nums w-14 text-right text-gray-600 dark:text-gray-400" 
                          id="knobHeightValue">14mm</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Sets up the "Shaft Options" panel with controls for shaft type and diameter.
 */
function setupShaftPanel() {
    const container = document.getElementById('shaft-options');
    if (!container) {
        console.error('Container with ID "shaft-options" not found.');
        return;
    }

    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Shaft Options</h2>
            
            <!-- Shaft Type Control -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shaft Type
                </label>
                <select class="mt-1" id="shaftType">
                    <option value="0">Round</option>
                    <option value="1">D-Shape</option>
                    <option value="2">Detented</option>
                </select>
            </div>

            <!-- Shaft Diameter Control -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shaft Diameter
                </label>
                <div class="flex items-center space-x-3">
                    <input type="range" 
                           min="3" max="20" value="6" step="0.1" 
                           class="flex-grow"
                           id="shaftDia">
                    <span class="text-sm tabular-nums w-14 text-right text-gray-600 dark:text-gray-400" 
                          id="shaftDiaValue">6.0mm</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Sets up the "Surface Features" panel with controls for outer ridges and top indent.
 */
function setupFeaturesPanel() {
    const container = document.getElementById('surface-features');
    if (!container) {
        console.error('Container with ID "surface-features" not found.');
        return;
    }

    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Surface Features</h2>
            
            <!-- Outer Ridges Toggle -->
            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                       class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" 
                       id="outerRidged" checked>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Outer Ridges
                </label>
            </div>

            <!-- Number of Ridges Control -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Ridges
                </label>
                <div class="flex items-center space-x-3">
                    <input type="range" 
                           min="10" max="100" value="50" 
                           class="flex-grow"
                           id="noOfOuterRidges">
                    <span class="text-sm tabular-nums w-14 text-right text-gray-600 dark:text-gray-400" 
                          id="noOfOuterRidgesValue">50</span>
                </div>
            </div>

            <!-- Top Indent Toggle -->
            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                       class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" 
                       id="makeTopIndent" checked>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Indent
                </label>
            </div>
        </div>
    `;
}

/**
 * Attaches event listeners to the UI controls to handle user interactions.
 * @param {KnobGenerator} app - The instance of the KnobGenerator class.
 */
export function setupEventListeners(app) {
    // Knob Diameter Control
    const knobDia = document.getElementById('knobDia');
    const knobDiaValue = document.getElementById('knobDiaValue');
    if (knobDia && knobDiaValue) {
        knobDia.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            knobDiaValue.textContent = `${value}mm`;
            app.updateParams({ knobDia: value });
        });
    } else {
        console.error('Knob Diameter controls not found.');
    }

    // Knob Height Control
    const knobHeight = document.getElementById('knobHeight');
    const knobHeightValue = document.getElementById('knobHeightValue');
    if (knobHeight && knobHeightValue) {
        knobHeight.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            knobHeightValue.textContent = `${value}mm`;
            app.updateParams({ knobHeight: value });
        });
    } else {
        console.error('Knob Height controls not found.');
    }

    // Shaft Type Control
    const shaftType = document.getElementById('shaftType');
    if (shaftType) {
        shaftType.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10);
            app.updateParams({ shaftType: value });
        });
    } else {
        console.error('Shaft Type control not found.');
    }

    // Shaft Diameter Control
    const shaftDia = document.getElementById('shaftDia');
    const shaftDiaValue = document.getElementById('shaftDiaValue');
    if (shaftDia && shaftDiaValue) {
        shaftDia.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            shaftDiaValue.textContent = `${value.toFixed(1)}mm`;
            app.updateParams({ shaftDia: value });
        });
    } else {
        console.error('Shaft Diameter controls not found.');
    }

    // Outer Ridges Toggle
    const outerRidged = document.getElementById('outerRidged');
    if (outerRidged) {
        outerRidged.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            app.updateParams({ outerRidged: isChecked });
        });
    } else {
        console.error('Outer Ridges toggle not found.');
    }

    // Number of Ridges Control
    const noOfOuterRidges = document.getElementById('noOfOuterRidges');
    const noOfOuterRidgesValue = document.getElementById('noOfOuterRidgesValue');
    if (noOfOuterRidges && noOfOuterRidgesValue) {
        noOfOuterRidges.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            noOfOuterRidgesValue.textContent = value;
            app.updateParams({ noOfOuterRidges: value });
        });
    } else {
        console.error('Number of Ridges controls not found.');
    }

    // Top Indent Toggle
    const makeTopIndent = document.getElementById('makeTopIndent');
    if (makeTopIndent) {
        makeTopIndent.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            app.updateParams({ makeTopIndent: isChecked });
        });
    } else {
        console.error('Top Indent toggle not found.');
    }

    // Export STL Button
    const exportButton = document.getElementById('exportSTL');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            app.exportSTL();
        });
    } else {
        console.error('Export STL button not found.');
    }

    // Reset Camera Button
    const resetButton = document.getElementById('resetCamera');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            app.resetCamera();
        });
    } else {
        console.error('Reset Camera button not found.');
    }

    // Theme Toggle Button
    const themeToggle = document.getElementById('toggleTheme');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
            app.updateSceneBackground(isDark);
        });
    } else {
        console.error('Theme Toggle button not found.');
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') {
            const resetButton = document.getElementById('resetCamera');
            if (resetButton) resetButton.click();
        }
    });
}
