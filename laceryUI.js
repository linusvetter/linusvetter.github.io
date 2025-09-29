import * as THREE from 'three';
import { Lace, BooleanElement, SliderElement, NumberSelectElement, ColorElement, Vec3Element, TextSelectElement } from 'lacery';
import * as utils from './utils.js';
import { createObject } from './objects.js';

/**
 * element for the UI built with Lacery.js 
 * 
 * @property lace - the Lace element of the UI.
 * @property custScene - the customScene the UI is part of.
 * 
 * @property phongFolder - folder for the Phong options.
 * @property shadingFolder - folder for the shading options.
 * @property mapFolder - folder for the mapping options.
 * @property aliasFolder - folder for the aliasing options.
 * @property zFolder - folder for the z-fighting options.
 * @property objectFolder - folder for the general options of the object.
 */

export class laceryUI {
    lace;
    custScene;

    phongFolder;
    shadingFolder;
    mapFolder;
    aliasFolder;
    zFolder;
    objectFolder;

    /**
     * creates a new "laceryUI" instance.
     * 
     * @param cs - the customScene in which the laceryUI resides.
     */

    constructor(cs) {
        // create a container element
        const container = document.getElementById('laceryui');
        document.body.appendChild(container);

        // create a lace
        const lace = new Lace(container);

        // create folders for the different options
        // phong options
        const phongFolder = lace.addFolder("Phong Lighting");
        const ambL = new BooleanElement("Ambient Lighting", cs.phongControls, "ambientEnabled");
        ambL.onChange(() => { utils.toggle("uAmbientFrac", cs.phongControls.ambientEnabled, cs.material, cs.phongControls.ambientFrac) });
        phongFolder.add(ambL);
        const difL = new BooleanElement("Diffuse Lighting", cs.phongControls, "diffuseEnabled");
        difL.onChange(() => { utils.toggle("uDiffuseFrac", cs.phongControls.diffuseEnabled, cs.material, cs.phongControls.diffuseFrac) });
        phongFolder.add(difL);
        const specL = new BooleanElement("Specular Lighting", cs.phongControls, "specularEnabled");
        specL.onChange(() => { utils.toggle("uSpecularFrac", cs.phongControls.specularEnabled, cs.material, cs.phongControls.specularFrac) });
        phongFolder.add(specL);
        const advancedPhong = phongFolder.addFolder("Advanced Options");
        const specP = new SliderElement("Specular Power", cs.phongControls, "specPower", { min: 0, max: 100, step: 0.5 });
        specP.onChange(() => { cs.material.uniforms.uSpecularPow.value = cs.phongControls.specPower });
        advancedPhong.add(specP);
        const ambF = new SliderElement("Ambient Coefficient", cs.phongControls, "ambientFrac", { min: 0, max: 1, step: 0.1 });
        ambF.onChange(() => { if (cs.phongControls.ambientEnabled) { cs.material.uniforms.uAmbientFrac.value = cs.phongControls.ambientFrac } });
        advancedPhong.add(ambF);
        const difF = new SliderElement("Diffuse Coefficient", cs.phongControls, "diffuseFrac", { min: 0, max: 1, step: 0.1 });
        difF.onChange(() => { if (cs.phongControls.diffuseEnabled) { cs.material.uniforms.uDiffuseFrac.value = cs.phongControls.diffuseFrac } });
        advancedPhong.add(difF);
        const specF = new SliderElement("Specular Coefficient", cs.phongControls, "specularFrac", { min: 0, max: 1, step: 0.1 });
        specF.onChange(() => { if (cs.phongControls.specularEnabled) { cs.material.uniforms.uSpecularFrac.value = cs.phongControls.specularFrac } });
        advancedPhong.add(specF);
        advancedPhong.details.open = false;

        // shading options
        const shadingFolder = lace.addFolder("Shading");
        const shSel = new NumberSelectElement("", cs.gimikControls, "shader", { 0: "Phong shading", 1: "Flat shading", 2: "Gouraud shading" }, { hoist: true });
        shSel.onChange(() => cs.material.uniforms.uShaderType.value = cs.gimikControls.shader);
        shadingFolder.add(shSel);

        // mapping options
        const mapFolder = lace.addFolder("Mapping");
        const texSel = new TextSelectElement("Texture Map", cs.mapControls, "textureMap",
            { "nonSel": "None", "earthTextSel": "Earth", "woodTextSel": "Wood", "metalTextSel": "Metal", "checkerSel": "Checkerboard", "rainbowSel": "Rainbow Checkerboard", "dispSel": "Displacement Map", "normalSel": "Normal Map" },
            { hoist: true, previewSize: 70, previews: ["textures/transparent.png", "textures/earthText.png", "textures/wood_diff_1k.png", "textures/metal_plate_diff_1k.png", "textures/checker.png", "textures/rainbowChecker.png", "textures/transparent.png", "textures/transparent.png"] }
        );
        texSel.onChange(() => { utils.getTexture(cs.mapControls.textureMap, cs.material, "texture"); });
        mapFolder.add(texSel);
        const disSel = new TextSelectElement("Displacement Map", cs.mapControls, "displacementMap",
            { "nonSel": "None", "earthHeightSel": "Earth", "woodDispSel": "Wood", "metalDispSel": "Metal", "checkerSel": "Checkerboard" },
            { hoist: true, previewSize: 70, previews: ["textures/transparent.png", "textures/earthbump1k.jpg", "textures/wood_disp_1k.png", "textures/metal_plate_disp_1k.png", "textures/checker.png"] }
        );
        disSel.onChange(() => {
            utils.getTexture(cs.mapControls.displacementMap, cs.material, "displacement");
            utils.getTexture(cs.mapControls.textureMap, cs.material, "texture");
        });
        mapFolder.add(disSel);
        const norSel = new TextSelectElement("Normal Map", cs.mapControls, "normalMap",
            { "nonSel": "None", "earthNormalSel": "Earth", "woodNormalSel": "Wood", "metalNormalSel": "Metal", "checkerNormalSel": "Checkerboard" },
            { hoist: true, previewSize: 80, previews: ["textures/transparent.png", "textures/earthNormals_inverted.jpg", "textures/wood_normal_1k.png", "textures/metal_plate_normal_1k.png", "textures/checker_normal.png"] }
        );
        norSel.onChange(() => {
            utils.getTexture(cs.mapControls.normalMap, cs.material, "normal");
            utils.getTexture(cs.mapControls.textureMap, cs.material, "texture");
        });
        mapFolder.add(norSel);
        const skyb = new TextSelectElement("Skybox and Environment Map", cs.mapControls, "skyboxTexture", { "nonSel": "None", "bridgeSel": "Bridge", "colosseumSel": "Colosseum" }, { help: "required for the options below" });
        skyb.onChange(() => {
            cs.updateSkybox();
        });
        mapFolder.add(skyb);
        const refl = new BooleanElement("Reflection", cs.mapControls, "reflectionEnabled");
        refl.onChange(() => { cs.material.uniforms.uRefl.value = cs.mapControls.reflectionEnabled; });
        mapFolder.add(refl);
        const refr = new BooleanElement("Refraction", cs.mapControls, "refractionEnabled");
        refr.onChange(() => { cs.material.uniforms.uRefr.value = cs.mapControls.refractionEnabled; });
        mapFolder.add(refr);
        const mir = new BooleanElement("Mirror", cs.mapControls, "mirrorEnabled", { help: "Mirror will overwrite some other selections" });
        mir.onChange(() => {
            cs.material.uniforms.uMirror.value = cs.mapControls.mirrorEnabled;
            refl.checkbox.disabled = cs.mapControls.mirrorEnabled;
            refr.checkbox.disabled = cs.mapControls.mirrorEnabled;
        });
        mapFolder.add(mir);

        // antialias options
        const aliasFolder = lace.addFolder("Aliasing");
        const magF = new NumberSelectElement("Magnification Filtering", cs.gimikControls, "magnification", { 0: "Nearest Neighbor", 1: "Bilinear" }, { hoist: true });
        magF.onChange(() => { utils.updateTexture(cs.material.uniforms.uSamplerTexture.value, cs.gimikControls) });
        aliasFolder.add(magF);
        const mmSel = new NumberSelectElement("Mip Mapping", cs.gimikControls, "mipmap", { 0: "Off", 1: "On", 2: "Visible Checkerboard" }, { hoist: true });
        mmSel.onChange(() => { utils.updateTexture(cs.material.uniforms.uSamplerTexture.value, cs.gimikControls) });
        aliasFolder.add(mmSel);
        const minF = new NumberSelectElement("Minification Filtering", cs.gimikControls, "minification", { 0: "Nearest Neighbor", 1: "Bilinear" }, { hoist: true });
        minF.onChange(() => { utils.updateTexture(cs.material.uniforms.uSamplerTexture.value, cs.gimikControls) });
        aliasFolder.add(minF);
        const ssaa = new SliderElement("Supersampling Level", cs.gimikControls, "supersampling", { min: 0, max: 5, step: 1 });
        aliasFolder.add(ssaa);
        const aliasTexSel = new TextSelectElement("Texture", cs.mapControls, "textureMap",
            { "nonSel": "Checkerboard", "aliasPixelNoise": "Pixel Noise", "earthTextSel": "Earth" },
            { hoist: true, previewSize: 70, previews: ["mipmaps/checker_mipmap_0.png", "textures/colorNoise.png", "textures/earthText.png"] }
        );
        aliasTexSel.onChange(() => { utils.getTexture(cs.mapControls.textureMap, cs.material, "alias"); utils.updateTexture(cs.material.uniforms.uSamplerTexture.value, cs.gimikControls); });
        aliasFolder.add(aliasTexSel);

        // z-fighting options
        const zFolder = lace.addFolder("Z-Fighting");
        const ang = new SliderElement("Angle", cs.gimikControls, "rotation", { min: 0, max: 0.001, step: 0.00001 });
        zFolder.add(ang);
        const ldb = new BooleanElement("Logarithmic Depth Buffer", cs.gimikControls, "logdepthbuffer");
        ldb.onChange(() => {
            if (cs.gimikControls.logdepthbuffer) {
                cs.ldbRenderer.domElement.style.display = 'block';
                cs.renderer.domElement.style.display = 'none';
                cs.currentRenderer = cs.ldbRenderer;
            } else {
                cs.renderer.domElement.style.display = 'block';
                cs.ldbRenderer.domElement.style.display = 'none';
                cs.currentRenderer = cs.renderer;
            }
        })
        zFolder.add(ldb);
        const Zres = new SliderElement("Geometric resolution", cs.objectAttributes, "resolution", { min: 1, max: 400, step: 1 });
        Zres.onChange(() => { cs.mesh = createObject(cs) });
        zFolder.add(Zres);

        // general options
        const objectFolder = lace.addFolder("General");
        const chGeo = new NumberSelectElement("Geometry", cs.objectAttributes, "whatObject", { 0: "Sphere", 1: "Cube", 2: "Torus", 3: "Bunny" })
        chGeo.onChange(() => { cs.mesh = createObject(cs); });
        // temporary bug fix
        chGeo.select.placeholder = "Sphere";
        objectFolder.add(chGeo);
        objectFolder.add(new BooleanElement("Auto Rotate", cs.objectAttributes, "autoMoveEnabled"));
        const wirF = new BooleanElement("Wireframe", cs.objectAttributes, "wireFrameEnabled");
        wirF.onChange(() => {
            cs.material.wireframe = cs.objectAttributes.wireFrameEnabled;
            if (cs.material1 != null) {
                cs.material1.wireframe = cs.objectAttributes.wireFrameEnabled;
                cs.material2.wireframe = cs.objectAttributes.wireFrameEnabled;
                cs.material3.wireframe = cs.objectAttributes.wireFrameEnabled;
            }
        });
        objectFolder.add(wirF);
        const col = new ColorElement("Color", cs.objectAttributes, "color");
        col.onChange(() => {
            cs.material.uniforms.uColor.value = new THREE.Color((cs.objectAttributes.color));
            if (cs.material1 != null) {
                cs.material1.uniforms.uColor.value = new THREE.Color((cs.objectAttributes.color));;
                cs.material2.uniforms.uColor.value = new THREE.Color((cs.objectAttributes.color));;
                cs.material3.uniforms.uColor.value = new THREE.Color((cs.objectAttributes.color));;
            }
            cs.mesh = createObject(cs);
        });
        col.colorPicker.hoist = true;
        objectFolder.add(col);
        const nrVert = new SliderElement("Geometric resolution", cs.objectAttributes, "resolution", { min: 1, max: 400, step: 1 });
        nrVert.onChange(() => { cs.mesh = createObject(cs) });
        objectFolder.add(nrVert);
        chGeo.onChange(() => { nrVert.range.disabled = (cs.objectAttributes.whatObject == 3); cs.mesh = createObject(cs); });
        const lipos = new Vec3Element("Light Position", cs.objectAttributes, "lX", "lY", "lZ");
        lipos.onChange(() => {
            cs.light.updatePosition(cs.objectAttributes.lX, cs.objectAttributes.lY, cs.objectAttributes.lZ);
        });
        objectFolder.add(lipos);

        // add all the folders to the object for easy access
        this.phongFolder = phongFolder;
        this.shadingFolder = shadingFolder;
        this.mapFolder = mapFolder;
        this.aliasFolder = aliasFolder;
        this.zFolder = zFolder;
        this.objectFolder = objectFolder;
        this.lace = lace;
        this.custScene = cs;
    }

