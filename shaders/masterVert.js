export default /*glsl*/`
    precision highp float;
    
    uniform sampler2D uSamplerDisplacement; // displacement map texture
    uniform sampler2D uSamplerNormalMap;    // normal map texture

    uniform float uSpecularPow;     // power of the specular highlight
    uniform vec3 uWorldLight;       // position of the light in world coordinates
    uniform float uScale;           // scale of object needed to scale displacement
    uniform bool uDisp;             // if displacement map should be used
    uniform bool uNormal;           // if normal map should be used
    uniform int uShaderType;        // 0: phong, 1: flat, 2: gouraud 

    out vec3 vPosition;                 // position in object space                 
    out vec4 world_pos;                 // position in world space                  
    flat out vec4 flat_world_pos;       // position in world space, flat interpolated
    out vec4 world_normal;              // normlas in world space                   
    flat out vec4 flat_world_normal;    // normals in world space, flat interpolated
    out vec4 world_tang;                // tangent in world space                   
    out vec4 world_bitang;              // bitangent in world space                 
    out vec2 vTexCoord;                 // uv coordinates for textures              
    out vec2 gouraudLight;              // diffuse, specular term of phong lighting from gouraud shading

    // calculate diffuse and specular light (everithing in world coordinates)
    vec2 computeDiffuseSpecIntens(in vec3 position, in vec3 normal, in vec3 cameraPos, in vec3 lightPos){
        normal = normalize(normal);
        vec3 vecToLight = normalize(lightPos - position);
        vec3 vecToCam = normalize(cameraPos - position);
        vec3 reflectedLight = normalize(reflect(-vecToLight, normal));
        
        vec2 DiffuseSpecIntens;
        DiffuseSpecIntens.x = clamp(dot(normal, vecToLight), 0.0, 1.0);
        DiffuseSpecIntens.y = pow(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0), uSpecularPow);
        // To avoid undefined values in case pow(0,0)
        if(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0) == 0.0 && uSpecularPow == 0.0){
            DiffuseSpecIntens.y = 0.0;
        }
        return DiffuseSpecIntens;
    }

    void main() {
        // pass texture coordinates to fragment shader
        vTexCoord = uv;
        if(uScale != 1.0){
            // the Bunny, have to calculate UV for displacement, normal map
            float x = position.z;
            float y = position.x;
            float z = position.y - 0.08;
            vTexCoord.x = sign(y) * acos(x / sqrt(x*x + y*y));
            vTexCoord.x = vTexCoord.x / (3.1415926538 *2.0) + 0.5;
            vTexCoord.y = atan(sqrt(x*x + y*y), z);
            vTexCoord.y = 1.0 - vTexCoord.y / 3.1415926538;
        } 
        
        // calculate displacement
        vec3 displacement = vec3(0);
        if(uDisp){
            displacement = normal *  texture2D(uSamplerDisplacement, vTexCoord).x / uScale;
        }

        // convert to world coordinates
        vPosition = position;
        world_pos = modelMatrix * vec4((position + displacement), 1.0);
        flat_world_pos = world_pos;
        world_normal = normalize(modelMatrix * vec4(normal, 1));
        flat_world_normal = world_normal;
        world_tang = normalize(modelMatrix * vec4(tangent.xyz, 1));
        world_bitang = normalize(vec4(cross(world_normal.xyz, world_tang.xyz),1));

        // caculate normals with normal map if needed  
        vec3 updatedNormal = normalize(world_normal.xyz);
        if(uNormal && uShaderType != 0){
            vec3 normalMapValue = normalize(texture2D(uSamplerNormalMap, vTexCoord).rgb * 2.0 - 1.0);
            updatedNormal = normalize(world_tang.xyz) * normalMapValue.r + normalize(world_bitang.xyz) * normalMapValue.g + normalize(world_normal.xyz) * normalMapValue.b;
            updatedNormal = normalize(updatedNormal);
            flat_world_normal = vec4(updatedNormal, 0);
        }

        // calculate with phong ilumination model for Gouraud shading (NOT Phong shading!)
        if(uShaderType == 2){
            gouraudLight = computeDiffuseSpecIntens(world_pos.xyz, updatedNormal.xyz, cameraPosition.xyz, uWorldLight.xyz);
        }  
        // standard vertex position calculation
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4((position + displacement), 1.0 );
    }
`;