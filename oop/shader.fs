#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

out vec4 FragColor;
// in vec3 ourColor;
uniform vec4 color;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  FragColor = vec4(color); // return reddish-purple
  // FragColor = vec4(1, 0.5, 0.5, 1); // return reddish-purple
}