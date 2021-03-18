import { WorldObject } from '/world-object.js'
import { mat4, vec3, quat, glMatrix } from '/gl-matrix/index.js'

class VisualObject extends WorldObject {
    constructor(gl, program, position, rotation, meshData) {

        super(position, rotation);
        this.meshData = meshData;

        this.init(gl, program, meshData);
    }

    init(gl, program, meshData) {
        let positionLoc = gl.getAttribLocation(program, "aPosition");

        this.vertices = meshData.geometricVertices.map(({ x, y, z }) => [x, y, z]).flat();
        this.indices = meshData.faces
            .map(({ x: { v: xv }, y: { v: yv }, z: { v: zv } }) => [xv - 1, yv - 1, zv - 1])
            .flat();

        this.VAO = gl.createVertexArray();
        this.VBO = gl.createBuffer(); //position buffer
        this.EBO = gl.createBuffer();

        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);


        // enable attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(
            positionLoc, 3, gl.FLOAT, false, 0, 0);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(gl, program) {
        let model = mat4.create();

        model = mat4.fromRotationTranslation(mat4.create(), this.rotation, this.position);

        //model = mat4.translate(mat4.create(), model, this.position);

        //model = mat4.rotate(mat4.create(), model, glMatrix.toRadian(30), vec3.fromValues(0, 1, 0))

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);

        gl.bindVertexArray(this.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}


export { VisualObject };