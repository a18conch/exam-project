var gl;
var displayWidth;
var displayHeight;

import { mat4, vec3, vec4, quat, glMatrix } from '/gl-matrix/index.js'
import { VisualObject } from '/visual-object.js'
import { loadObj } from '/parse-obj.js'
import { TransformComponent } from '/components/transformComponent.js'
import { VAOComponent } from '/components/VAOComponent.js'

async function main(vertexShaderSource, fragmentShaderSource) {

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let worldObjects = []

  let cache = new Map();

  const renderData = await loadObj('/teapot.obj', cache, gl, program);
  worldObjects.push(new VisualObject(vec3.fromValues(-15, 0, 0), quat.create(), renderData, vec3.fromValues(0, 1, 0)));
  worldObjects.push(new VisualObject(vec3.fromValues(15, 0, 0), quat.create(), renderData, vec3.fromValues(1, 0, 0)));

  //define the viewport

  let componentStorage = {}
  componentStorage.TransformComponent = new TransformComponent();
  componentStorage.VAOComponent = new VAOComponent();

  componentStorage.TransformComponent.x.push(-15);
  componentStorage.TransformComponent.y.push(0);
  componentStorage.TransformComponent.z.push(0);
  componentStorage.TransformComponent.xRot.push(0);
  componentStorage.TransformComponent.yRot.push(0);
  componentStorage.TransformComponent.zRot.push(0);
  componentStorage.VAOComponent.VAO.push(renderData);

  componentStorage.TransformComponent.x.push(-15);
  componentStorage.TransformComponent.y.push(0);
  componentStorage.TransformComponent.z.push(0);
  componentStorage.TransformComponent.xRot.push(0);
  componentStorage.TransformComponent.yRot.push(0);
  componentStorage.TransformComponent.zRot.push(0);
  componentStorage.VAOComponent.VAO.push(renderData);

  componentStorage.TransformComponent.x.push(null);
  componentStorage.TransformComponent.y.push(null);
  componentStorage.TransformComponent.z.push(null);
  componentStorage.TransformComponent.xRot.push(null);
  componentStorage.TransformComponent.yRot.push(null);
  componentStorage.TransformComponent.zRot.push(null);
  componentStorage.VAOComponent.VAO.push(renderData);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //rendering

  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);

  //gl.enableVertexAttribArray(positionAttributeLocation);

  let time = (new Date).getTime();
  let counter = 0;

  while (true) {
    await new Promise(r => setTimeout(r, 5));

    counter++;
    if ((new Date).getTime() > time + 1000) {
      time = (new Date).getTime();
      //console.log(counter);
      counter = 0;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.clear(gl.GL_DEPTH_BUFFER_BIT);

    let view = mat4.create();
    let projection = mat4.create();

    let viewPos = vec3.fromValues(0, 0, -40);
    view = mat4.translate(mat4.create(), view, viewPos);
    projection = mat4.perspective(mat4.create(), glMatrix.toRadian(45), displayWidth / displayHeight, 0.01, 100);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, projection);

    worldObjects.forEach((obj, i, objects) => {
      quat.rotateX(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
      quat.rotateZ(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
      obj.draw(gl, program, viewPos);
    });
  }
}

function renderSystem(types, allComponents, getFunction) {
  let indices = getFunction(types, allComponents);

  console.log(indices);
}

function getEntityIndexFromComponentTypes(types, allComponents) {
  //since javascript does not use pointers we have to directly search through the list of component each time
  let indices = [];

  let length = allComponents[types[0].name][Object.keys(allComponents[types[0].name])[0]].length

  outer:
  for (let i = 0; i < length; i++) {
    let shouldContinue = false;
    for (let componentType of types) {
      for (let componentAttribute in allComponents[componentType.name]) {
        if (allComponents[componentType.name][componentAttribute][i] == null) {
          continue outer;
        }
      }
    }
    indices.push(i);
  }
  return indices;
}

function createEntity(allComponents) {

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

  Promise.all([fetch("shader.vs"), fetch("shader.fs")]).then(([vertex, fragment]) => {
    if (!vertex.ok || !fragment.ok) {
      //throw new Error("HTTP error " + res.status)
    }
    return Promise.all([vertex.text(), fragment.text()]);
  }).then(([vertex, fragment]) => {
    main(vertex, fragment);
  })
}