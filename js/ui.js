// ui.js

export function setupUI(app) {
    setupDimensionsPanel();
    setupShaftPanel();
    setupFeaturesPanel();

    // Connect all inputs to the app
    setupEventListeners(app);
}

function setupDimensionsPanel() {
    const container = document.getElementById('basic-dimensions');
    container.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Basic Dimensions</h2>
            
            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Knob Diameter
                    <div class="flex items-center space-x-2">
                        <input type="range" 
                               min="10" max="100" value="35" 
                               class="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" 
                               id="knobDia">
                        <span class="text-sm tabular-nums w-12 text-gray-600 dark:text-gray-400" id="knobDiaValue">35mm</span>
                    </div>
                </label>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Knob Height
                    <div class="flex items-center space-x-2">
                        <input type="range" 
                               min="5" max="50" value="14" 
                               class="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" 
                               id="knobHeight">
                        <span class="text-sm tabular-nums w-12 text-gray-600 dark:text-gray-400" id="knobHeightValue">14mm</span>
                    </div>
                </label>
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
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shaft Type
                    <select class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                            id="shaftType">
                        <option value="0">Round</option>
                        <option value="1">D-Shape</option>
                        <option value="2">Detented</option>
                    </select>
                </label>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shaft Diameter
                    <div class="flex items-center space-x-2">
                        <input type="range" 
                               min="3" max="20" value="6" step="0.1" 
                               class="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" 
                               id="shaftDia">
                        <span class="text-sm tabular-nums w-12 text-gray-600 dark:text-gray-400" id="shaftDiaValue">6.0mm</span>
                    </div>
                </label>
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
                       class="w-4 h-4 text-blue-500 border-gray-300 rounded dark:border-gray-600 focus:ring-blue-500" 
                       id="outerRidged" checked>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Outer Ridges
                </label>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Ridges
                    <div class="flex items-center space-x-2">
                        <input type="range" 
                               min="10" max="100" value="50" 
                               class="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700" 
                               id="noOfOuterRidges">
                        <span class="text-sm tabular-nums w-12 text-gray-600 dark:text-gray-400" id="noOfOuterRidgesValue">50</span>
                    </div>
                </label>
            </div>

            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                       class="w-4 h-4 text-blue-500 border-gray-300 rounded dark:border-gray-600 focus:ring-blue-500" 
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