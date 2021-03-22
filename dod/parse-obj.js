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


export { parseObj }