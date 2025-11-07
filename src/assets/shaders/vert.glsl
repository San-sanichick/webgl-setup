#version 300 es
precision highp float;

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aUV;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 UVCoord;


void main()
{
    vec4 vPos = vec4(aPos, 1.0);
    gl_Position = projection * view * model * vPos;
    UVCoord = aUV;
}
