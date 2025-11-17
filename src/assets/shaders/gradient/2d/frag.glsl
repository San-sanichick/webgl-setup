#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform int u_gradient_type;

in vec2 uv;
out vec4 outColor;

const int LINEAR  = 0;
const int RADIAL  = 1;
const int ANGULAR = 2;

const float PI = 3.1415926;

const vec2 HALF = vec2(0.5);

void main()
{
    // linear is default
    vec2 texCoord = uv;

    if (u_gradient_type == ANGULAR)
    {
        texCoord = vec2(length(uv - HALF) * 2.0);
    }
    else if (u_gradient_type == RADIAL)
    {
        vec2 offsetUV = uv - HALF;
        float angle = atan(offsetUV.y, offsetUV.x);
        texCoord = vec2(angle / PI * 0.5 + 0.5, 0.0);
    }

    outColor = texture(u_texture, texCoord);
}
