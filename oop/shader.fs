#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

out vec4 FragColor;
// in vec3 ourColor;
uniform vec3 color;
uniform vec3 lightColor;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting

  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;

  vec3 result = ambient * color;

  FragColor = vec4(result, 1.0f); // return reddish-purple
}