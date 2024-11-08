// ui.js

export function setupUI(app) {
    setupDimensionsPanel();
    setupShaftPanel();
    setupFeaturesPanel();

    // Initialize dark mode based on system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
}

function setupDimensionsPanel() {
    const container = document.getElementById('basic-dimensions');
    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Basic Dimensions</h2>
            
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

function setupShaftPanel() {
    const container = document.getElementById('shaft-options');
    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Shaft Options</h2>
            
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

function setupFeaturesPanel() {
    const container = document.getElementById('surface-features');
    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Surface Features</h2>
            
            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                       class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" 
                       id="outerRidged" checked>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Outer Ridges
                </label>
            </div>

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

function setupEventListeners(app) {
    // Knob diameter
    const knobDia = document.getElementById('knobDia');
    const knobDiaValue = document.getElementById('knobDiaValue');
    knobDia.addEventListener('input', (e) => {
        const value = e.target.value;
        knobDiaValue.textContent = `${value}mm`;
        app.updateParams({ knobDia: parseFloat(value) });
    });

    // Knob height
    const knobHeight = document.getElementById('knobHeight');
    const knobHeightValue = document.getElementById('knobHeightValue');
    knobHeight.addEventListener('input', (e) => {
        const value = e.target.value;
        knobHeightValue.textContent = `${value}mm`;
        app.updateParams({ knobHeight: parseFloat(value) });
    });

    // Shaft type
    const shaftType = document.getElementById('shaftType');
    shaftType.addEventListener('change', (e) => {
        app.updateParams({ shaftType: parseInt(e.target.value) });
    });

    // Shaft diameter
    const shaftDia = document.getElementById('shaftDia');
    const shaftDiaValue = document.getElementById('shaftDiaValue');
    shaftDia.addEventListener('input', (e) => {
        const value = e.target.value;
        shaftDiaValue.textContent = `${value}mm`;
        app.updateParams({ shaftDia: parseFloat(value) });
    });

    // Outer ridges
    const outerRidged = document.getElementById('outerRidged');
    outerRidged.addEventListener('change', (e) => {
        app.updateParams({ outerRidged: e.target.checked });
    });

    // Number of ridges
    const noOfOuterRidges = document.getElementById('noOfOuterRidges');
    const noOfOuterRidgesValue = document.getElementById('noOfOuterRidgesValue');
    noOfOuterRidges.addEventListener('input', (e) => {
        const value = e.target.value;
        noOfOuterRidgesValue.textContent = value;
        app.updateParams({ noOfOuterRidges: parseInt(value) });
    });

    // Top indent
    const makeTopIndent = document.getElementById('makeTopIndent');
    makeTopIndent.addEventListener('change', (e) => {
        app.updateParams({ makeTopIndent: e.target.checked });
    });
}