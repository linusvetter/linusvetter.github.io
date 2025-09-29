import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

/**
 * element that holds all the different parts of the light
 * 
 * @property threeLight - the THREE.js light.
 * @property sphereVisual - the yellow sphere indicating the lights position.
 * @property controlVisual - the transformcontrols to move the light.
 * @property customScene - the customScene the light is part of.
 */

export class visualLight {
    threeLight;
    sphereVisual;
    controlVisual;
    customScene;

    /**
     * creates a new "visualLight" instance.
     * 
     * @param renderer - the renderer of the scene.
     * @param scene - the scene in which the visualLight resides.
     * @param camera - the camera of the scene.
     * @param controls - the Orbitcontrols of the scene.
     */

    constructor(renderer, custScene, camera, controls) {

        this.customScene = custScene;
        // create Three.js light for default Three.js materials
        const threeLight = new THREE.PointLight(0x888888, 1, 1000);
        threeLight.position.set(80, 40, 50);
        threeLight.castShadow = true;
        threeLight.shadow.mapSize.width = 4096;
        threeLight.shadow.mapSize.height = 4096;
        this.threeLight = threeLight;

        // make a visible representation of the light
        const geo = new THREE.SphereGeometry(3, 32, 16);
        const mat = new THREE.MeshPhongMaterial({ emissive: 0xfff000 });
        const sphereVisual = new THREE.Mesh(geo, mat);
        this.sphereVisual = sphereVisual;

        // light controls
        const controlVisual = new TransformControls(camera, renderer.domElement);
        controlVisual.addEventListener('change', () => { this.updatePosition(this.getPosition().x, this.getPosition().y, this.getPosition().z) });
        controlVisual.addEventListener('dragging-changed', (event) => {
            controls.enabled = !event.value;
        });
        controlVisual.size = 0.8;
        this.controlVisual = controlVisual;
    }

    // returns the position of the light
    getPosition() {
        return this.sphereVisual.position;
    }

    // adds the light with all components to a provided scene
    addToScene(scene) {
        scene.add(this.threeLight);
        scene.add(this.sphereVisual);
        this.controlVisual.attach(this.sphereVisual);
        scene.add(this.controlVisual);
    }

    // updates the position of the light
    updatePosition(x, y, z) {
        this.threeLight.position.set(x, y, z);
        this.sphereVisual.position.set(x, y, z);
        // update the UI
        this.customScene.updateUILight(this.sphereVisual.position);
    }
}