// /js/knobGeometry.js

import * as THREE from 'three';
// Import the CSG library (ensure the path is correct or use a CDN)
import { CSG } from 'https://unpkg.com/three-csgmesh@1.0.2/build/three-csgmesh.module.js';

/**
 * Creates the geometry for the knob based on provided parameters.
 * @param {Object} params - The knob parameters.
 * @returns {THREE.BufferGeometry} - The generated knob geometry.
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

    // Base knob geometry
    let knobGeometry = new THREE.CylinderGeometry(knobDia / 2, knobDia / 2, knobHeight, 64, 1, false);
    knobGeometry.translate(0, knobHeight / 2, 0); // Position the knob so that its base is at y=0

    let knobMesh = new THREE.Mesh(knobGeometry);

    // Add outer ridges if enabled
    if (outerRidged) {
        knobMesh = addOuterRidges(knobMesh, noOfOuterRidges, knobDia, knobHeight);
    }

    // Add top indent if enabled
    if (makeTopIndent) {
        knobMesh = addTopIndent(knobMesh, knobDia, knobHeight);
    }

    // Create shaft hole
    if (shaftDia > 0) {
        knobMesh = createShaftHole(knobMesh, shaftType, shaftDia, knobHeight);
    }

    return knobMesh.geometry;
}

/**
 * Adds outer ridges to the knob.
 * @param {THREE.Mesh} baseMesh - The base knob mesh.
 * @param {number} count - Number of ridges.
 * @param {number} diameter - Diameter of the knob.
 * @param {number} height - Height of the knob.
 * @returns {THREE.Mesh} - The knob mesh with ridges.
 */
function addOuterRidges(baseMesh, count, diameter, height) {
    const ridgeWidth = 0.5;
    const ridgeHeight = height * 0.8;
    const ridgeDepth = 1;

    const mergedGeometry = baseMesh.geometry.clone();

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ridge = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, ridgeDepth);
        const ridgeMesh = new THREE.Mesh(ridge);

        // Position ridge
        const radius = diameter / 2 + ridgeDepth / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        ridgeMesh.position.set(x, ridgeHeight / 2, z);
        ridgeMesh.rotation.y = angle;

        // Merge with base geometry using CSG
        const baseCSG = CSG.fromMesh(new THREE.Mesh(mergedGeometry));
        const ridgeCSG = CSG.fromMesh(ridgeMesh);
        const mergedCSG = baseCSG.union(ridgeCSG);
        const mergedMesh = CSG.toMesh(mergedCSG, new THREE.Matrix4());

        mergedGeometry.copy(mergedMesh.geometry);
    }

    baseMesh.geometry = mergedGeometry;
    return baseMesh;
}

/**
 * Adds a top indent to the knob.
 * @param {THREE.Mesh} baseMesh - The base knob mesh.
 * @param {number} diameter - Diameter of the knob.
 * @param {number} height - Height of the knob.
 * @returns {THREE.Mesh} - The knob mesh with a top indent.
 */
