import * as THREE from 'three';

export function skyBoxInit(cs, whatTexture, material) {
    let skyPath = null;
    let skyBox = null;
    if (whatTexture == "nonSel") {
        // gray background
        cs.scene.background = new THREE.Color(0x777777);
        if (cs.whatScene == 3) {
            // blue background for alias scene
            cs.scene.background = new THREE.Color(0x2194ce);
        }
    } else {
        // select correct skybox path
        switch (whatTexture) {
            case "bridgeSel":
                skyPath = './cubemap/Bridge2/';
                break;
            case "colosseumSel":
                skyPath = './cubemap/colosseum/';
                break;
        }
        // load skybox
        const loader = new THREE.CubeTextureLoader();
        skyBox = loader.load([
            skyPath + 'posx.jpg',
            skyPath + 'negx.jpg',
            skyPath + 'posy.jpg',
            skyPath + 'negy.jpg',
            skyPath + 'posz.jpg',
            skyPath + 'negz.jpg',
        ]);
        // set skybox of the scene
        cs.scene.background = skyBox;
    }
    // update the material
    if (material.hasOwnProperty('uniforms') && material.uniforms.hasOwnProperty('uSamplerEnvMap')) {
        // little easter egg, if light is at (24, 11, 2000)
        // doesn't change env map to get different reflection from skybox
        if (!cs.light.getPosition().equals(new THREE.Vector3(24, 11, 2000))) {
            material.uniforms.uSamplerEnvMap.value = skyBox;
        }
    }
    return skyBox;
}