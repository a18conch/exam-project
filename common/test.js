
import { VisualObject } from '../oop/visual-object.js'
import { quat, vec3 } from './gl-matrix/index.js';
import { teapotRadius } from './constants.js'

const X_AMOUNT = 10;
const Z_AMOUNT = 10;
const SPACE_BETWEEN = 15;
const Y_LEVEL = 10;
const FLOOR_WIDTH = 1000;
const FLOOR_HEIGHT = 10;
const FLOOR_DEPTH = 1000;

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

function createTestObjects(createFunction, VAO, indicesLength, world, pass1, pass2) {

    for (let i = 0; i < X_AMOUNT; i++) {
        for (let j = 0; j < Z_AMOUNT; j++) {
            let zPos = j * SPACE_BETWEEN - ((SPACE_BETWEEN * Z_AMOUNT) / 2);
            let xPos = i * SPACE_BETWEEN - ((SPACE_BETWEEN * X_AMOUNT) / 2);
            createFunction(
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
                world.add({ type: 'sphere', size: [teapotRadius], pos: [xPos, Y_LEVEL * Math.random(), zPos], move: true, world: world }),
                pass1,
                pass2
            );
        }
    }
}

function OOPTest(worldObjects, VAO, indicesLength, world, gl, program) {
    name = "OOP";

    createAndInitFloor(world, gl, program, OOPCreateFunction, worldObjects);

    createTestObjects(OOPCreateFunction, VAO, indicesLength, world, worldObjects)
}

function OOPCreateFunction(x, y, z, xRot, yRot, zRot, wRot, VAO, indicesLength, colorR, colorG, colorB, collisionObject, worldObjects) {
    worldObjects.push(new VisualObject(vec3.fromValues(x, y, z), quat.fromValues(xRot, yRot, zRot, wRot), { VAO, indicesLength }, collisionObject, vec3.fromValues(colorR, colorG, colorB)));
}

function DODTest(componentStorage, createEntity, VAO, indicesLength, world, gl, program) {
    name = "DOD";

    createAndInitFloor(world, gl, program, DODCreateFunction, componentStorage, createEntity)

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
const SECTIONS = [10];
const TIME_TO_TEST = 10;

function testInit() {
    startTime = (new Date).getTime();
    time = (new Date).getTime();
    counter = 0;
    recordedData = { x10: [], name }
}

function testUpdate() {

    counter++;
    if ((new Date).getTime() > time + 1000) {
        time = (new Date).getTime();
        recordedData.x10.push(counter);
        counter = 0;
    }
    if ((new Date).getTime() > startTime + TIME_TO_TEST * 1000 && !hasDownloaded) {
        download("data.json", JSON.stringify(recordedData));
        hasDownloaded = true;
    }
}

var name;
var hasDownloaded = false;
var startTime;
var counter;
var time;
var recordedData;


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export { OOPTest, DODTest, testUpdate, testInit };