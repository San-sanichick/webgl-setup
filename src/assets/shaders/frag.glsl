#version 300 es
precision highp float;


in vec2 UVCoord;

uniform vec4 color;

uniform float cRadius;
uniform vec2 cCenter;

uniform sampler2D tex;

out vec4 outColor;


float sdCircle(vec2 pos, float radius)
{
    return length(pos) - radius;
}

vec2 translate(vec2 pos, vec2 offset)
{
    return pos - offset;
}

void main()
{
    outColor = color;
    // float dist = distance(cCenter, UVCoord);
    // if (dist < cRadius)
    // {
    //     outColor = color;
    // }
    // else
    // {
    //     outColor = texture(tex, UVCoord);
    // }
}
