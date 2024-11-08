// /js/knobGeometry.js

import * as THREE from 'three';
import { CSG } from 'https://unpkg.com/three-csg-ts@3.2.0/lib/esm/CSG.js';

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
    const knobGeometry = new THREE.CylinderGeometry(knobDia / 2, knobDia / 2, knobHeight, 64, 1, false);
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

function addOuterRidges(baseMesh, count, diameter, height) {
    const ridgeWidth = 0.5;
    const ridgeHeight = height * 0.8;
    const ridgeDepth = 1;

    let baseCSG = CSG.fromMesh(baseMesh);

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, ridgeDepth);
        const ridgeMesh = new THREE.Mesh(ridgeGeometry);

        // Position ridge
        const radius = diameter / 2 + ridgeDepth / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        ridgeMesh.position.set(x, ridgeHeight / 2, z);
        ridgeMesh.rotation.y = angle;

        // Convert ridge mesh to CSG
        const ridgeCSG = CSG.fromMesh(ridgeMesh);

        // Union the ridge with the base
        baseCSG = baseCSG.union(ridgeCSG);
    }

    // Convert the final CSG back to a mesh
    const mergedMesh = CSG.toMesh(baseCSG, baseMesh.matrix, baseMesh.material);

    return mergedMesh;
}

function addTopIndent(baseMesh, diameter, height) {
    const indentRadius = diameter * 0.3;

    // Create indent geometry (half-sphere)
    const indentGeometry = new THREE.SphereGeometry(indentRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const indentMesh = new THREE.Mesh(indentGeometry);
    indentMesh.position.set(0, height, 0); // Position at the top of the knob

    // Perform CSG subtraction
    const baseCSG = CSG.fromMesh(baseMesh);
    const indentCSG = CSG.fromMesh(indentMesh);
    const mergedCSG = baseCSG.subtract(indentCSG);
    const mergedMesh = CSG.toMesh(mergedCSG, baseMesh.matrix, baseMesh.material);

    return mergedMesh;
}

function createShaftHole(baseMesh, shaftType, shaftDia, height) {
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

    // Perform CSG subtraction
    const baseCSG = CSG.fromMesh(baseMesh);
    const shaftCSG = CSG.fromMesh(shaftMesh);
    const finalCSG = baseCSG.subtract(shaftCSG);
    const finalMesh = CSG.toMesh(finalCSG, baseMesh.matrix, baseMesh.material);

    return finalMesh;
}

function createDShapedShaft(diameter, height) {
    const shaftGeometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 32);
    const shaftMesh = new THREE.Mesh(shaftGeometry);

    const cutoutGeometry = new THREE.BoxGeometry(diameter, height, diameter / 3);
    const cutoutMesh = new THREE.Mesh(cutoutGeometry);
    cutoutMesh.position.set(0, 0, diameter / 6);

    // Perform CSG subtraction
    const shaftCSG = CSG.fromMesh(shaftMesh);
    const cutoutCSG = CSG.fromMesh(cutoutMesh);
    const dShapedCSG = shaftCSG.subtract(cutoutCSG);
    const dShapedMesh = CSG.toMesh(dShapedCSG, shaftMesh.matrix, shaftMesh.material);

    return dShapedMesh.geometry;
}

function createDetentedShaft(diameter, height) {
    const shaftGeometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 32);
    const shaftMesh = new THREE.Mesh(shaftGeometry);

    // Create detents as small boxes around the shaft
    const detentCount = 20;
    const detentWidth = 0.5;
    const detentDepth = 1;
    const detentHeight = height * 1.2;

    let detentsCSG = null;

    for (let i = 0; i < detentCount; i++) {
        const angle = (i / detentCount) * Math.PI * 2;
        const detentGeometry = new THREE.BoxGeometry(detentWidth, detentHeight, detentDepth);
        const detentMesh = new THREE.Mesh(detentGeometry);

        const radius = diameter / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        detentMesh.position.set(x, 0, z);
        detentMesh.rotation.y = angle;

        const detentCSG = CSG.fromMesh(detentMesh);

        if (detentsCSG) {
            detentsCSG = detentsCSG.union(detentCSG);
        } else {
            detentsCSG = detentCSG;
        }
    }

    // Perform CSG subtraction to create detents
    const shaftCSG = CSG.fromMesh(shaftMesh);
    const detentedCSG = shaftCSG.subtract(detentsCSG);
    const detentedMesh = CSG.toMesh(detentedCSG, shaftMesh.matrix, shaftMesh.material);

    return detentedMesh.geometry;
}
