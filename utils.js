import * as THREE from 'three';
// 'https://cdn.skypack.dev/three@0.132.2'
// "https://cdn.jsdelivr.net/npm/three@v0.132.2/build/three.module.js"

const loader = new THREE.TextureLoader();

// toggle ambient, diffuse or specular component
export function toggle(whatComponent, enabled, material, fraction) {
    if (enabled) {
        material.uniforms[whatComponent].value = fraction;
    } else {
        material.uniforms[whatComponent].value = 0.0;
    }
}

// change the scene that should be rendered
export function changeScene(selection) {
    // reset the checked scene in the dropdown
    var items = document.getElementsByClassName('ddItem');
    for (let i = 0; i < items.length; i++) {
        items[i].checked = false;
    }
    var sceneNr;
    switch (selection) {
        case 'phongSel':
            sceneNr = 0;
            items[0].checked = true;
            break;
        case 'shadingSel':
            sceneNr = 1;
            items[1].checked = true;
            break;
        case 'mapSel':
            sceneNr = 2;
            items[2].checked = true;
            break;
        case 'aliasSel':
            sceneNr = 3;
            items[3].checked = true;
            break;
        case 'zFightSel':
            sceneNr = 4;
            items[4].checked = true;
            break;
        case 'masterSceneSel':
            sceneNr = 5;
            items[5].checked = true;
            break;
    }
    return sceneNr;
}

// loads the textures and changes the maps of the material
export function getTexture(event, material, whatTexture) {
    var texture = null;
    switch (event) {
        case 'nonSel':
            break;
        case 'earthTextSel':
            texture = loader.load('textures/earthText.png');
            break;
        case 'earthHeightSel':
            texture = loader.load('textures/earthbump1k.jpg');
            break;
        case 'earthNormalSel':
            texture = loader.load('textures/earthNormals_inverted.jpg');
            break;
        case 'checkerNormalSel':
            texture = loader.load('textures/checker_normal.png');
            break;
        case 'woodTextSel':
            texture = loader.load('textures/wood_diff_1k.png');
            break;
        case 'woodDispSel':
            texture = loader.load('textures/wood_disp_1k.png');
            break;
        case 'woodNormalSel':
            texture = loader.load('textures/wood_normal_1k.png');
            break;
        case 'metalTextSel':
            texture = loader.load('textures/metal_plate_diff_1k.png');
            break;
        case 'metalDispSel':
            texture = loader.load('textures/metal_plate_disp_1k.png');
            break;
        case 'metalNormalSel':
            texture = loader.load('textures/metal_plate_normal_1k.png');
            break;
        case 'checkerSel':
            texture = loader.load('textures/checker.png');
            break;
        case 'rainbowSel':
            texture = loader.load('textures/rainbowChecker.png');
            break;
        case 'dispSel':
            // take the displacement map texture
            texture = material.uniforms.uSamplerDisplacement.value;
            break;
        case 'normalSel':
            // take the normal map texture
            texture = material.uniforms.uSamplerNormalMap.value;
            break;
        case 'aliasPixelNoise':
            texture = loader.load('textures/colorNoise.png');
            break;
    }

    // special case for anti alias scene, as it needs the 'nonSel' as default for the UI
    if (whatTexture === 'alias' && event === 'nonSel') {
        texture = loader.load('mipmaps/checker_mipmap_0.png');
    }

    switch (whatTexture) {
        // change the correct texture in the material
        case 'texture':
            material.uniforms.uSamplerTexture = { value: texture };
            material.uniforms.uText = { value: (texture == null) ? false : true };
            break;
        case 'displacement':
            material.uniforms.uSamplerDisplacement = { value: texture };
            material.uniforms.uDisp = { value: (texture == null) ? false : true };
            break;
        case 'normal':
            material.uniforms.uSamplerNormalMap = { value: texture };
            material.uniforms.uNormal = { value: (texture == null) ? false : true };
            break;
        case 'alias':
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            material.uniforms.uSamplerTexture = { value: texture };
            break;
    }
    // update the material
    material.needsUpdate = true;
}

// updates the filter type and mipmap of the aliasing scene
export async function updateTexture(texture, gimikControls) {
    // set magnification
    if (gimikControls.magnification == 0) {
        texture.magFilter = THREE.NearestFilter;
    } else {
        texture.magFilter = THREE.LinearFilter;
    }
    // set minification
    if (gimikControls.minification == 0) {
        if (gimikControls.mipmap == 0) {
            texture.minFilter = THREE.NearestFilter;
        } else {
            texture.minFilter = THREE.NearestMipmapNearestFilter
        }
    } else {
        if (gimikControls.mipmap == 0) {
            texture.minFilter = THREE.LinearFilter;
        } else {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
        }
    }
    // load mipmap images
    // ImageLoader is needed, can't use TextureLoader bc mipmap is an array of images not textures!
    const imgLoader = new THREE.ImageLoader();
    switch (Number(gimikControls.mipmap)) {
        case 0:
            // mipmaps off
            texture.mipmaps = [];
            break;
        case 1:
            // automatic mipmaps
            texture.mipmaps = [];
            texture.generateMipmaps = true;
            break;
        case 2:
            // colorful mipmaps of checkerboard
            texture.mipmaps[0] = await imgLoader.loadAsync('mipmaps/checker_mipmap_0.png');
            texture.mipmaps[1] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_1.png');
            texture.mipmaps[2] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_2.png');
            texture.mipmaps[3] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_3.png');
            texture.mipmaps[4] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_4.png');
            texture.mipmaps[5] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_5.png');
            texture.mipmaps[6] = await imgLoader.loadAsync('mipmaps/checker_mipmap_vis_6.png');
            texture.mipmaps[7] = await imgLoader.loadAsync('mipmaps/checker_mipmap_7.png');
            break;
    }
    // update the texture
    texture.needsUpdate = true;
}

// show the options card
export function showOpt() {
    document.getElementById('laceryui').style.visibility = "visible";
}

// hides the options card
export function hideOpt() {
    document.getElementById('laceryui').style.visibility = "hidden";
}