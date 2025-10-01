import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { customScene } from './scene.js';

// initialize the scene:
//----------------------
// create renderer
const renderer = createRenderer();
// create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
// orbit controlls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
// create custom scene element
const custScene = new customScene(renderer, camera, controls);
// create the actual scene
custScene.createCustomScene();
// start animation loop
renderer.setAnimationLoop(() => custScene.animate());


// create renderer
function createRenderer() {
    //const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, antialias: true });
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCMSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    return renderer;
}     