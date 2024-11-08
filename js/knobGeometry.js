// knobGeometry.js
import * as THREE from 'three';

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
    const mainGeometry = new THREE.CylinderGeometry(
        knobDia / 2,  // top radius
        knobDia / 2,  // bottom radius
        knobHeight,   // height
        32,          // radial segments
        1,           // height segments
        false        // open-ended
    );

    // Create shaft hole
    const shaftGeometry = createShaftGeometry(shaftType, shaftDia, knobHeight);

    // Use CSG to subtract shaft from main body
    const knobMesh = new THREE.Mesh(mainGeometry);
    const shaftMesh = new THREE.Mesh(shaftGeometry);

    // Position shaft at bottom of knob
    shaftMesh.position.y = -knobHeight / 4;

    // Perform boolean subtraction
    const finalGeometry = subtract(mainGeometry, shaftGeometry);

    // Add ridges if enabled
    if (outerRidged) {
        addRidges(finalGeometry, noOfOuterRidges, knobDia, knobHeight);
    }

    // Add top indent if enabled
    if (makeTopIndent) {
        addTopIndent(finalGeometry, knobDia, knobHeight);
    }

    return finalGeometry;
}

function createShaftGeometry(type, diameter, height) {
    switch (type) {
        case 0: // Round shaft
            return new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1, // Slightly taller to ensure clean boolean operation
                32
            );

        case 1: // D-shaped shaft
            const roundShaft = new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                32
            );

            // Create flat side
            const flatCutout = new THREE.BoxGeometry(
                diameter,
                height * 1.1,
                diameter / 3
            );
            flatCutout.translate(0, 0, diameter / 2);

            // Subtract flat side from round shaft
            return subtract(roundShaft, flatCutout);

        case 2: // Detented shaft
            const baseShaft = new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                20
            );

            // Add detents
            const detentCount = 20;
            const detentDepth = diameter * 0.1;
            const detentWidth = Math.PI / detentCount;

            for (let i = 0; i < detentCount; i++) {
                const angle = (i / detentCount) * Math.PI * 2;
                const detentGeometry = new THREE.BoxGeometry(
                    detentDepth,
                    height * 1.1,
                    detentDepth
                );

                detentGeometry.translate(
                    Math.cos(angle) * (diameter / 2 + detentDepth / 2),
                    0,
                    Math.sin(angle) * (diameter / 2 + detentDepth / 2)
                );

                baseShaft.merge(detentGeometry);
            }

            return baseShaft;
    }
}

function addRidges(geometry, count, diameter, height) {
    const ridgeWidth = 0.5;
    const ridgeHeight = height * 0.8;
    const ridgeDepth = 1;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, ridgeDepth);

        // Position ridge
        const radius = diameter / 2 + ridgeDepth / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        ridgeGeometry.translate(x, 0, z);

        // Rotate ridge to face center
        const rotation = Math.atan2(z, x);
        ridgeGeometry.rotateY(rotation);

        geometry.merge(ridgeGeometry);
    }
}

function addTopIndent(geometry, diameter, height) {
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

    sphereGeometry.translate(0, height / 2, 0);
    geometry.merge(sphereGeometry);
}

// Helper function to perform boolean subtraction
function subtract(geometryA, geometryB) {
    // This is a simplified version - in a real implementation,
    // you would use a proper CSG library like ThreeBSP
    // For now, we'll just return the main geometry
    return geometryA;
}