    // hide and open all folders, but show all elements inside
    cleanUp() {
        this.lace.hideAll();
        this.phongFolder.details.open = true;
        this.mapFolder.details.open = true;
        this.shadingFolder.details.open = true;
        this.objectFolder.details.open = true;
        this.objectFolder.elements[4].range.disabled = false;
        this.objectFolder.show(this.objectFolder.elements[0]);
        this.objectFolder.show(this.objectFolder.elements[1]);
    }

    // update all the lacery folders to display correct values
    update() {
        this.phongFolder.update();
        this.shadingFolder.update();
        this.mapFolder.update();
        this.aliasFolder.update();
        this.zFolder.update();
        this.objectFolder.update();
    }

    // show a specific folder
    show(folder) {
        switch (folder) {
            case "phong":
                this.lace.show(this.phongFolder);
                break;
            case "shader":
                this.lace.show(this.shadingFolder);
                break;
            case "map":
                this.lace.show(this.mapFolder);
                break;
            case "alias":
                this.lace.show(this.aliasFolder);
                break;
            case "zfight":
                this.lace.show(this.zFolder);
                break;
            case "general":
                this.lace.show(this.objectFolder);
                break;
        }
    }

    // update the material 
    updateMaterial(material) {
        this.custScene.material = material;
    }
}