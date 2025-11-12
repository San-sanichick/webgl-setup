#version 300 es

layout (location = 0) in vec2 a_pos;
layout (location = 1) in vec3 a_klm;

uniform mat3 model;
uniform mat3 view;
uniform mat3 projection;

out vec3 o_klm;


void main()
{
    vec2 pos = (projection * view * model * vec3(a_pos, 1.0)).xy;
    gl_Position = vec4(pos, 0.0, 1.0);
    o_klm = a_klm;
}
