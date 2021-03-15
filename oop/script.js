var gl;

async function main(vertexShaderSource, fragmentShaderSource) {

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  var positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const res = await fetch('/teapot.obj');
  const teapot = await res.text();
  parseObj(teapot);

  var positions = [
    0.5, -0.5, 0.0, 1.0, 0.0, 0.0,   // bottom right
    -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,   // bottom left
    0.0, 0.5, 0.0, 0.0, 0.0, 1.0    // top 
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  //define the viewport

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //rendering

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = positions.length / size;
  gl.drawArrays(primitiveType, offset, count);
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