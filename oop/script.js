var gl;
var displayWidth;
var displayHeight;

import { mat4, vec3, vec4, quat, glMatrix } from '../common/gl-matrix/index.js'
import { VisualObject } from './visual-object.js'
import { loadObj } from '../common/parse-obj.js'
import { World } from '../common/oimo/Oimo.js'
import { OOPTest, testInit, testUpdate, test } from '../common/test.js'
import { viewPos, perspectiveProjection, testWorld, yNegativePos, resetPos } from '../common/constants.js';

async function main(vertexShaderSource, fragmentShaderSource, section) {

  Math.seedrandom('0');

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let world = testWorld();
  //floor

  let worldObjects = []

  let cache = new Map();

  const renderData = await loadObj('../common/models/teapot.obj', cache, gl, program);

  OOPTest(worldObjects, renderData.VAO, renderData.indicesLength, world, gl, program, section)
  // createTeapot(worldObjects, world, -15, 10, 0, renderData);
  // createTeapot(worldObjects, world, -12, 30, 0, renderData);

  //define the viewport

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
  gl.uniform3fv(gl.getUniformLocation(program, "lightPos"), vec3.fromValues(0, 0, 0));
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

    world.step();

    worldObjects.forEach((obj, i, objects) => {
      obj.position = vec3.fromValues(obj.collisionObject.getPosition().x, obj.collisionObject.getPosition().y, obj.collisionObject.getPosition().z);
      obj.rotation = quat.fromValues(obj.collisionObject.getQuaternion().x, obj.collisionObject.getQuaternion().y, obj.collisionObject.getQuaternion().z, obj.collisionObject.getQuaternion().w);
      if (obj.position[1] < yNegativePos) {
        let pos = resetPos();
        obj.collisionObject.resetPosition(pos[0], pos[1], pos[2]);
      }
      obj.draw(gl, program, viewPos);
    });

    // worldObjects.forEach((obj, i, objects) => {
    //   quat.rotateX(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
    //   quat.rotateZ(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
    //   obj.draw(gl, program, viewPos);
    // });
    if (testUpdate(section)) {
      gl = null;
      return;
    }
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
    test(main, vertex, fragment, "OOP");
  })
}