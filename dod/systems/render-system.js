import { TransformComponent } from "../components/transform-component.js";
import { RenderComponent } from "../components/render-component.js";
import { System } from './system.js'
import { vec3, quat, mat4 } from '../gl-matrix/index.js'

class RenderSystem extends System {
    update(componentStorage, gl, program, viewPos) {
        let types = ['x', 'y', 'z', 'xRot', 'yRot', 'zRot', 'VAO', 'indicesLength'];
        this.iterateEntitiesOfTypes(types, componentStorage, gl, program, viewPos, this.drawObject);
    }

    drawObject(gl, program, viewPos, entity) {
        let model = mat4.create();

        mat4.fromRotationTranslation(model,
            quat.fromEuler(quat.create(), entity.xRot, entity.yRot, entity.zRot),
            vec3.fromValues(entity.x, entity.y, entity.z));

        //model = mat4.translate(mat4.create(), model, this.position);

        //model = mat4.rotate(mat4.create(), model, glMatrix.toRadian(30), vec3.fromValues(0, 1, 0))

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);


        //this.color = (Math.sin((new Date).getTime() / 1000) / 2.0) + 0.5;
        gl.uniform3fv(gl.getUniformLocation(program, "color"), vec3.fromValues(0.5, 0.5, 0.5));
        gl.uniform3fv(gl.getUniformLocation(program, "lightColor"), vec3.fromValues(1, 1, 1));
        gl.uniform3fv(gl.getUniformLocation(program, "lightPos"), vec3.fromValues(0, 0, 0));
        gl.uniform3fv(gl.getUniformLocation(program, "viewPos"), viewPos);

        gl.bindVertexArray(entity.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, entity.indicesLength, gl.UNSIGNED_SHORT, 0);
    }
}

export { RenderSystem };