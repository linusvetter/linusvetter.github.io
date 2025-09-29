export default /*glsl*/`
    precision highp float;

    // The color gets calculated per vertex, 
    // So the fragment shader just interpolates between the values
    
    in vec4 vColor;     // color from vertex shader

    void main(){ 
        gl_FragColor = vColor;
}`;