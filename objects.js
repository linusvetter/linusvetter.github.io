import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import partyFrag from './shaders/partyFrag.js';
import phongVertShader from './shaders/phongVert.js';

/**
 * creates a new object for the scene
 * 
 * @param cs - the customScene where the object gets added to.
 */

export function createObject(cs) {
    let geometry, mesh;
    // clear scene
    cs.scene.clear();
    cs.pivot.clear();
    cs.material.shadowSide = THREE.DoubleSide;

    // add light and controls for it back to the scene
    cs.light.addToScene(cs.scene);

    // create different Objects
    switch (Number(cs.objectAttributes.whatObject)) {
        case 0:
            // sphere
            geometry = new THREE.SphereGeometry(10, cs.objectAttributes.resolution, cs.objectAttributes.resolution / 2);
            break;
        case 1:
            // box
            geometry = new THREE.BoxGeometry(15, 15, 15, Math.max(cs.objectAttributes.resolution / 6, 1), Math.max(cs.objectAttributes.resolution / 6, 1), Math.max(cs.objectAttributes.resolution / 6, 1));
            break;
        case 2:
            // torusknot
            geometry = new THREE.TorusKnotGeometry(6, 2, Math.max(cs.objectAttributes.resolution, 3), Math.max(cs.objectAttributes.resolution / 4, 2));
            break;
        case 3:
            // bunny
            const objLoader = new OBJLoader();
            objLoader.load('./objects/bunny.obj',
                // function that gets executed after loading, object is the output of the loader
                function (object) {
                    const tmp = object.children[0];
                    // recompute the normals to get a smoother looking surface
                    tmp.geometry.deleteAttribute('normal');
                    tmp.geometry = BufferGeometryUtils.mergeVertices(tmp.geometry);
                    tmp.geometry.computeVertexNormals();
                    geometry = tmp.geometry.clone();
                    // create new mesh 
                    mesh = new THREE.Mesh(geometry, cs.material);
                    mesh.castShadow = true;
                    // scale the bunny, because it is tiny
                    mesh.scale.set(120, 120, 120);
                    cs.material.uniforms.uScale.value = 120;
                    // center it and add it to the scene
                    mesh.position.set(3, -11.5, 1);
                    cs.mesh = mesh;
                    cs.pivot.attach(mesh);
                    cs.scene.add(cs.pivot);
                });
            break;
        default:
            // if something breaks, create a party cube!
            geometry = new THREE.BoxGeometry(15, 15, 15);
            cs.material = new THREE.ShaderMaterial({
                vertexShader: phongVertShader,
                fragmentShader: partyFrag,
                uniforms: { uScale: { value: 1 } }
            });
            break;
    }

    switch (cs.whatScene) {
        case 1:
            // shading scene
            cs.light.updatePosition(30, 20, 30);
            // create 3 spheres with different materials
            geometry = new THREE.SphereGeometry(6, cs.objectAttributes.resolution, cs.objectAttributes.resolution / 2);
            let mesh1 = new THREE.Mesh(geometry, cs.material1);
            cs.scene.add(mesh1);
            let mesh2 = new THREE.Mesh(geometry, cs.material2);
            mesh2.position.set(-16, 0, 0);
            cs.scene.add(mesh2);
            let mesh3 = new THREE.Mesh(geometry, cs.material3);
            mesh3.position.set(16, 0, 0);
            cs.scene.add(mesh3);
            // create the labels for the spheres
            let fontloader = new THREE.FontLoader();
            fontloader.load( './node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
            let textGeometry = new THREE.TextGeometry( "Flat    Gouraud   Phong", {
                font: font,
                size: 3,
                height: 1
            });
            let text = new THREE.Mesh( textGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x888888}) );
            text.position.set(-19, 8, 0);
            cs.scene.add(text);
            });   
            break;
        case 3:
            // aliasing scene
            const loader = new THREE.TextureLoader();
            const texture = loader.load('mipmaps/checker_mipmap_0.png');
            // set the filters and how to wrap the texture
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            cs.material.uniforms.uSamplerTexture = { value: texture };
            cs.material.side = THREE.DoubleSide;
            geometry = new THREE.PlaneGeometry(1000, 1000);
            break;
        case 4:
            // z-fight scene
            const geo1 = new THREE.PlaneGeometry(30, 30, cs.objectAttributes.resolution, cs.objectAttributes.resolution);
            const mat1 = new THREE.MeshPhongMaterial({ emissive: 0xff0000, side: THREE.DoubleSide });
            const plane1 = new THREE.Mesh(geo1, mat1);
            cs.scene.add(plane1);
            plane1.rotation.z = Math.PI / 4;
            geometry = new THREE.PlaneGeometry(30, 30, cs.objectAttributes.resolution, cs.objectAttributes.resolution);
            cs.material = new THREE.MeshPhongMaterial({ emissive: 0x0000ff, side: THREE.DoubleSide });
            break;
        case 5:
            // master scene
            // plane to see the shadow
            const geo = new THREE.PlaneGeometry(1000, 1000);
            const mat = new THREE.MeshPhongMaterial({ emissive: 0x9f9f9f, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geo, mat);
            plane.rotation.x = Math.PI / 2;
            plane.position.set(0, -15, 0);
            plane.receiveShadow = true;
            cs.scene.add(plane);
            break;
    }

    // add the mesh to scene, except bunny
    if (cs.objectAttributes.whatObject != 3) {
        geometry.computeTangents();
        // 3 shading spheres get added directly
        if (cs.whatScene != 1) {
            mesh = new THREE.Mesh(geometry, cs.material);
            mesh.castShadow = true;
            if (cs.whatScene != 3 && cs.whatScene != 4) {
                cs.material.uniforms.uScale.value = 1;
            }
            if (cs.whatScene == 3) {
                // aliasing plane
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(0, -0.5, 0);
            }
            // add mesh to scene
            cs.mesh = mesh;
            cs.pivot.attach(mesh);
            cs.scene.add(cs.pivot);
        }
    }
    return mesh;
}