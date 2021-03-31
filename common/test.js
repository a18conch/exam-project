
import { VisualObject } from '../oop/visual-object.js'
import { quat, vec3 } from './gl-matrix/index.js';

const X_AMOUNT = 10;
const Y_AMOUNT = 10;
const SPACE_BETWEEN = 15;
const Y_LEVEL = 10;

function createFloor(world) {
    return world.add({ size: [1000, 10, 1000], pos: [0, -5, 0], density: 1 });
}

function createTestObjects(createFunction, VAO, indicesLength, world, pass1, pass2) {
    Math.seedrandom('0');

    createFloor(world);

    for (let i = 0; i < X_AMOUNT; i++) {
        for (let j = 0; j < Y_AMOUNT; j++) {
            createFunction(
                i * SPACE_BETWEEN,
                Y_LEVEL * Math.random(),
                j * SPACE_BETWEEN,
                0,
                0,
                0,
                1,
                VAO,
                indicesLength,
                0,
                1,
                0,
                world.add({ type: 'sphere', size: [9], pos: [i * SPACE_BETWEEN, Y_LEVEL * Math.random(), j * SPACE_BETWEEN], move: true, world: world }),
                pass1,
                pass2
            );
        }
    }
}

function OOPTest(worldObjects, VAO, indicesLength, world) {
    createTestObjects(OOPCreateFunction, VAO, indicesLength, world, worldObjects)
}

function OOPCreateFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, collisionObject, worldObjects) {
    worldObjects.push(new VisualObject(vec3.fromValues(x, y, z), quat.fromValues(xRot, yRot, zRot, wRot), { VAO, indicesLength }, collisionObject, vec3.fromValues(colorR, colorG, colorB)));
}

function DODTest(componentStorage, createEntity, VAO, indicesLength, world) {
    createTestObjects(DODCreateFunction, VAO, indicesLength, world, componentStorage, createEntity);
}

function DODCreateFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, collisionObject, componentStorage, createEntity) {
    createEntity(componentStorage, {
        x: x,
        y: y,
        z: z,
        xRot: xRot,
        yRot: yRot,
        zRot: zRot,
        wRot: wRot,
        VAO: VAO,
        indicesLength: indicesLength,
        colorR: colorR,
        colorG: colorG,
        colorB: colorB,
        collisionObject: collisionObject
    });
}

export { OOPTest, DODTest };