var gl;
var displayWidth;
var displayHeight;

import { mat4, vec3, vec4, quat, glMatrix } from '/gl-matrix/index.js'
import { VisualObject } from '/visual-object.js'

async function main(vertexShaderSource, fragmentShaderSource) {

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  const res = await fetch('/teapot.obj');
  const teapotData = await res.text();

  let worldObjects = []

  const data = parseObj(teapotData);
  worldObjects.push(new VisualObject(gl, program, vec3.fromValues(-15, 0, 0), quat.create(), data, vec3.fromValues(0, 1, 0)));
  worldObjects.push(new VisualObject(gl, program, vec3.fromValues(15, 0, 0), quat.create(), data, vec3.fromValues(1, 0, 0)));

  //define the viewport

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
      console.log(counter);
      counter = 0;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.GL_DEPTH_BUFFER_BIT);

    let view = mat4.create();
    let projection = mat4.create();

    let viewPos = vec3.fromValues(0, 0, -40);
    view = mat4.translate(mat4.create(), view, viewPos);
    projection = mat4.perspective(mat4.create(), glMatrix.toRadian(45), displayWidth / displayHeight, 0.01, 100);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, projection);

    worldObjects.forEach((obj, i, objects) => {
      objects[i].rotation = quat.rotateX(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
      objects[i].rotation = quat.rotateZ(obj.rotation, obj.rotation, glMatrix.toRadian(-0.2));
      obj.draw(gl, program, viewPos);
    });
  }
}

function parseObj(text) {
  const geometricVertices = getValuesFromPattern(text, /v\s.*/gm);
  const textureVertices = getValuesFromPattern(text, /vt\s.*/gm);
  const vertexNormals = getValuesFromPattern(text, /vn\s.*/gm);
  const faces = getValuesFromPattern(text, /f\s.*/gm, true);


  return { geometricVertices, textureVertices, vertexNormals, faces };
}

function getValuesFromPattern(text, pattern, faces) {
  let array = [];
  const matches = text.match(pattern);
  for (const geoVert of matches) {
    if (faces)
      array.push(getFloatsFromStringFaces(geoVert));
    else
      array.push(getFloatsFromString(geoVert));
  }
  return array;
}

function getFloatsFromStringFaces(text) {
  const numbers = text.match(/-?[0-9]\d*(\.\d+)?/g);
  return {
    x: { v: numbers[0], vt: numbers[1], vn: numbers[2] },
    y: { v: numbers[3], vt: numbers[4], vn: numbers[5] },
    z: { v: numbers[6], vt: numbers[7], vn: numbers[8] }
  };
}

function getFloatsFromString(text) {
  const [x, y, z] = text.match(/-?[0-9]\d*(\.\d+)?/g);
  return { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) };
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