#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

out vec4 FragColor;
//in vec3 ourColor;

void main(){
	// gl_FragColor is a special variable a fragment shader
	// is responsible for setting
	FragColor = vec4(1, 0.5, 0.2, 1);// return reddish-purple
	
}