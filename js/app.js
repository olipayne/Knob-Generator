// /js/app.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { createKnobGeometry } from './knobGeometry.js';

class KnobGenerator {
    constructor() {
        // Initialize Three.js essentials
        this.init();

        // Start the animation loop
        this.animate();
    }

    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // Dark background

        // Create Camera
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) {
            console.error('Canvas element with ID "threeCanvas" not found.');
            return;
        }

        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Create Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 200;

        // Setup Lighting
        this.setupLighting();

        // Create Initial Knob
        this.params = {
            knobDia: 35,
            knobHeight: 14,
            shaftType: 0,
            shaftDia: 6,
            outerRidged: true,
            noOfOuterRidges: 50,
            makeTopIndent: true
        };
        this.updateKnob();

        // Handle Window Resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        this.scene.add(ambientLight);

        // Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);

        // Point Light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-50, -50, -50);
        this.scene.add(pointLight);

        // Optional: Helpers (can be removed in production)
        const gridHelper = new THREE.GridHelper(100, 10);
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);
    }

    updateKnob() {
        // Remove existing knob mesh if present
        if (this.knobMesh) {
            this.scene.remove(this.knobMesh);
            this.knobMesh.geometry.dispose();
            this.knobMesh.material.dispose();
            this.knobMesh = null;
        }

        // Generate knob geometry using knobGeometry.js
        const geometry = createKnobGeometry(this.params);
        if (!geometry) {
            console.error('Failed to create knob geometry.');
            return;
        }

        // Create Material
        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,       // Gray color
            shininess: 30,
            specular: 0x444444
        });

        // Create Mesh
        this.knobMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.knobMesh);
    }

    // Define animate as an arrow function to bind 'this' automatically
    animate = () => {
        requestAnimationFrame(this.animate);

        // Update controls
        this.controls.update();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(width, height);
    }

    updateParams(newParams) {
        // Merge new parameters with existing ones
        Object.assign(this.params, newParams);

        // Regenerate knob
        this.updateKnob();
    }

    exportSTL() {
        const exporter = new STLExporter();
        const stl = exporter.parse(this.knobMesh, { binary: true });

        // Create a blob from the STL data
        const blob = new Blob([stl], { type: 'application/octet-stream' });

        // Create a download link and trigger it
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'knob.stl';
        link.click();

        // Cleanup
        URL.revokeObjectURL(link.href);
    }

    resetCamera() {
        // Reset camera position
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Reset controls
        this.controls.reset();
    }

    updateSceneBackground(isDark) {
        this.scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
    }
}

export { KnobGenerator };
