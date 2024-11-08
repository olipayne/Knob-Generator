// /js/app.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { createKnobGeometry } from './knobGeometry.js'; // Ensure this path is correct

/**
 * KnobGenerator Class
 * Manages the Three.js scene, knob generation, UI interactions, and STL export.
 */
class KnobGenerator {
    constructor() {
        // Three.js essentials
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Knob mesh
        this.knobMesh = null;

        // Default parameters
        this.params = {
            knobDia: 35,           // Diameter in mm
            knobHeight: 14,        // Height in mm
            shaftType: 0,          // 0: Round, 1: D-Shape, 2: Detented
            shaftDia: 6,           // Shaft Diameter in mm
            outerRidged: true,     // Boolean to toggle ridges
            noOfOuterRidges: 50,   // Number of ridges
            makeTopIndent: true    // Boolean to toggle top indent
        };

        // Initialize the scene
        this.init();

        // Bind methods to ensure proper 'this' context
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }

    /**
     * Initializes the Three.js scene, camera, renderer, controls, and lighting.
     */
    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // Dark background for better visibility

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
        this.updateKnob();

        // Start Animation Loop
        this.animate();

        // Handle Window Resize
        window.addEventListener('resize', this.onWindowResize, false);
    }

    /**
     * Sets up the lighting for the scene.
     */
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

    /**
     * Creates or updates the knob mesh based on current parameters.
     */
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

    /**
     * Animation loop for rendering the scene.
     */
    animate() {
        requestAnimationFrame(this.animate);

        // Update controls
        this.controls.update();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handles window resize events to adjust camera and renderer.
     */
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

    /**
     * Updates knob parameters and regenerates the knob.
     * @param {Object} newParams - An object containing parameters to update.
     */
    updateParams(newParams) {
        // Merge new parameters with existing ones
        Object.assign(this.params, newParams);

        // Regenerate knob
        this.updateKnob();
    }

    /**
     * Exports the current scene (knob) as an STL file.
     */
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

    /**
     * Resets the camera to its default position and orientation.
     */
    resetCamera() {
        // Reset camera position
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Reset controls
        this.controls.reset();
    }

    /**
     * Updates the scene background based on the theme.
     * @param {boolean} isDark - Whether the dark theme is active.
     */
    updateSceneBackground(isDark) {
        this.scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
    }
}

export { KnobGenerator };
