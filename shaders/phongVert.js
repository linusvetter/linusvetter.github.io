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

    out vec3 vPosition;         // position in object space (needed for partyFrag)
    out vec4 world_normal;      // normal in world space
    out vec4 world_pos;         // position in world space
    
    void main(){
        // set the varying values for the fragment shader
        vPosition = position;
        world_normal = normalize(modelMatrix * vec4(normal, 0.0));
        world_pos = modelMatrix * vec4(position, 1.0);
        world_pos = world_pos / world_pos.w;

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    }`;