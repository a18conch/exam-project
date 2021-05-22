import { WorldObject } from './world-object.js'
import { mat4, vec3, vec4, quat, glMatrix } from '../common/gl-matrix/index.js'

class VisualObject extends WorldObject {
    constructor(position, rotation, renderData, collisionObject, color = vec3.create()) {

        super(position, rotation);
        this.renderData = renderData;
        this.collisionObject = collisionObject;

        this.color = color;
        this.children = [];
    }

    draw(gl, program, parentPos, parentRot) {

        let model;
        if (parentPos && parentRot) {
            model = mat4.fromRotationTranslation(mat4.create(), parentRot, parentPos);
            mat4.multiply(model, model, mat4.fromRotationTranslation(mat4.create(), this.rotation, this.position));
        }
        else
            model = mat4.fromRotationTranslation(mat4.create(), this.rotation, this.position);


        //model = mat4.translate(mat4.create(), model, this.position);

        //model = mat4.rotate(mat4.create(), model, glMatrix.toRadian(30), vec3.fromValues(0, 1, 0))

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);

        //this.color = (Math.sin((new Date).getTime() / 1000) / 2.0) + 0.5;
        gl.uniform3fv(gl.getUniformLocation(program, "color"), this.color);

        gl.bindVertexArray(this.renderData.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, this.renderData.indicesLength, gl.UNSIGNED_SHORT, 0);

        for (let child of this.children) {
            child.draw(gl, program, mat4.getTranslation(vec3.create(), model), mat4.getRotation(quat.create(), model));
        }
    }

    addChild(child) {
        this.children.push(child);
    }
}


export { VisualObject };