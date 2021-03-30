import { System } from './system.js'
import { glMatrix, quat } from '../gl-matrix/index.js'

class SpinSystem extends System {
    update(componentStorage, gl, program, viewPos) {
        //define what attributes the entity should have
        let types = ['xRot', 'yRot', 'zRot', 'wRot'];
        this.iterateEntitiesOfTypes(types, componentStorage, gl, program, viewPos, this.spinObject);
    }

    spinObject(entity) {
        let quatObject = quat.fromValues(entity.xRot, entity.yRot, entity.zRot, entity.wRot);
        quat.rotateX(quatObject, quatObject, glMatrix.toRadian(-0.2));
        quat.rotateZ(quatObject, quatObject, glMatrix.toRadian(-0.2));
        entity.xRot = quatObject[0];
        entity.yRot = quatObject[1];
        entity.zRot = quatObject[2];
        entity.wRot = quatObject[3];

        return entity;
    }
}

export { SpinSystem };