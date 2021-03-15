#version 300 es

//attribute vec4 a_position;

//layout(location = 0) in vec3 aPosition;
//layout (location = 1) in vec3 aColor;
in vec3 aPosition;

//out vec3 ourColor;

void main(){
    
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(aPosition.x, aPosition.y, aPosition.z, 1.0);
    //ourColor = aColor;
}