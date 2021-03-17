#version 300 es

// attribute vec4 a_position;

layout(location = 0) in vec3 aPosition;
// layout (location = 1) in vec3 aColor;
// in vec3 aPosition;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec4 color;

void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = projection * view * model *
                vec4(aPosition.x, aPosition.y, aPosition.z, 1.0);
  // ourColor = aColor;
}