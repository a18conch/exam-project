#version 300 es

// attribute vec4 a_position;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
// in vec3 aPosition;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec3 color;
uniform vec3 lightColor;

out vec3 FragPos;
out vec3 Normal;

void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = projection * view * model *
                vec4(aPosition.x, aPosition.y, aPosition.z, 1.0);
  FragPos = vec3(model * vec4(aPosition, 1.0));
  Normal = mat3(transpose(inverse(model))) * aNormal;
}