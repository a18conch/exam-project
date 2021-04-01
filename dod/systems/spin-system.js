import { System } from './system.js'

class SpinSystem extends System {
    update(componentStorage, gl, program, viewPos, world) {

        //update world physics
        world.step();

        //define what attributes the entity should have
        let types = ['x', 'y', 'z', 'xRot', 'yRot', 'zRot', 'wRot', 'collisionObject'];
        this.iterateEntitiesOfTypes(types, componentStorage, this.spinObject, gl, program, viewPos, world);
    }

    spinObject(entity, gl, program, viewPos, world) {

        entity.x = entity.collisionObject.getPosition().x;
        entity.y = entity.collisionObject.getPosition().y;
        entity.z = entity.collisionObject.getPosition().z;
        entity.xRot = entity.collisionObject.getQuaternion().x;
        entity.yRot = entity.collisionObject.getQuaternion().y;
        entity.zRot = entity.collisionObject.getQuaternion().z;
        entity.wRot = entity.collisionObject.getQuaternion().w;
        //console.log(entity.collisionObject.getQuaternion())
        // let quatObject = quat.fromValues(entity.xRot, entity.yRot, entity.zRot, entity.wRot);
        // quat.rotateX(quatObject, quatObject, glMatrix.toRadian(-0.2));
        // quat.rotateZ(quatObject, quatObject, glMatrix.toRadian(-0.2));
        // entity.xRot = quatObject[0];
        // entity.yRot = quatObject[1];
        // entity.zRot = quatObject[2];
        // entity.wRot = quatObject[3];

        return entity;
    }
}

export { SpinSystem };