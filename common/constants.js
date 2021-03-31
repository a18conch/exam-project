import { vec3, mat4, glMatrix } from './gl-matrix/index.js'

const viewPos = vec3.fromValues(-75, -20, -300);
const lightPos = vec3.fromValues(20, 20, 0);
function perspectiveProjection(displayWidth, displayHeight) {
    return mat4.perspective(mat4.create(), glMatrix.toRadian(45), displayWidth / displayHeight, 0.01, 1000)
}

export { viewPos, lightPos, perspectiveProjection }