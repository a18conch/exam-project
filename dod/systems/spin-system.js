import { System } from './system.js'
import { glMatrix } from '../gl-matrix/index.js'

class SpinSystem extends System {
    update(componentStorage, gl, program, viewPos) {
        //define what attributes the entity should have
        let types = ['xRot', 'zRot'];
        this.iterateEntitiesOfTypes(types, componentStorage, gl, program, viewPos, this.spinObject);
    }

    spinObject(entity) {
        entity.xRot += -0.2;
        entity.zRot += -0.2;
        //console.log(entity);
        return entity;
    }
}

export { SpinSystem };