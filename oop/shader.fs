#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

out vec4 FragColor;
// in vec3 ourColor;
uniform vec3 color;
uniform vec3 lightColor;
uniform vec3 lightPos;
uniform vec3 viewPos;

in vec3 FragPos;
in vec3 Normal;

void main() {

  // ambient

  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;

  // diffuse

  vec3 norm = normalize(Normal);
  vec3 lightDir = normalize(lightPos - FragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  // specular
  float specularStrength = 0.5;

  vec3 viewDir = normalize(viewPos - FragPos);
  vec3 reflectDir = reflect(-lightDir, norm);

  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * lightColor;

  vec3 result = (ambient + diffuse + specular) * color;
  FragColor = vec4(result, 1.0);
}