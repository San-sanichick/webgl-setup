#version 300 es
precision highp float;

in vec3 o_klm;

out vec4 outColor;


void main()
{
    // outColor = vec4(1.0, 0.0, 0.0, 1.0);
    outColor = vec4(abs(o_klm), 1.0);
    // if (o_klm.x * o_klm.x * o_klm.x < o_klm.y * o_klm.z)
    // {
    //     discard;
    // }
}

