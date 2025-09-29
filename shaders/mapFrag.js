export default /*glsl*/`
    precision highp float;
    // Textures and environment map
    uniform sampler2D uSamplerTexture;      // texture map texture
    uniform sampler2D uSamplerNormalMap;    // normal map texture
    uniform samplerCube uSamplerEnvMap;     // environment map texture

    uniform vec3 uColor;            // color of the object, if no texture
    uniform bool uText;             // if texture map should be used
    uniform bool uNormal;           // if normal map should be used
    uniform bool uRefl;             // if reflection should be used
    uniform bool uRefr;             // if refraction should be used
    uniform vec3 uWorldLight;       // position of light
    uniform bool uMirror;           // if perfect mirror should be used
    uniform float uScale;           // scale of object needed to scale displacement

    in vec3 vPosition;          // position in object space
    in vec4 world_pos;          // position in world space
    in vec4 world_normal;       // normals in world space
    in vec4 world_tang;         // tangent in world space
    in vec4 world_bitang;       // bitangent in world space
    in vec2 vTexCoord;          // uv coordinates for textures

    // phong values hardcoded
    float uAmbientFrac = 0.3;       // coefficient of the ambient term
    float uDiffuseFrac = 0.9;       // coefficient of the diffuse term
    float uSpecularFrac = 1.0;      // coefficient of the specular term
    float uSpecularPow = 50.0;      // power of the specular highlight
    
    // calculate diffuse and specular light with Phong model (everithing in world coordinates)
    vec2 computeDiffuseSpecIntens(in vec3 position, in vec3 normal, in vec3 cameraPos, in vec3 lightPos){
        normal = normalize(normal);
        vec3 vecToLight = normalize(lightPos - position);
        vec3 vecToCam = normalize(cameraPos - position);
        vec3 reflectedLight = normalize(reflect(-vecToLight, normal));
        
        vec2 DiffuseSpecIntens;
        DiffuseSpecIntens.x = clamp(dot(normal, vecToLight), 0.0, 1.0);
        DiffuseSpecIntens.y = pow(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0), uSpecularPow);
        // to avoid undefined values in case pow(0,0)
        if(clamp(dot(reflectedLight, vecToCam), 0.0, 1.0) == 0.0 && uSpecularPow == 0.0){
            DiffuseSpecIntens.y = 0.0;
        }
        return DiffuseSpecIntens;
    }

    // calculate UV coordinates as if the object was a sphere 
    vec2 getUV(){
        vec2 uv;
        float x = vPosition.z;
        float y = vPosition.x;
        float z = vPosition.y - 0.08;
        uv.x = sign(y) * acos(x / sqrt(x*x + y*y));
        uv.x = uv.x / (3.1415926538 *2.0) + 0.5;
        uv.y = atan(sqrt(x*x + y*y), z);
        uv.y = 1.0 - uv.y / 3.1415926538;
        return uv;
    }
    
    void main() {

        // get Correct UV
        vec2 uv = vTexCoord;
        // calculate them for the bunny
        if(uScale != 1.0){
            uv = getUV();
        }

        // texture map
        vec4 txtColor = vec4(uColor, 0.0);
        if(uText){
            txtColor = texture2D(uSamplerTexture, uv);
        }
        
        // normal map
        vec3 updatedNormal = normalize(world_normal.xyz);
        if(uNormal){
            vec3 normalMapValue = normalize(texture2D(uSamplerNormalMap, uv).rgb * 2.0 - 1.0);
            updatedNormal = normalize(world_tang.xyz) * normalMapValue.r + normalize(world_bitang.xyz) * normalMapValue.g + normalize(world_normal.xyz) * normalMapValue.b;
            updatedNormal = normalize(updatedNormal);
        }

        // phong illumination
        vec2 diffuseIntensitySpec = computeDiffuseSpecIntens(world_pos.xyz, updatedNormal, cameraPosition.xyz, uWorldLight.xyz);
        vec4 vColor = vec4(txtColor.rgb * (diffuseIntensitySpec.x * uDiffuseFrac + uAmbientFrac) + (diffuseIntensitySpec.y * uSpecularFrac), 1.0);

        // reflection
        if(uRefl || uMirror){
            // calculate fresnel effect
            float reflTerm = 1.0 - clamp(dot(normalize(cameraPosition.xyz - world_pos.xyz), updatedNormal), 0.0, 1.0);
            // calculate reflected color
            vec3 r = reflect(normalize(world_pos.xyz - cameraPosition.xyz), updatedNormal);
            r.x = -r.x;
            vec4 colorCube = textureCube(uSamplerEnvMap, r);
            vec4 colReflected = colorCube * reflTerm;
            vColor = ((1.0 - reflTerm) * vColor) + ( colReflected);
            // overwrite everything if mirror
            if(uMirror){
                vColor = colorCube;
            }
        }

        // refraction
        if(uRefr && !uMirror){
            float refrTerm = clamp(dot(normalize(cameraPosition.xyz - world_pos.xyz), updatedNormal), 0.0, 1.0);
            vec3 r = refract(normalize(world_pos.xyz - cameraPosition.xyz), updatedNormal, 0.9);
            r.x = -r.x;
            vec4 colorCube = textureCube(uSamplerEnvMap, r);
            vec4 colReflected = colorCube * refrTerm;
            vColor = ((1.2 - refrTerm) * vColor) + (0.8 * colReflected);
        }
    
        gl_FragColor = vColor;
    }
`;