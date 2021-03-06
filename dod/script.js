var gl;
var displayWidth;
var displayHeight;

import { mat4, vec3, vec4, quat, glMatrix } from '../common/gl-matrix/index.js'
import { loadObj } from '../common/parse-obj.js'
import { RenderSystem } from './systems/render-system.js';
import { SpinSystem } from './systems/physics-system.js';
import { World } from '../common/oimo/Oimo.js'
import { DODTest, testInit, testUpdate, test } from '../common/test.js'
import { viewPos, perspectiveProjection, testWorld } from '../common/constants.js';

async function main(vertexShaderSource, fragmentShaderSource, section) {

  Math.seedrandom('0');

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let systems = [];
  systems.push(new RenderSystem());
  systems.push(new SpinSystem());

  let cache = new Map();

  let world = testWorld();

  //end floor
  let componentStorage = {}
  componentStorage.x = [];
  componentStorage.y = [];
  componentStorage.z = [];
  componentStorage.xRot = [];
  componentStorage.yRot = [];
  componentStorage.zRot = [];
  componentStorage.wRot = [];
  componentStorage.VAO = [];
  componentStorage.indicesLength = [];
  componentStorage.colorR = [];
  componentStorage.colorG = [];
  componentStorage.colorB = [];
  componentStorage.collisionObject = [];
  componentStorage.parentIndex = [];

  const renderData = await loadObj('../common/models/teapot.obj', cache, gl, program);


  DODTest(componentStorage, createEntity, renderData.VAO, renderData.indicesLength, world, gl, program, section);

  //createTeapot(componentStorage, world, -15, 10, 0, renderData.VAO, renderData.indicesLength);
  //createTeapot(componentStorage, world, -12, 30, 0, renderData.VAO, renderData.indicesLength);
  //createEntity(componentStorage, { VAO: renderData.VAO, indicesLength: renderData.indicesLength });

  //viewport

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //rendering

  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);

  //gl.enableVertexAttribArray(positionAttributeLocation);

  // let time = (new Date).getTime();
  // let counter = 0;

  let view = mat4.create();
  let projection = mat4.create();

  view = mat4.translate(mat4.create(), view, viewPos);
  projection = perspectiveProjection(displayWidth, displayHeight);


  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, projection);

  gl.uniform3fv(gl.getUniformLocation(program, "lightColor"), vec3.fromValues(1, 1, 1));
  gl.uniform3fv(gl.getUniformLocation(program, "lightPos"), vec3.fromValues(20, 20, 0));
  gl.uniform3fv(gl.getUniformLocation(program, "viewPos"), viewPos);

  testInit(section);
  while (true) {
    await new Promise(r => setTimeout(r, 1));

    // counter++;
    // if ((new Date).getTime() > time + 1000) {
    //   time = (new Date).getTime();
    //   console.log(counter);
    //   counter = 0;
    // }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.clear(gl.GL_DEPTH_BUFFER_BIT);


    for (let system of systems) {
      system.update(componentStorage, gl, program, viewPos, world);
    }
    if (testUpdate(section)) {
      gl = null;
      return;
    }
  }
}

function createEntity(componentStorage, components) {
  for (let componentName in componentStorage) {
    //if (components[componentName] == null)
    //  continue;
    componentStorage[componentName].push(components[componentName]);
  }
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  displayWidth = canvas.clientWidth;
  displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function reportWindowSize() {
  resizeCanvasToDisplaySize(gl.canvas);
}

window.onresize = reportWindowSize;
window.onload = () => {

  Promise.all([fetch("../common/shaders/shader.vs"), fetch("../common/shaders/shader.fs")]).then(([vertex, fragment]) => {
    if (!vertex.ok || !fragment.ok) {
      //throw new Error("HTTP error " + res.status)
    }
    return Promise.all([vertex.text(), fragment.text()]);
  }).then(([vertex, fragment]) => {
    test(main, vertex, fragment, "DOD");
  })
}