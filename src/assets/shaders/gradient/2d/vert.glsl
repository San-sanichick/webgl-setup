#version 300 es
precision highp float;

layout (location = 0) in vec2 a_pos;
layout (location = 1) in vec2 a_uv;

uniform mat3 u_paint_transform;
uniform mat3 model;
uniform mat3 view;
uniform mat3 projection;

out vec2 uv;

void main()
{
    vec2 pos = (projection * view * model * vec3(a_pos, 1.0)).xy;
    gl_Position = vec4(pos, 0.0, 1.0);
    uv = (u_paint_transform * vec3((a_uv - vec2(0.5)), 1.0)).xy + vec2(0.5);
}
