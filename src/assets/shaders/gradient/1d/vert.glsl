#version 300 es
precision highp float;

layout (location = 0) in vec2 a_pos;
layout (location = 1) in vec4 a_color;

uniform mat3 u_proj;
out vec4 color;

void main()
{
    vec2 pos = (u_proj * vec3(a_pos, 1.0)).xy;
    gl_Position = vec4(pos, 0.0, 1.0);
    color = a_color;
}