function addTopIndent(baseMesh, diameter, height) {
    const indentRadius = diameter * 0.3;
    const indentDepth = height * 0.2;

    // Create indent geometry (half-sphere)
    const indent = new THREE.SphereGeometry(indentRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const indentMesh = new THREE.Mesh(indent);
    indentMesh.position.set(0, height, 0); // Position at the top of the knob

    // Perform CSG subtraction
    const baseCSG = CSG.fromMesh(new THREE.Mesh(baseMesh.geometry));
    const indentCSG = CSG.fromMesh(indentMesh);
    const mergedCSG = baseCSG.subtract(indentCSG);
    const mergedMesh = CSG.toMesh(mergedCSG, new THREE.Matrix4());

    baseMesh.geometry = mergedMesh.geometry;
    return baseMesh;
}

/**
 * Creates a shaft hole in the knob.
 * @param {THREE.Mesh} baseMesh - The base knob mesh.
 * @param {number} shaftType - Type of shaft (0: Round, 1: D-Shape, 2: Detented).
 * @param {number} shaftDia - Diameter of the shaft.
 * @param {number} height - Height of the knob.
 * @returns {THREE.Mesh} - The knob mesh with a shaft hole.
 */
function createShaftHole(baseMesh, shaftType, shaftDia, height) {
    // Shaft hole dimensions
    const shaftHeight = height * 1.1;
    let shaftGeometry;

    switch (shaftType) {
        case 0: // Round shaft
            shaftGeometry = new THREE.CylinderGeometry(shaftDia / 2, shaftDia / 2, shaftHeight, 32);
            break;
        case 1: // D-Shape shaft
            shaftGeometry = createDShapedShaft(shaftDia, shaftHeight);
            break;
        case 2: // Detented shaft
            shaftGeometry = createDetentedShaft(shaftDia, shaftHeight);
            break;
        default:
            console.warn('Unknown shaft type:', shaftType);
            return baseMesh;
    }

    const shaftMesh = new THREE.Mesh(shaftGeometry);
    shaftMesh.position.set(0, height / 2, 0); // Align with the knob

    // Perform CSG subtraction to create the shaft hole
    const baseCSG = CSG.fromMesh(new THREE.Mesh(baseMesh.geometry));
    const shaftCSG = CSG.fromMesh(shaftMesh);
    const finalCSG = baseCSG.subtract(shaftCSG);
    const finalMesh = CSG.toMesh(finalCSG, new THREE.Matrix4());

    baseMesh.geometry = finalMesh.geometry;
    return baseMesh;
}

/**
 * Creates a D-shaped shaft geometry.
 * @param {number} diameter - Diameter of the shaft.
 * @param {number} height - Height of the shaft.
 * @returns {THREE.BufferGeometry} - The D-shaped shaft geometry.
 */
function createDShapedShaft(diameter, height) {
    const shaft = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 32);
    const cutout = new THREE.BoxGeometry(diameter, height, diameter / 3);
    const cutoutMesh = new THREE.Mesh(cutout);
    cutoutMesh.position.set(0, 0, diameter / 6);

    // Perform CSG subtraction
    const shaftCSG = CSG.fromMesh(new THREE.Mesh(shaft));
    const cutoutCSG = CSG.fromMesh(cutoutMesh);
    const dShapedCSG = shaftCSG.subtract(cutoutCSG);
    const dShapedMesh = CSG.toMesh(dShapedCSG, new THREE.Matrix4());

    return dShapedMesh.geometry;
}

/**
 * Creates a Detented shaft geometry.
 * @param {number} diameter - Diameter of the shaft.
 * @param {number} height - Height of the shaft.
 * @returns {THREE.BufferGeometry} - The Detented shaft geometry.
 */
function createDetentedShaft(diameter, height) {
    const shaft = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 32);

    // Create detents as small boxes around the shaft
    const detentCount = 20;
    const detentWidth = 0.5;
    const detentDepth = 1;
    const detentHeight = height * 1.2;

    const detentGeometries = [];

    for (let i = 0; i < detentCount; i++) {
        const angle = (i / detentCount) * Math.PI * 2;
        const detent = new THREE.BoxGeometry(detentWidth, detentHeight, detentDepth);
        const detentMesh = new THREE.Mesh(detent);

        const radius = diameter / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        detentMesh.position.set(x, 0, z);
        detentMesh.rotation.y = angle;

        detentGeometries.push(detentMesh);
    }

    // Merge all detents into a single geometry
    const mergedDetents = new THREE.Geometry();
    detentGeometries.forEach(detentMesh => {
        detentMesh.updateMatrix();
        mergedDetents.merge(detentMesh.geometry, detentMesh.matrix);
    });

    // Perform CSG subtraction to create detents
    const shaftCSG = CSG.fromMesh(new THREE.Mesh(shaft));
    const detentsCSG = CSG.fromMesh(new THREE.Mesh(mergedDetents));
    const detentedCSG = shaftCSG.subtract(detentsCSG);
    const detentedMesh = CSG.toMesh(detentedCSG, new THREE.Matrix4());

    return detentedMesh.geometry;
}
