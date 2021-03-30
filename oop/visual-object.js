import { WorldObject } from './world-object.js'
import { mat4, vec3, vec4, quat, glMatrix } from './gl-matrix/index.js'

class VisualObject extends WorldObject {
    constructor(position, rotation, renderData, collisionObject, color = vec3.create()) {

        super(position, rotation);
        this.renderData = renderData;
        this.collisionObject = collisionObject;

        this.color = color;
    }

    draw(gl, program, viewPos) {
        let model = mat4.create();

        mat4.fromRotationTranslation(model, this.rotation, this.position);

        //model = mat4.translate(mat4.create(), model, this.position);

        //model = mat4.rotate(mat4.create(), model, glMatrix.toRadian(30), vec3.fromValues(0, 1, 0))

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);


        //this.color = (Math.sin((new Date).getTime() / 1000) / 2.0) + 0.5;
        gl.uniform3fv(gl.getUniformLocation(program, "color"), this.color);
        gl.uniform3fv(gl.getUniformLocation(program, "lightColor"), vec3.fromValues(1, 1, 1));
        gl.uniform3fv(gl.getUniformLocation(program, "lightPos"), vec3.fromValues(0, 0, 0));
        gl.uniform3fv(gl.getUniformLocation(program, "viewPos"), viewPos);

        gl.bindVertexArray(this.renderData.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, this.renderData.indicesLength, gl.UNSIGNED_SHORT, 0);
    }
}


export { VisualObject };