export default /*glsl*/`
    precision highp float;
    
    /* Default uniforms:
    modelMatrix: convert from model to world space
    viewMatrix: convert from world to camera space 
    projectionMatrix: convert from camera to homogenious space
    cameraPosition: camera position in world space

    modelViewMatrix: viewMatrix * modelMatrix
    normalMatrix: modelViewMatrix^-T
    */
    uniform float uAmbientFrac;     // value of the ambient term
    uniform float uDiffuseFrac;     // value of the diffuse term
    uniform float uSpecularFrac;    // value of the specular term
    uniform float uSpecularPow;     // power of the specular highlight
    uniform vec3 uWorldLight;       // position of the light in world coordinates
    uniform vec3 uColor;            // base color

    // for Gouraud shading we calculate the color per vertex and interpolate
    out vec4 vColor;        // final color of vertex
    
    // calculate diffuse and specular light with Phong model (everithing in world coordinates)
    vec2 computeDiffuseSpecIntens(in vec3 position, in vec3 normal, in vec3 cameraPos, in vec3 lightPos){
        normal = normalize(normal);
        vec3 vecToLight = normalize(lightPos - position);
        vec3 vecToCam = normalize(cameraPos - position);
        vec3 reflectedLight = -reflect(vecToLight, normal);
        
        vec2 DiffuseSpecIntens;
        DiffuseSpecIntens.x = clamp(dot(normal, vecToLight), 0.0, 1.0);
        DiffuseSpecIntens.y = pow(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0), uSpecularPow);
        // to avoid undefined values in case pow(0,0)
        if(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0) == 0.0 && uSpecularPow == 0.0){
            DiffuseSpecIntens.y = 0.0;
        }
        return DiffuseSpecIntens;
    }

    void main(){
        
        // transform to world coordinates
        vec4 world_normal = normalize(modelMatrix * vec4(normal, 0.0));
        vec4 world_pos = modelMatrix * vec4(position, 1.0);

        // calculate with phong ilumination model (NOT Phong shading!, this is Gouraud shading)
        vec2 diffuseIntensitySpec = computeDiffuseSpecIntens(world_pos.xyz, world_normal.xyz, cameraPosition.xyz, uWorldLight.xyz);
        
        // set the color value for the fragment shader
        vColor = vec4(uColor*(diffuseIntensitySpec.x * uDiffuseFrac + uAmbientFrac) + (diffuseIntensitySpec.y * uSpecularFrac), 1.0);

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    }`;