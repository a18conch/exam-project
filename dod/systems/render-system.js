import { System } from './system.js'
import { vec3, quat, mat4 } from '../../common/gl-matrix/index.js'

class RenderSystem extends System {
    update(componentStorage, gl, program) {
        //define what attributes the entity should have
        let types = ['x', 'y', 'z', 'xRot', 'yRot', 'zRot', 'wRot', 'VAO', 'indicesLength', 'colorR', 'colorG', 'colorB', 'parentIndex'];
        this.iterateEntitiesOfTypes(types, componentStorage, this.drawObject, gl, program);
    }

    drawObject(entity, gl, program, componentStorage) {

        let getTransformRecursive = (parentIndex, componentStorage) => {
            let currentTransform = mat4.fromRotationTranslation(mat4.create(),
                quat.fromValues(componentStorage.xRot[parentIndex], componentStorage.yRot[parentIndex], componentStorage.zRot[parentIndex], componentStorage.wRot[parentIndex]),
                vec3.fromValues(componentStorage.x[parentIndex], componentStorage.y[parentIndex], componentStorage.z[parentIndex]));
            if (componentStorage.parentIndex[parentIndex] !== null) {
                parentTransform = getTransformRecursive(componentStorage.parentIndex[parentIndex], componentStorage);
                mat4.multiply(currentTransform, parentTransform, currentTransform);
            }
            return currentTransform;
        }

        let model;
        if (entity.parentIndex !== null) {

            model = getTransformRecursive(entity.parentIndex, componentStorage);
            mat4.multiply(model, model, mat4.fromRotationTranslation(mat4.create(),
                quat.fromValues(entity.xRot, entity.yRot, entity.zRot, entity.wRot),
                vec3.fromValues(entity.x, entity.y, entity.z)));
        }
        else
            model = mat4.fromRotationTranslation(mat4.create(),
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