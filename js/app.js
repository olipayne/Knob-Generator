// app.js
import * as THREE from 'three';

// Using global OrbitControls and STLExporter that were loaded in script tags
const { OrbitControls } = THREE;
const { STLExporter } = THREE;
import { createKnobGeometry } from '/js/knobGeometry.js';

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
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

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
    }

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

    updateKnob() {
        if (this.knobMesh) {
            this.scene.remove(this.knobMesh);
        }

        const geometry = createKnobGeometry(this.params);
        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 30,
            specular: 0x444444
        });

        this.knobMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.knobMesh);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('threeCanvas');
            if (canvas && this.camera && this.renderer) {
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
            }
        });

        // UI controls
        const handleInputChange = (id, key, transform = (x) => x) => {
            const element = document.getElementById(id);
            if (element) {
                const setValue = () => {
                    const value = transform(element.type === 'checkbox' ? element.checked : element.value);
                    this.params[key] = value;
                    const valueDisplay = document.getElementById(`${id}Value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = typeof value === 'number' ? `${value}mm` : value;
                    }
                    this.updateKnob();
                };
                element.addEventListener('input', setValue);
                element.addEventListener('change', setValue);
            }
        };

        // Setup all control listeners
        handleInputChange('knobDia', 'knobDia', parseFloat);
        handleInputChange('knobHeight', 'knobHeight', parseFloat);
        handleInputChange('shaftDia', 'shaftDia', parseFloat);
        handleInputChange('shaftType', 'shaftType', parseInt);
        handleInputChange('outerRidged', 'outerRidged');
        handleInputChange('noOfOuterRidges', 'noOfOuterRidges', parseInt);
        handleInputChange('makeTopIndent', 'makeTopIndent');

        // Export STL
        const exportButton = document.getElementById('exportSTL');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const exporter = new STLExporter();
                const stl = exporter.parse(this.scene, { binary: true });
                const blob = new Blob([stl], { type: 'application/octet-stream' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'knob.stl';
                link.click();
            });
        }

        // Reset camera
        const resetButton = document.getElementById('resetCamera');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.camera.position.set(50, 30, 50);
                this.camera.lookAt(0, 0, 0);
                this.controls.reset();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('toggleTheme');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.theme = isDark ? 'dark' : 'light';
                this.scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                const resetButton = document.getElementById('resetCamera');
                if (resetButton) resetButton.click();
            }
        });
    }

    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.updateKnob();
    }
}

// Initialize app and UI
document.addEventListener('DOMContentLoaded', () => {
    const app = new KnobGenerator();

    // Initialize UI values
    Object.entries(app.params).forEach(([key, value]) => {
        const element = document.getElementById(key);
        const valueDisplay = document.getElementById(`${key}Value`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
        if (valueDisplay && typeof value === 'number') {
            valueDisplay.textContent = `${value}mm`;
        }
    });
});