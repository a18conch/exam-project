import { vec3, mat4, glMatrix } from './gl-matrix/index.js'

const viewPos = vec3.fromValues(0, -20, -1000);
const lightPos = vec3.fromValues(20, 20, 0);
const yNegativePos = -10;
function perspectiveProjection(displayWidth, displayHeight) {
    return mat4.perspective(mat4.create(), glMatrix.toRadian(45), displayWidth / displayHeight, 0.01, 3000)
}

export { viewPos, lightPos, perspectiveProjection, yNegativePos }