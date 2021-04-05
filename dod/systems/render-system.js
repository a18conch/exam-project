import { System } from './system.js'
import { vec3, quat, mat4 } from '../../common/gl-matrix/index.js'

class RenderSystem extends System {
    update(componentStorage, gl, program, viewPos) {
        //define what attributes the entity should have
        let types = ['x', 'y', 'z', 'xRot', 'yRot', 'zRot', 'wRot', 'VAO', 'indicesLength', 'colorR', 'colorG', 'colorB'];
        this.iterateEntitiesOfTypes(types, componentStorage, this.drawObject, gl, program, viewPos);
    }

    drawObject(entity, gl, program, viewPos) {
        let model = mat4.create();

        mat4.fromRotationTranslation(model,
            quat.fromValues(entity.xRot, entity.yRot, entity.zRot, entity.wRot),
            vec3.fromValues(entity.x, entity.y, entity.z));

        //model = mat4.translate(mat4.create(), model, this.position);

        //model = mat4.rotate(mat4.create(), model, glMatrix.toRadian(30), vec3.fromValues(0, 1, 0))

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);

        gl.uniform3fv(gl.getUniformLocation(program, "color"), vec3.fromValues(entity.colorR, entity.colorG, entity.colorB));

        //this.color = (Math.sin((new Date).getTime() / 1000) / 2.0) + 0.5;

        gl.bindVertexArray(entity.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, entity.indicesLength, gl.UNSIGNED_SHORT, 0);
    }
}

export { RenderSystem };