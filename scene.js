import * as THREE from 'three';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { SSAARenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/SSAARenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/shaders/CopyShader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import * as utils from './utils.js';
import * as skybox from './skybox.js';
import * as objects from './objects.js';
import { visualLight } from './lights.js';
import { laceryUI } from './laceryUI.js';
import { showInfo, hideInfo } from './infotext.js';

// import all the different shaders
import phongVertShader from './shaders/phongVert.js';
import phongFragShader from './shaders/phongFrag.js';
import flatVertShader from './shaders/flatVert.js';
import flatFragShader from './shaders/flatFrag.js';
import gouraudVertShader from './shaders/gouraudVert.js';
import gouraudFragShader from './shaders/gouraudFrag.js';
import mapVertShader from './shaders/mapVert.js';
import mapFragShader from './shaders/mapFrag.js';
import masterVertShader from './shaders/masterVert.js';
import masterFragShader from './shaders/masterFrag.js';

/**
 * customScene holds all the important info and different components of the scene
 * 
 * @property scene - the actual THREE.js scene.
 * @property currentRenderer - the current renderer of the scene.
 * @property renderer - the normal renderer of the scene.
 * @property ldbRenderer - renderer with a logarithmic depth buffer.
 * @property composer - the composer that can render with super sampling.
 * @property camera - the camera of the scene.
 * @property controls - the OrbitControls (for the renderer) to navigate the scene.
 * @property logControls - the OrbitControls for the ldbRenderer.
 * @property laceryUIElement - the LaceryUI that holds all the components of the "Options" UI.
 * @property light - the visualLight that holds all components of the light.
 * 
 * @property mesh - the mesh of the object in the scene.
 * @property pivot - a pivot to which the object gets attached to, used for rotating the object.
 * @property material - material of the object.
 * @property material1 - gouraud shading material.
 * @property material2 - flat shading material.
 * @property material3 - phong shading material.
 * @property skyBoxElem - the skybox of the scene.
 * 
 * @property whatScene - integer that indicates what scene is currently selected.
 * @property rotationSpeed - constant how fast the objects rotate in each animation step.
 * @property phongControls - stores all the settings of the phong options.
 * @property mapControls - stores all the settings of the mapping options.
 * @property gimikControls - stores all the settings of the remaining options of the scenes.
 * @property objectAttributes - stores all the settings from the general options of the object.
 */

export class customScene {
    // components of the scene
    scene;
    currentRenderer;
    renderer;
    ldbRenderer;
    composer;
    camera;
    controls;
    logControls;
    laceryUIElement;
    light;

    // components needed for the object and background
    mesh;
    pivot;
    material;
    material1;
    material2;
    material3;
    skyBoxElem;

    // option parameters
    whatScene = 0;
    rotationspeed = 0.005;
    phongControls = { ambientEnabled: true, diffuseEnabled: true, specularEnabled: true, specPower: 50, ambientFrac: 0.3, diffuseFrac: 0.9, specularFrac: 1.0 };
    mapControls = { textureMap: "nonSel", displacementMap: "nonSel", normalMap: "nonSel", skyboxTexture: "nonSel", reflectionEnabled: false, refractionEnabled: false, mirrorEnabled: false }
    gimikControls = { shader: 0, supersampling: 0, minification: 0, magnification: 0, mipmap: 0, rotation: 0, opacity: 0.4, layers: 1, dpEnabled: false, debug: false, logdepthbuffer: false };
    objectAttributes = { color: "rgb(33, 148, 206)", whatObject: 0, autoMoveEnabled: false, wireFrameEnabled: false, lX: 80, lY: 40, lZ: 50, resolution: 96 };

    /**
     * creates a new "visualLight" instance.
     * 
     * @param renderer - the renderer of the scene.
     * @param camera - the camera of the scene.
     * @param controls - the OrbitControls of the scene.
     */

    constructor(renderer, camera, controls) {
        this.renderer = renderer;
        this.currentRenderer = renderer;
        this.camera = camera;
        this.controls = controls;
        // create a scene
        this.scene = new THREE.Scene();
        // create renderer with logarithmic depth buffer
        this.createLdbRenderer();
        // create composer for the super sampling rendering
        this.createComposer();
        // create a lacery UI
        this.laceryUIElement = new laceryUI(this);
        // create the light, lightVisual and lightControl   
        this.light = new visualLight(this.renderer, this, this.camera, this.controls);
        // create the pivot as an anchor for the rotation
        this.pivot = new THREE.Object3D();
        this.scene.add(this.pivot);

        // shoelace button event listeners
        document.querySelector('sl-dropdown[value="sceneSel"]').addEventListener('sl-select', event => {
            this.whatScene = utils.changeScene(event.detail.item.value);
            this.createCustomScene()
        });
        document.querySelector('sl-button[value="resetBtn"]').addEventListener('click', () => { this.createCustomScene() });
        document.querySelector('sl-button[value="infoBtn"]').addEventListener('click', () => { showInfo(this.whatScene) });
        document.querySelector('sl-icon-button[label="closeInfo"]').addEventListener('click', () => { hideInfo() });
        document.querySelector('sl-button[value="optionBtn"]').addEventListener('click', () => { utils.showOpt() });
        document.querySelector('sl-icon-button[label="closeOption"]').addEventListener('click', () => { utils.hideOpt() });
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // to render the correct scene
    createCustomScene() {
        // clean up scene
        this.scene.clear();
        hideInfo();
        this.resetVals();
        // reset rotation of the pivot
        this.pivot.rotation.x = 0;
        this.pivot.rotation.y = 0;
        this.pivot.matrixWorldNeedsUpdate = true;

        this.laceryUIElement.cleanUp();
        // reset renderer to default renderer
        this.renderer.autoClear = true;
        this.renderer.domElement.style.display = 'block';
        this.ldbRenderer.domElement.style.display = 'none';
        this.currentRenderer = this.renderer;
        this.currentRenderer.setAnimationLoop(() => this.animate());

        switch (this.whatScene) {
            case 0:
                // phong scene
                this.objectAttributes.whatObject = 0;
                this.light.updatePosition(80, 40, 50);
                // options
                this.laceryUIElement.show("phong");
                this.laceryUIElement.show("general");

                // material for the object
                this.material = new THREE.ShaderMaterial({
                    vertexShader: phongVertShader,
                    fragmentShader: phongFragShader,
                    wireframe: this.objectAttributes.wireFrameEnabled,
                    uniforms: {
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: this.phongControls.ambientEnabled ? 0.3 : 0.0 },
                        uDiffuseFrac: { value: this.phongControls.diffuseEnabled ? 0.9 : 0.0 },
                        uSpecularFrac: { value: this.phongControls.specularEnabled ? 1.0 : 0.0 },
                        uSpecularPow: { value: this.phongControls.specPower },
                        uScale: { value: 1 }
                    }
                });
                this.laceryUIElement.updateMaterial(this.material);
                break;
            case 1:
                // shading Scene
                this.objectAttributes.resolution = 20;
                this.camera.position.set(0, 0, 31);
                // options
                this.laceryUIElement.show("general");
                this.laceryUIElement.objectFolder.hide(this.laceryUIElement.objectFolder.elements[0]);
                this.laceryUIElement.objectFolder.hide(this.laceryUIElement.objectFolder.elements[1]);

                // materials for the objects
                // gouraud shading
                this.material1 = new THREE.ShaderMaterial({
                    vertexShader: gouraudVertShader,
                    fragmentShader: gouraudFragShader,
                    wireframe: this.objectAttributes.wireFrameEnabled,
                    uniforms: {
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: 0.3 },
                        uDiffuseFrac: { value: 0.9 },
                        uSpecularFrac: { value: 1.0 },
                        uSpecularPow: { value: 50 },
                    }
                });
                // flat shading
                this.material2 = new THREE.ShaderMaterial({
                    vertexShader: flatVertShader,
                    fragmentShader: flatFragShader,
                    wireframe: this.objectAttributes.wireFrameEnabled,
                    uniforms: {
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: 0.3 },
                        uDiffuseFrac: { value: 0.9 },
                        uSpecularFrac: { value: 1.0 },
                        uSpecularPow: { value: 50 }
                    }
                });
                // phong shading
                this.material3 = new THREE.ShaderMaterial({
                    vertexShader: phongVertShader,
                    fragmentShader: phongFragShader,
                    wireframe: this.objectAttributes.wireFrameEnabled,
                    uniforms: {
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: 0.3 },
                        uDiffuseFrac: { value: 0.9 },
                        uSpecularFrac: { value: 1.0 },
                        uSpecularPow: { value: 50 },
                    }
                });
                break;
            case 2:
                // mapping scene
                this.objectAttributes.whatObject = 0;
                this.light.updatePosition(80, 40, 50);

                // options
                this.laceryUIElement.show("map");
                this.laceryUIElement.show("general");

                // material for the object
                this.material = new THREE.ShaderMaterial({
                    vertexShader: mapVertShader,
                    fragmentShader: mapFragShader,
                    defines: { USE_TANGENT: true },
                    uniforms: {
                        uSamplerTexture: { value: null },
                        uText: { value: false },
                        uSamplerNormalMap: { value: null },
                        uNormal: { value: false },
                        uSamplerDisplacement: { value: null },
                        uDisp: { value: false },
                        uSamplerEnvMap: { value: this.skyBoxElem },
                        uRefl: { value: false },
                        uRefr: { value: false },
                        uMirror: { value: false },
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: this.phongControls.ambientFrac },
                        uDiffuseFrac: { value: this.phongControls.diffuseFrac },
                        uSpecularFrac: { value: this.phongControls.specularFrac },
                        uSpecularPow: { value: this.phongControls.specPower },
                        uScale: { value: 1 }
                    }
                });
                this.laceryUIElement.updateMaterial(this.material);
                break;
            case 3:
                // aliasing scene
                // move the light away
                this.light.updatePosition(0, 0, 10000);
                this.camera.position.set(0, 0, 0.1);
                this.controls.update();
                // change to the different renderer with composer
                this.renderer.autoClear = false;
                this.renderer.setAnimationLoop(() => this.ssAnimate());

                // options
                this.laceryUIElement.show("alias");

                // material for the object
                this.material = new THREE.ShaderMaterial({
                    vertexShader: masterVertShader,
                    fragmentShader: masterFragShader,
                    defines: { USE_TANGENT: true },
                    uniforms: {
                        uSamplerTexture: { value: null },
                        uText: { value: true },
                        uSamplerNormalMap: { value: null },
                        uNormal: { value: false },
                        uSamplerDisplacement: { value: null },
                        uDisp: { value: false },
                        uSamplerEnvMap: { value: this.skyBoxElem },
                        uRefl: { value: false },
                        uRefr: { value: false },
                        uMirror: { value: false },
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: 1.0 },
                        uDiffuseFrac: { value: 0.0 },
                        uSpecularFrac: { value: 0.0 },
                        uSpecularPow: { value: this.phongControls.specPower },
                        uScale: { value: 1 },
                        uTile: { value: 800 }
                    }
                });
                this.laceryUIElement.updateMaterial(this.material);
                break;
            case 4:
                // z-fighting scene
                // move the light away
                this.light.updatePosition(0, 0, 100000);
                this.camera.position.set(0, 0, 30);
                this.objectAttributes.resolution = 1;
                this.laceryUIElement.update();
                
                // options
                this.laceryUIElement.show("zfight");
                break;
            case 5:
                // master scene
                this.objectAttributes.whatObject = 1;

                // options
                this.laceryUIElement.lace.showAll();
                this.laceryUIElement.lace.hide(this.laceryUIElement.zFolder);
                this.laceryUIElement.lace.hide(this.laceryUIElement.aliasFolder);
                this.laceryUIElement.phongFolder.details.open = false;
                this.laceryUIElement.mapFolder.details.open = false;
                this.laceryUIElement.shadingFolder.details.open = false;
                this.laceryUIElement.objectFolder.details.open = false;
                this.laceryUIElement.update();

                // material for the object
                this.material = new THREE.ShaderMaterial({
                    vertexShader: masterVertShader,
                    fragmentShader: masterFragShader,
                    defines: { USE_TANGENT: true },
                    uniforms: {
                        uSamplerTexture: { value: null },
                        uText: { value: false },
                        uSamplerNormalMap: { value: null },
                        uNormal: { value: false },
                        uSamplerDisplacement: { value: null },
                        uDisp: { value: false },
                        uSamplerEnvMap: { value: this.skyBoxElem },
                        uRefl: { value: false },
                        uRefr: { value: false },
                        uMirror: { value: false },
                        uShaderType: { value: 0 },
                        uColor: { value: new THREE.Color(this.objectAttributes.color) },
                        uWorldLight: { value: this.light.getPosition() },
                        uAmbientFrac: { value: this.phongControls.ambientFrac },
                        uDiffuseFrac: { value: this.phongControls.diffuseFrac },
                        uSpecularFrac: { value: this.phongControls.specularFrac },
                        uSpecularPow: { value: this.phongControls.specPower },
                        uScale: { value: 1 },
                        uTile: { value: 1 }
                    }
                });
                this.laceryUIElement.updateMaterial(this.material);
                break;
        }

        // skybox
        this.skyBoxElem = skybox.skyBoxInit(this, this.mapControls.skyboxTexture, this.material);

        // create object and add it to scene
        this.mesh = objects.createObject(this);
    }

    // update the light position in the UI
    updateUILight(position) {
        this.objectAttributes.lX = position.x;
        this.objectAttributes.lY = position.y;
        this.objectAttributes.lZ = position.z;
        this.laceryUIElement.update();
    }

    // update the skybox
    updateSkybox() {
        this.skyBoxElem = skybox.skyBoxInit(this, this.mapControls.skyboxTexture, this.material);
    }

    // handle window resize
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.ldbRenderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    // animate function used in the animation loop
    animate() {
        // apply rotation when autoMoveEnabled
        if (this.objectAttributes.autoMoveEnabled && this.mesh != null) {
            // rotate the pivot to which the object is attached to.
            this.pivot.rotation.x += this.rotationspeed;
            this.pivot.rotation.y += this.rotationspeed;
            this.pivot.matrixWorldNeedsUpdate = true;
        }
        // apply rotation of z-fight planes
        if (this.whatScene == 4) {
            this.pivot.rotation.x = this.gimikControls.rotation;
            this.pivot.matrixWorldNeedsUpdate = true;
        }
        this.currentRenderer.render(this.scene, this.camera);
    }

    // animate function for the super sampling animation loop
    ssAnimate() {
        this.renderer.clear();
        // clamp from 0 to 5 and handle NaN
        this.composer.passes[0].sampleLevel = Math.max(0, Math.min(5, this.gimikControls.supersampling || 0));
        this.composer.render();
    }

    // reset the values to default
    resetVals() {
        this.phongControls.ambientEnabled = true;
        this.phongControls.diffuseEnabled = true;
        this.phongControls.specularEnabled = true;
        this.phongControls.specPower = 50;
        this.phongControls.ambientFrac = 0.3;
        this.phongControls.diffuseFrac = 0.9;
        this.phongControls.specularFrac = 1.0;

        this.objectAttributes.color = "rgb(33, 148, 206)";
        this.objectAttributes.whatObject = 0;
        this.objectAttributes.autoMoveEnabled = false;
        this.objectAttributes.wireFrameEnabled = false;
        // light gets reset via light.updatePosition
        this.objectAttributes.resolution = 96;

        this.gimikControls.shader = 0;
        this.gimikControls.supersampling = 0;
        this.gimikControls.minification = 0;
        this.gimikControls.magnification = 0;
        this.gimikControls.mipmap = 0;
        this.gimikControls.rotation = 0;
        this.gimikControls.opacity = 0.4;
        this.gimikControls.layers = 1;
        this.gimikControls.dpEnabled = false;
        this.gimikControls.debug = false;
        this.gimikControls.logdepthbuffer = false;

        this.mapControls.textureMap = "nonSel";
        this.mapControls.displacementMap = "nonSel";
        this.mapControls.normalMap = "nonSel";
        this.mapControls.skyboxTexture = "nonSel";
        this.mapControls.reflectionEnabled = false;
        this.mapControls.refractionEnabled = false;
        this.mapControls.mirrorEnabled = false;

        this.laceryUIElement.update();

        this.light.updatePosition(80, 40, 50);
        this.camera.position.set(0, 0, 25);
        this.camera.rotation.set(0, 0, 0);
        this.controls.update();
    }

    // create composer for supersampling antialiasing
    createComposer() {
        const composer = new EffectComposer(this.renderer);
        const ssaaRenderPassP = new SSAARenderPass(this.scene, this.camera);
        // samleLevel 0 corresponds to no supersampling
        ssaaRenderPassP.sampleLevel = 0;
        composer.addPass(ssaaRenderPassP);
        const shaderPass = new ShaderPass(CopyShader);
        shaderPass.renderToScreen = true;
        composer.addPass(shaderPass);
        composer.setPixelRatio(window.devicePixelRatio);
        this.composer = composer;
    }

    // create renderer with logarithmic depth buffer
    createLdbRenderer() {
        const logRenderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        logRenderer.setSize(window.innerWidth, window.innerHeight);
        logRenderer.shadowMap.enabled = true;
        logRenderer.shadowMap.type = THREE.PCMSoftShadowMap;
        logRenderer.setPixelRatio(window.devicePixelRatio);
        logRenderer.domElement.style.display = 'none';
        document.body.appendChild(logRenderer.domElement);
        this.ldbRenderer = logRenderer;
        // create controls for the ldbRenderer
        this.logControls = new OrbitControls(this.camera, this.ldbRenderer.domElement);
        this.logControls.enablePan = false;
    }
}