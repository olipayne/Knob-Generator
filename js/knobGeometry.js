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
    const knobGeometry = new THREE.CylinderGeometry(
        knobDia / 2,  // top radius
        knobDia / 2,  // bottom radius
        knobHeight,   // height
        32,          // radial segments
        1,           // height segments
        false        // open-ended
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
    // TODO: Implement proper CSG for shaft hole

    return finalGeometry;
}

function addRidges(baseGeometry, count, diameter, height) {
    const ridgeWidth = 0.5;
    const ridgeHeight = height * 0.8;
    const ridgeDepth = 1;

    // Create a merged geometry
    const geometries = [baseGeometry];

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ridgeGeometry = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, ridgeDepth);

        // Position ridge
        const radius = diameter / 2 + ridgeDepth / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Create transformation matrix
        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(x, 0, z);

        // Rotate ridge to face center
        const rotation = new THREE.Matrix4();
        rotation.makeRotationY(Math.atan2(z, x));
        matrix.multiply(rotation);

        // Apply transformation
        ridgeGeometry.applyMatrix4(matrix);

        geometries.push(ridgeGeometry);
    }

    // Merge all geometries
    const mergedGeometry = mergeBufferGeometries(geometries);
    return mergedGeometry;
}

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
            // TODO: Implement D-shaped shaft
            return new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                32
            );

        case 2: // Detented shaft
            // TODO: Implement detented shaft
            return new THREE.CylinderGeometry(
                diameter / 2,
                diameter / 2,
                height * 1.1,
                32
            );
    }
}

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
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(0, height / 2, 0);
    sphereGeometry.applyMatrix4(matrix);

    return mergeBufferGeometries([baseGeometry, sphereGeometry]);
}

// Helper function to merge buffer geometries
function mergeBufferGeometries(geometries) {
    const positions = [];
    const normals = [];
    const uvs = [];
    let vertexCount = 0;
    const indices = [];

    geometries.forEach(geometry => {
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;
        const uv = geometry.attributes.uv;
        const index = geometry.index;

        // Add positions
        for (let i = 0; i < position.count; i++) {
            positions.push(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );
        }

        // Add normals
        if (normal) {
            for (let i = 0; i < normal.count; i++) {
                normals.push(
                    normal.getX(i),
                    normal.getY(i),
                    normal.getZ(i)
                );
            }
        }

        // Add UVs if they exist
        if (uv) {
            for (let i = 0; i < uv.count; i++) {
                uvs.push(
                    uv.getX(i),
                    uv.getY(i)
                );
            }
        }

        // Add indices
        if (index) {
            for (let i = 0; i < index.count; i++) {
                indices.push(index.getX(i) + vertexCount);
            }
        } else {
            for (let i = 0; i < position.count; i++) {
                indices.push(i + vertexCount);
            }
        }

        vertexCount += position.count;
    });

    const mergedGeometry = new THREE.BufferGeometry();
    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    if (uvs.length > 0) {
        mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
    mergedGeometry.setIndex(indices);

    mergedGeometry.computeVertexNormals();

    return mergedGeometry;
}