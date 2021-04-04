import { vec3, mat4, glMatrix } from './gl-matrix/index.js'
import { World } from '../common/oimo/Oimo.js'

const viewPos = vec3.fromValues(0, -20, -1000);
const lightPos = vec3.fromValues(20, 20, 0);
const yNegativePos = -150;
const teapotRadius = 9;
function resetPos() {
    return vec3.fromValues(Math.random() * teapotRadius - teapotRadius / 2, Math.random() * teapotRadius * 5, Math.random() * teapotRadius - teapotRadius / 2);
}
function perspectiveProjection(displayWidth, displayHeight) {
    return mat4.perspective(mat4.create(), glMatrix.toRadian(45), displayWidth / displayHeight, 0.01, 3000)
}

function testWorld() {
    return new World({
        timestep: 1 / 100,
        iterations: 8,
        broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
        worldscale: 1, // scale full world 
        random: false,  // randomize sample
        info: false,   // calculate statistic or not
        gravity: [0, -9.8, 0]
    });
}

export { viewPos, lightPos, perspectiveProjection, testWorld, yNegativePos, resetPos, teapotRadius }