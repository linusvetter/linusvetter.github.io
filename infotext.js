// shows the info card
export function showInfo(whatScene) {
    const textElement = document.getElementById('infoText');
    // put in the correct text
    getText(textElement, whatScene);
    document.getElementById('infoCard').style.visibility = "visible";
}

// closes the info card
export function hideInfo() {
    document.getElementById('infoCard').style.visibility = "hidden";
}

// outputs the corresponding info text
function getText(element, whatScene) {
    switch (whatScene) {
        case 0:
            element.innerHTML = `
                <h3>Phong Illumination:</h3> 
                <p>The Phong illumination model tries to recreate how lighting looks in the real world.
                The color of a pixel is determined by the 3 components of the model: ambient, diffuse, and specular.</p>
                <p>The <b>ambient</b> term simulates indirect illumination (light reflected off other objects). 
                It is constant across the whole object.</p>
                <p>The <b>diffuse</b> term simulates the direct light from a light source. 
                It is scattered off the surface of the object equally in all directions. 
                Diffuse illumination depends on the angle betweeen the surface normal and the incoming light.
                The surface appears the brightest, if it faces directly to the light source.</p>
                <p>The <b>specular</b> term simulates the shiny highlights that stem from the surface reflecting the light in a single direction.
                It depends on the surface normal, the direction to the camera and the direction to the light source.
                The highlight appears stronger the closer the reflected light points to the direction of the camera.
                The specular power determines how spread out or focused the highlight is.
                A higher specular power leads to a more focused specular highlight.</p>
                <p>The ambient, diffuse, and specular fractions determine how much each of the different terms contribute to the overall color</p>
                <h4>Interesting:</h4>
                <p>The Phong model is just an approximation. You can see its shortcomings by setting the different values to the extreme. 
                For example, if you set the specular power (close) to 0, you can observe that there is a specular highlight on parts where the light doesn't reach.</p>
                <p>Setting the specular power to 0, results in the specular term being 1 (max intensity) wherever a specular highlight exists.</p>
                `;
            break;
        case 1:
            element.innerHTML = `
                <h3>Shading:</h3>
                <p>Shading determines the color of each pixel, often using a lighting model. Lighting describes how materials interact with light.  
                (note Phong shading and the Phong illumination model are separate concepts).</p>
                <p>There are different ways to shade an object, even if the use the same way to calculate the lighting.
                The 3 types demonstrated here are:
                <p><b>Flat shading</b> (left sphere), every primitive has only one uniform color.</p>
                <p><b>Gouraud shading</b> (center sphere), the color is calculated for every vertex, and bilinearly interpolated for pixels/fragments in between vertices.</p>
                <p><b>Phong shading</b> (right sphere), the color is calculated for every pixel/fragment individually. 
                For this, the surface normals are interpolated linearly between vertices.</p>
                <h4>Interesting:</h4>
                <p>All spheres will converge towards the same appearance as you increase the geometric resolution.</p>
                <p>Turning on wireframe objects can help you better see that Gouraud shading interpolates linearly between vertices.</p>
                `;
            break;
        case 2:
            element.innerHTML = `
                <h3>Mapping</h3>
                <p>Mapping can be used to give objects more details with relatively low effort.
                Mapping samples a texture to manipulate parts of the object. 
                There are many kinds of maps that can be used, for example: 
                texture, displacement, normal, and environment maps.</p>
                <p><b>Texture maps</b> are used to change the color of an object.</p>
                <p><b>Displacement maps</b> change the geometry of the object and displace vertices either inwards or outwards depending on the brightness of the map.</p>
                <p><b>Normal maps</b> change the normals. This can give the illusion of depth, without changing the actual geometry.</p>
                <p><b>Environment maps</b> are used to simulate the reflection and refraction of the environment surrounding the object.</p>
                <h4>Important:</h4>
                <p>If you do not select an environment map, it uses a pitch black one as a default.</p>
                <p>Activating the "mirror" option will make the surface 100% reflective, so other options that change the color will be ignored.</p>
                <h4>Interesting:</h4>
                <p>Displacement mapping is most visible when looking at the surface at a shallow angle or at the silhouette,
                You can also see that the normal map does not change the silhouette.</p>
                <p>The steep edges from the checkerboard normal map can result in strange lighting effects, since it does not check for occlusion.</p>
                `;
            break;
        case 3:
            element.innerHTML = `
                <h3>Aliasing</h3>
                <p>Here you can see multiple kinds of  texture aliasing, that occur for different reasons.</p>
                <p><b>Texture Magnification:</b> If the texture resolution is too low, you get jagged edges, 
                because a pixel in the texture maps to more then one pixel on screen.
                This happens mostly close to the camera.
                Jagged edges can be resolved by <b>filtering</b>, such as bilinear interpolation, which interpolates between the four closest pixels of the texture.
                This blurs all the hard lines.</p>
                <p><b>Texture Minification:</b> Moiré patterns can occur if the sampling rate is too low compared to the resolution of the texture. 
                Here one pixel on the screen maps to multiple pixels on the texture. 
                To mitigate this we can apply <b>mip mapping</b>, which stores increasingly lower resolution versions of the texture. 
                Points further away will use the lower resolution textures, ensuring each screen pixel maps to only one texture pixel. 
                However, this also introduces hard borders between the different resolution levels. We can resolve this by <b>filtering</b>, such as trilinear interpolation,  
                which blends between the different mipmap levels.
                <p>The "Visible" option uses different colored checkerboards as mipmaps, in order to see what texture is used.</p>
                <p>Another solution for aliasing is <b>supersampling</b>. 
                Here we sample each pixel multiple times and average all the color values to produce the final pixel color. 
                This can not only resolve texture aliasing, but also geometry aliasing 
                (aliasing of the edges of an object). 
                Note that higher super sampling levels can cause lag, since for every frame the renderer has to sample the texture many more times than normal.</p>
                `;
            break;
        case 4:
            element.innerHTML = `
                <h3>Z-Fighting</h3>
                <p>The flickering texture artifacts that you can see here (move the camera), are called Z-fighting.
                It can occur when multiple primitives have (almost) the same distance from the camera.
                The depth value for these primitives are closer together than the precision of the depth buffer. 
                When the pixels at these points are drawn, the order of each fragment is not consistent over the primitive, which results in strange patterns.
                Or because of floating point rounding errors one of the primitives might have a Z value closer to the camera in some areas, 
                therefore being drawn with strange patterns.</p>
                <p>To prevent z-fighting, one should avoid placing overlapping primitives in the same spot. 
                It also helps to move the near and far plane of the camera closer together, because the depth buffer gets a higher resolution.
                Another option that may help is to use a <b>logarithmic depth buffer</b> instead of a linear one. 
                This gives even higher precision close to the camera, but worse precision far away.</p>
                <p>All these things cannot resolve z-fighting in all cases, they just make it less likely to happen in the first place.
                <h4>Interesting:</h4>
                <p>If you change the geometric resolution the z-fighting patterns will change as well.
                With more vertices the z-fighting pattern becomes more fine grained and sometimes grid like.
                To see the classic z-fighting between two primitives, set the geometric resolution to 1.</p>
                `;
            break;
        case 5:
            element.innerHTML = `
                <h3>Master Scene</h3>
                <p>This scene combines the Phong lighting, the shading, and the mapping scene. 
                This allows for combinations of different settings. Note that some settings may overwrite others or make them irrelevant.</p>
                <p>For more information about a specific feature, go to the corresponding scene and click the "Info" button there.</p>
                `;
            break;
    }
}