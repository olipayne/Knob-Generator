// /js/app.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { createKnobGeometry } from './knobGeometry.js';

/**
 * KnobGenerator Class
 * Initializes the Three.js scene, handles knob creation and updates,
 * and manages exporting the knob as an STL file.
 */
class KnobGenerator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.knobMesh = null;
        this.params = {
            knobDia: 35,
            knobHeight: 14,
            shaftType: 0,
            shaftDia: 6,
            outerRidged: true,
            noOfOuterRidges: 50,
            makeTopIndent: true
        };

        this.init();
    }

    /**
     * Initialize the Three.js scene, camera, renderer, controls, lighting,
     * and create the initial knob.
     */
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Camera setup
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 200;

        // Lighting
        this.setupLighting();

        // Initial knob creation
        this.updateKnob();

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Setup ambient, directional, and point lights, along with helpers.
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(100, 10);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);
    }

    /**
     * Create or update the knob mesh based on current parameters.
     */
    updateKnob() {
        if (this.knobMesh) {
            this.scene.remove(this.knobMesh);
        }

        // Create knob geometry using the knobGeometry module
        const geometry = createKnobGeometry(this.params);

        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 30,
            specular: 0x444444
        });

        this.knobMesh = new THREE.Mesh(geometry, material);
        this.knobMesh.castShadow = true;
        this.knobMesh.receiveShadow = true;

        this.scene.add(this.knobMesh);
    }

    /**
     * Animation loop to render the scene and update controls.
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize events to adjust camera and renderer.
     */
    onWindowResize() {
        const canvas = document.getElementById('threeCanvas');
        if (canvas && this.camera && this.renderer) {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height, false);
        }
    }

    /**
     * Update parameters and refresh the knob mesh.
     * @param {Object} newParams - Key-value pairs of parameters to update.
     */
    updateParams(newParams) {
        Object.assign(this.params, newParams);
        this.updateKnob();
    }

    /**
     * Export the current scene as an STL file.
     */
    exportSTL() {
        const exporter = new STLExporter();
        const stl = exporter.parse(this.scene, { binary: true });
        const blob = new Blob([stl], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'knob.stl';
        link.click();
    }

    /**
     * Reset the camera to its initial position and orientation.
     */
    resetCamera() {
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    /**
     * Toggle between light and dark themes.
     */
    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
        this.scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
    }
}

export { KnobGenerator };
