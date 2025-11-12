#version 300 es
precision highp float;

in vec3 o_klm;
out vec4 outColor;


void main()
{
    if (o_klm.x * o_klm.x * o_klm.x < o_klm.y * o_klm.z)
    {
        discard;
    }
}

