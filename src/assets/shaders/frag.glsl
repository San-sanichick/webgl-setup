#version 300 es

precision highp float;

in vec2 UVCoord;

uniform vec4 color;

uniform float cRadius;
uniform vec2 cCenter;

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
    vec2 pos = translate(UVCoord, cCenter);
    float dist = sdCircle(pos, cRadius);

    vec3 col = mix(color.rgb, vec3(0.0), clamp(dist, 0.0, 1.0));
    vec4 finalColor = vec4(col, 1.0);

    if (finalColor.rgb == vec3(0.0))
        discard;


    // float d = distance(cCenter, UVCoord);
    // float circle = step(cRadius, d);
    //
    // outColor = vec4(vec3(circle), 1.0);
    outColor = color;
}
