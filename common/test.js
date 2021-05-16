
import { VisualObject } from '../oop/visual-object.js'
import { quat, vec3 } from './gl-matrix/index.js';
import { teapotRadius, testWorld } from './constants.js'
import { Transform, Render, Collision } from '../dod2/components/allComponents.js'

const SPACE_BETWEEN = 15;
const Y_LEVEL = 10;
const FLOOR_WIDTH = 1000;
const FLOOR_HEIGHT = 10;
const FLOOR_DEPTH = 1000;

const SECTION_AMOUNT = 150;

function calculateEntityCount(x) {
    return 10 * Math.pow(Math.E, 0.04 * x)
}

function createAndInitFloor(world, gl, program, createFunction, pass1, pass2) {
    let x = 0;
    let y = -100;
    let z = 0;
    let width = FLOOR_WIDTH;
    let height = FLOOR_HEIGHT;
    let depth = FLOOR_DEPTH;

    let renderData = floorVAO(gl, program, width, height, depth);

    createFunction(
        x,
        y,
        z,
        0,
        0,
        0,
        1,
        renderData.VAO,
        renderData.indicesLength,
        0,
        0,
        0,
        world.add({ size: [width, height, depth], pos: [x, y, z], density: 1 }),
        pass1,
        pass2
    );
    // world.add({ size: [1000, 10, 1000], pos: [0, -5, 0], density: 1 });
}

function createTestObjects(createFunction, createChildFunction, VAO, indicesLength, world, amount, pass1, pass2) {

    let upper = Math.round(Math.sqrt(amount));
    let lower = Math.floor(Math.sqrt(amount));

    let rest = amount - upper * lower;

    for (let i = 0; i < upper; i++) {
        for (let j = 0; j < lower; j++) {
            let zPos = j * SPACE_BETWEEN - ((SPACE_BETWEEN * lower) / 2);
            let xPos = i * SPACE_BETWEEN - ((SPACE_BETWEEN * upper) / 2);
            let randomPos = Y_LEVEL * Math.random();

            let index = createFunction(
                xPos,
                Y_LEVEL * Math.random(),
                zPos,
                0,
                0,
                0,
                1,
                VAO,
                indicesLength,
                0,
                1,
                0,
                world.add({ type: ['sphere', 'sphere'], size: [teapotRadius, teapotRadius, teapotRadius, teapotRadius, teapotRadius, teapotRadius], pos: [xPos, randomPos, zPos], posShape: [0, 0, 0, 0, 10, 0], move: true, world: world }),
                //world.add({ type: ['sphere'], size: [teapotRadius], pos: [xPos, randomPos, zPos], posShape: [0, 0, 0], move: true, world: world }),
                pass1,
                pass2
            );

            createChildFunction(
                0,
                10,
                0,
                0,
                0,
                0,
                1,
                VAO,
                indicesLength,
                0,
                1,
                0,
                index,
                pass1,
                pass2
            );
        }
    }

    if (rest <= 0)
        return;

    for (let i = 0; i < rest; i++) {
        let zPos = lower * SPACE_BETWEEN - ((SPACE_BETWEEN * lower) / 2);
        let xPos = (i + upper) * SPACE_BETWEEN - ((SPACE_BETWEEN * upper) / 2);
        let randomPos = Y_LEVEL * Math.random();

        let index = createFunction(
            xPos,
            Y_LEVEL * Math.random(),
            zPos,
            0,
            0,
            0,
            1,
            VAO,
            indicesLength,
            0,
            1,
            0,
            world.add({ type: ['sphere', 'sphere'], size: [teapotRadius, teapotRadius, teapotRadius, teapotRadius, teapotRadius, teapotRadius], pos: [xPos, randomPos, zPos], posShape: [0, 0, 0, 0, 10, 0], move: true, world: world }),
            //world.add({ type: ['sphere'], size: [teapotRadius], pos: [xPos, randomPos, zPos], posShape: [0, 0, 0], move: true, world: world }),
            pass1,
            pass2
        );

        createChildFunction(
            0,
            10,
            0,
            0,
            0,
            0,
            1,
            VAO,
            indicesLength,
            0,
            1,
            0,
            index,
            pass1,
            pass2
        );
    }
}

function OOPTest(worldObjects, VAO, indicesLength, world, gl, program, amount) {

    createAndInitFloor(world, gl, program, OOPCreateFunction, worldObjects);

    createTestObjects(OOPCreateFunction, OOPCreateChildFunction, VAO, indicesLength, world, amount, worldObjects)
}

function OOPCreateChildFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, parentIndex, worldObjects) {
    worldObjects[parentIndex].addChild(
        new VisualObject(vec3.fromValues(x, y, z), quat.fromValues(xRot, yRot, zRot, wRot), { VAO, indicesLength }, null, vec3.fromValues(colorR, colorG, colorB))
    );
}

function OOPCreateFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, collisionObject, worldObjects) {
    worldObjects.push(new VisualObject(vec3.fromValues(x, y, z), quat.fromValues(xRot, yRot, zRot, wRot), { VAO, indicesLength }, collisionObject, vec3.fromValues(colorR, colorG, colorB)));
    return worldObjects.length - 1;
}

function DODTest(componentStorage, createEntity, VAO, indicesLength, world, gl, program, amount) {

    createAndInitFloor(world, gl, program, DODCreateFunction, componentStorage, createEntity)

    createTestObjects(DODCreateFunction, DODCreateChildFunction, VAO, indicesLength, world, amount, componentStorage, createEntity);
}

function DODCreateChildFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, parentIndex, componentStorage, createEntity) {
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
        parentIndex: parentIndex
    });
}

//don't forget to return index
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
        collisionObject: collisionObject,
        parentIndex: null,
    });
    for (var attribute in componentStorage) {
        return componentStorage[attribute].length - 1;
    }
}

function DOD2Test(componentStorage, VAO, indicesLength, world, gl, program, amount) {

    createAndInitFloor(world, gl, program, DOD2CreateFunction, componentStorage)

    createTestObjects(DOD2CreateFunction, DOD2CreateChildFunction, VAO, indicesLength, world, amount, componentStorage);
}

function DOD2CreateChildFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, parentEntity, ecsWorld) {
    ecsWorld.createEntity()
        .addComponent(Transform, { x, y, z, xRot, yRot, zRot, wRot, parent: parentEntity })
        .addComponent(Render, { VAO, indicesLength, colorR, colorG, colorB });
}

function DOD2CreateFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, collisionObject, ecsWorld) {

    let transform = { x, y, z, xRot, yRot, zRot, wRot, parent: null }
    return (ecsWorld.createEntity()
        .addComponent(Transform, transform)
        .addComponent(Render, { VAO, indicesLength, colorR, colorG, colorB })
        .addComponent(Collision, { collisionObject }));

    return transform;
}

function floorVAO(gl, program, width, height, depth) {
    let vertices = [
        -width / 2, height / 2, -depth / 2,
        width / 2, height / 2, -depth / 2,
        width / 2, height / 2, depth / 2,
        -width / 2, height / 2, depth / 2,
        -width / 2, -height / 2, -depth / 2,
        width / 2, -height / 2, -depth / 2,
        width / 2, -height / 2, depth / 2,
        -width / 2, -height / 2, depth / 2,
    ]
    let normalVertices = [
        0, 1, 0,
        0, -0, 1,
        -1, -0, 0,
        0, -1, -0,
        1, -0, 0,
        0, 0, -1,
    ]
    let indices = [
        0, 1, 2,
        0, 3, 2,
        0, 1, 4,
        4, 1, 5,
        1, 2, 6,
        5, 1, 6,
        0, 4, 7,
        4, 0, 7,
        3, 2, 7,
        6, 7, 2,
        4, 5, 6,
        4, 7, 6,
    ];

    let positionLoc = gl.getAttribLocation(program, "aPosition");
    let normalLoc = gl.getAttribLocation(program, "aNormal");

    let VAO = gl.createVertexArray();
    let VBO = gl.createBuffer(); //position buffer
    let NVBO = gl.createBuffer(); //normal buffer
    let EBO = gl.createBuffer();

    gl.bindVertexArray(VAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, NVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalVertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // enable attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(
        positionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, NVBO);
    gl.enableVertexAttribArray(normalLoc)
    gl.vertexAttribPointer(
        normalLoc, 3, gl.FLOAT, false, 0, 0);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    return { VAO, indicesLength: indices.length };
}

const SECTION_LENGTH = 10;
const SECTIONS = [...Array(SECTION_AMOUNT).keys()];
const TIME_TO_TEST = 10;

function testInit(section) {
    startTime = (new Date).getTime();
    time = (new Date).getTime();
    counter = 0;
    recordedData[section.toString()] = [];
    currentIndex = section;
}

function testUpdate(section) {

    counter++;
    if ((new Date).getTime() > time + 1000) {
        time = (new Date).getTime();
        recordedData[currentIndex].push(counter);
        counter = 0;
    }
    if ((new Date).getTime() > startTime + TIME_TO_TEST * 1000) {
        return true;
    }
    return false;
}

var currentIndex;
var startTime;
var counter;
var time;
var recordedData;

async function test(testFunction, pass1, pass2, name) {
    recordedData = {}
    for (const section of SECTIONS) {
        await testFunction(pass1, pass2, Math.round(calculateEntityCount(section + 1)));
    }

    download(`data_${name}.json`, JSON.stringify(recordedData));
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export { OOPTest, DODTest, DOD2Test, testUpdate, testInit, test };