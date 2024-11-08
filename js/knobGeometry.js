// /js/knobGeometry.js
import * as THREE from 'three';

/**
 * Create Knob Geometry based on the provided parameters.
 * @param {Object} params - Parameters defining the knob's attributes.
 * @returns {THREE.BufferGeometry} - The final knob geometry.
 */
export function createKnobGeometry(params) {
    const {
        knobDia,
        knobHeight,
        shaftType,
        shaftDia,
        outerRidged,
        noOfOuterRidges,
        makeTopIndent
    } = params;

    // Create main knob geometry
    const knobGeometry = new THREE.CylinderGeometry(
        knobDia / 2,  // top radius
        knobDia / 2,  // bottom radius
        knobHeight,   // height
        32,           // radial segments
        1,            // height segments
        false         // open-ended
    );

    let finalGeometry = knobGeometry;

    // Add ridges if enabled
    if (outerRidged) {
        finalGeometry = addRidges(finalGeometry, noOfOuterRidges, knobDia, knobHeight);
    }

    // Add top indent if enabled
    if (makeTopIndent) {
        finalGeometry = addTopIndent(finalGeometry, knobDia, knobHeight);
    }

    // Create shaft hole
    const shaftGeometry = createShaftGeometry(shaftType, shaftDia, knobHeight);
    finalGeometry = subtractGeometry(finalGeometry, shaftGeometry);

    return finalGeometry;
}

/**
 * Add ridges around the knob.
 * @param {THREE.BufferGeometry} baseGeometry - The base knob geometry.
 * @param {number} count - Number of ridges.
 * @param {number} diameter - Diameter of the knob.
 * @param {number} height - Height of the knob.
 * @returns {THREE.BufferGeometry} - Geometry with added ridges.
 */
function addRidges(baseGeometry, count, diameter, height) {
    const ridgeWidth = 0.5;
    const ridgeHeight = height * 0.8;
    const ridgeDepth = 1;

    const geometries = [baseGeometry];

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, ridgeDepth);

        // Position ridge
        const radius = (diameter / 2) + (ridgeDepth / 2);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Create transformation matrix
        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(x, 0, z);
        matrix.makeRotationY(angle);

        // Apply transformation
        ridgeGeometry.applyMatrix4(matrix);

        geometries.push(ridgeGeometry);
    }

    // Merge all geometries
    const mergedGeometry = mergeBufferGeometries(geometries);
    return mergedGeometry;
}

/**
 * Create shaft geometry based on the shaft type.
 * @param {number} type - Type of shaft (0: Round, 1: D-Shape, 2: Detented).
 * @param {number} diameter - Diameter of the shaft.
 * @param {number} height - Height of the knob.
 * @returns {THREE.BufferGeometry} - Geometry of the shaft hole.
 */
function createShaftGeometry(type, diameter, height) {
    switch (type) {
        case 0: // Round shaft
            return new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                32
            );

        case 1: // D-shaped shaft
            return createDShapedShaft(diameter, height);

        case 2: // Detented shaft
            return createDetentedShaft(diameter, height);

        default:
            return new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                32
            );
    }
}

/**
 * Create a D-shaped shaft geometry.
 * @param {number} diameter - Diameter of the shaft.
 * @param {number} height - Height of the knob.
 * @returns {THREE.BufferGeometry} - D-shaped shaft geometry.
 */
function createDShapedShaft(diameter, height) {
    const shaftGeometry = new THREE.CylinderGeometry(
        diameter / 2,
        diameter / 2,
        height * 1.1,
        32,
        1,
        false
    );

    const cutoutGeometry = new THREE.BoxGeometry(
        diameter,
        height * 1.2,
        diameter / 3
    );
    cutoutGeometry.translate(0, 0, diameter / 3);

    // Perform CSG subtraction
    const CSG = require('@jscad/csg'); // Ensure you have a CSG library available
    const shaftCSG = CSG.fromBufferGeometry(shaftGeometry);
    const cutoutCSG = CSG.fromBufferGeometry(cutoutGeometry);
    const resultCSG = shaftCSG.subtract(cutoutCSG);
    return CSG.toBufferGeometry(resultCSG);
}

