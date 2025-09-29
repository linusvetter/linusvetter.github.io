export default /*glsl*/`
    precision highp float;
    
    uniform sampler2D uSamplerDisplacement; // displacement map texture
    uniform bool uDisp;                     // if displacement map should be used
    uniform float uScale;                   // scale of object needed to scale displacement

    out vec3 vPosition;         // position in object space (needed for uv calculations of bunny)
    out vec4 world_pos;         // position in world space
    out vec4 world_normal;      // normals in world space
    out vec4 world_tang;        // tangent in world space
    out vec4 world_bitang;      // bitangent in world space
    out vec2 vTexCoord;         // uv coordinates for texture
    
    void main() {
       
        // Pass texture coordinates to fragment shader
        vTexCoord = uv;
        if(uScale != 1.0){
            // The Bunny, have to calculate UV for displacement map
            float x = position.z;
            float y = position.x;
            float z = position.y - 0.08;
            vTexCoord.x = sign(y) * acos(x / sqrt(x*x + y*y));
            vTexCoord.x = vTexCoord.x / (3.1415926538 *2.0) + 0.5;
            vTexCoord.y = atan(sqrt(x*x + y*y), z);
            vTexCoord.y = 1.0 - vTexCoord.y / 3.1415926538;
        }     
        // Calculate displacement
        vec3 displacement = vec3(0);
        if(uDisp){
            displacement = normal *  texture2D(uSamplerDisplacement, vTexCoord).x / uScale;
        }
        //convert to world coordinates
        vPosition = position;
        world_pos = modelMatrix * vec4((position + displacement), 1.0);
        world_normal = normalize(modelMatrix * vec4(normal, 1));
        world_tang = normalize(modelMatrix * vec4(tangent.xyz, 1));
        world_bitang = normalize(vec4(cross(world_normal.xyz, world_tang.xyz),1));
        
        // Standard vertex position calculation
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4((position + displacement), 1.0 );
    }
`;