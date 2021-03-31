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
    if (!matches)
        return;
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

//cacheObject is a Map
async function loadObj(uri, cacheObject, gl, program) {

    if (cacheObject.has(uri))
        return cacheObject.get(uri);

    const res = await fetch(uri);
    const teapotData = await res.text();

    let data = parseObj(teapotData);

    let renderData = initializeData(gl, program, data);
    cacheObject.set(uri, renderData);
    return renderData;
}

function initializeData(gl, program, meshData) {
    let positionLoc = gl.getAttribLocation(program, "aPosition");
    let normalLoc = gl.getAttribLocation(program, "aNormal");

    let vertices = meshData.geometricVertices.map(({ x, y, z }) => [x, y, z]).flat();
    let normalVertices = meshData.vertexNormals.map(({ x, y, z }) => [x, y, z]).flat();
    let indices = meshData.faces
        .map(({ x: { v: xv }, y: { v: yv }, z: { v: zv } }) => [xv - 1, yv - 1, zv - 1])
        .flat();

    // indices = indices.reduce((acc, cur) => {
    //   return acc.concat([cur.x.v, cur.y.v, cur.z.v]);
    // }, []);

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


export { loadObj }