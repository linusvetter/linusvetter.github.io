export default /*glsl*/`

    in vec3 vPosition;      // position in object space

    void main(){
        // convert position to RGB value from 0 to 1
        gl_FragColor = vec4(vPosition / vec3(15) + vec3(0.5), 1.0);
    }`;