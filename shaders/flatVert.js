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

    flat out vec4 world_normal;     // normal in world space, flat interpolated
    flat out vec4 world_pos;        // position in world space, flat interpolated
    
    void main(){
        //set the varying values for the fragment shader
        world_normal = normalize(modelMatrix * vec4(normal, 0.0));
        world_pos = modelMatrix * vec4(position, 1.0);
        world_pos = world_pos / world_pos.w;

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    }`;