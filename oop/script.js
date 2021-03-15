var gl;

async function main(vertexShaderSource, fragmentShaderSource) {

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let positionLoc = gl.getAttribLocation(program, "aPosition");

  // const res = await fetch('/teapot.obj');
  // const teapot = await res.text();
  // parseObj(teapot);

  let vertices = [
    0.5, 0.5, 0.0,  // top right
    0.5, -0.5, 0.0,  // bottom right
    -0.5, -0.5, 0.0,  // bottom left
    -0.5, 0.5, 0.0   // top left 
  ];
  let indices = [  // note that we start from 0!
    0, 1, 3,  // first Triangle
    1, 2, 3   // second Triangle
  ];

  const VAO = gl.createVertexArray();
  const VBO = gl.createBuffer(); //position buffer
  const EBO = gl.createBuffer();

  gl.bindVertexArray(VAO);

  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(
    positionLoc, size, gl.FLOAT, false, 0, 0);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
  gl.bindVertexArray(null);

  //define the viewport

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //rendering

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  //gl.enableVertexAttribArray(positionAttributeLocation);


  gl.bindVertexArray(VAO);

  //gl.drawArrays(primitiveType, offset, count);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

function parseObj(text) {
  const geometricVertices = getValuesFromPattern(text, /v\s.*/gm);
  const textureVertices = getValuesFromPattern(text, /vt\s.*/gm);
  const vertexNormals = getValuesFromPattern(text, /vn\s.*/gm);
  const faces = getValuesFromPattern(text, /f\s.*/gm, true);


  return { geometricVertices, textureVertices, vertexNormals, faces };
}

function getValuesFromPattern(text, pattern, faces) {
  array = [];
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
  return { x: parseFloat(x), y: parseFloat(y), z: parseFloat(y) };
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
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

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