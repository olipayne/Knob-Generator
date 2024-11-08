// app.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { createKnobGeometry } from './knobGeometry.js';
import { setupUI } from './ui.js';

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
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(50, 30, 50);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
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
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 10);
        this.scene.add(gridHelper);

        // Add axes helper
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
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('threeCanvas');
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        // Reset camera
        document.getElementById('resetCamera').addEventListener('click', () => {
            this.camera.position.set(50, 30, 50);
            this.camera.lookAt(0, 0, 0);
            this.controls.reset();
        });

        // Export STL
        document.getElementById('exportSTL').addEventListener('click', () => {
            const exporter = new STLExporter();
            const stl = exporter.parse(this.scene);
            const blob = new Blob([stl], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'knob.stl';
            link.click();
        });

        // Dark mode toggle
        document.getElementById('toggleTheme').addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
            this.scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                document.getElementById('resetCamera').click();
            }
        });
    }

    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.updateKnob();
    }
}

// Initialize
const app = new KnobGenerator();
setupUI(app);

export default app;