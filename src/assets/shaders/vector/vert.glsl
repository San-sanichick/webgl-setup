#version 300 es

layout (location = 0) in vec3 a_pos;
layout (location = 1) in vec3 a_klm;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 o_klm;


void main()
{
    vec4 vPos = vec4(a_pos.xy, 0.0, 1.0);
    gl_Position = projection * view * model * vPos;
    o_klm = a_klm;
}