/**
 * Create a detented shaft geometry.
 * @param {number} diameter - Diameter of the shaft.
 * @param {number} height - Height of the knob.
 * @returns {THREE.BufferGeometry} - Detented shaft geometry.
 */
function createDetentedShaft(diameter, height) {
    const shaftGeometry = new THREE.CylinderGeometry(
        diameter / 2,
        diameter / 2,
        height * 1.1,
        32,
        1,
        false
    );

    const detentCount = 20;
    const detentWidth = 0.5;
    const detentHeight = diameter / 4;

    for (let i = 0; i < detentCount; i++) {
        const angle = (i / detentCount) * Math.PI * 2;
        const detentGeometry = new THREE.BoxGeometry(
            detentWidth,
            height * 1.2,
            detentHeight
        );

        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(Math.cos(angle) * (diameter / 2), 0, Math.sin(angle) * (diameter / 2));
        matrix.makeRotationY(angle);

        detentGeometry.applyMatrix4(matrix);
        shaftGeometry.merge(detentGeometry);
    }

    return shaftGeometry;
}

/**
 * Add a top indent to the knob.
 * @param {THREE.BufferGeometry} baseGeometry - The base knob geometry.
 * @param {number} diameter - Diameter of the knob.
 * @param {number} height - Height of the knob.
 * @returns {THREE.BufferGeometry} - Geometry with top indent.
 */
function addTopIndent(baseGeometry, diameter, height) {
    const indentRadius = diameter * 0.3;
    const indentDepth = height * 0.2;

    const sphereGeometry = new THREE.SphereGeometry(
        indentRadius,
        32,
        32,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    );

    // Position sphere at top of knob
    sphereGeometry.translate(0, height / 2, 0);

    return mergeBufferGeometries([baseGeometry, sphereGeometry]);
}

/**
 * Subtract one geometry from another using CSG.
 * @param {THREE.BufferGeometry} geometryA - The geometry to subtract from.
 * @param {THREE.BufferGeometry} geometryB - The geometry to subtract.
 * @returns {THREE.BufferGeometry} - Resulting geometry after subtraction.
 */
function subtractGeometry(geometryA, geometryB) {
    const CSG = require('@jscad/csg'); // Ensure you have a CSG library available
    const aCSG = CSG.fromBufferGeometry(geometryA);
    const bCSG = CSG.fromBufferGeometry(geometryB);
    const resultCSG = aCSG.subtract(bCSG);
    return CSG.toBufferGeometry(resultCSG);
}

/**
 * Helper function to merge multiple BufferGeometries.
 * @param {THREE.BufferGeometry[]} geometries - Array of geometries to merge.
 * @returns {THREE.BufferGeometry} - Merged geometry.
 */
function mergeBufferGeometries(geometries) {
    const mergedGeometry = new THREE.BufferGeometry();
    const position = [];
    const normal = [];
    const index = [];

    let vertexOffset = 0;

    geometries.forEach((geometry) => {
        const pos = geometry.attributes.position.array;
        const norm = geometry.attributes.normal.array;
        const idx = geometry.index ? geometry.index.array : null;

        for (let i = 0; i < pos.length; i++) {
            position.push(pos[i]);
            normal.push(norm[i]);
        }

        if (idx) {
            for (let i = 0; i < idx.length; i++) {
                index.push(idx[i] + vertexOffset);
            }
        } else {
            for (let i = 0; i < pos.length / 3; i++) {
                index.push(vertexOffset + i);
            }
        }

        vertexOffset += pos.length / 3;
    });

    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
    mergedGeometry.setIndex(index);

    mergedGeometry.computeVertexNormals();

    return mergedGeometry;
}
