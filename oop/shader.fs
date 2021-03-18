#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

out vec4 FragColor;
// in vec3 ourColor;
uniform vec3 color;
uniform vec3 lightColor;
uniform vec3 lightPos;

in vec3 FragPos;
in vec3 Normal;

void main() {

  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;

  vec3 norm = normalize(Normal);
  vec3 lightDir = normalize(lightPos - FragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  vec3 result = (ambient + diffuse) * color;
  FragColor = vec4(result, 1.0);
}