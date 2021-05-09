class System {
    iterateEntitiesOfTypes(types, componentStorage, iterateFunction, gl, program, world) {
        //since javascript does not use pointers we have to directly search through the list of component each time
        let length = componentStorage[types[0]].length

        outer:
        for (let i = 0; i < length; i++) {
            let entity = {};
            for (let componentType of types) {
                let attr = componentStorage[componentType][i];
                if (attr === undefined) {
                    continue outer;
                }
                entity[componentType] = attr;
            }
            iterateFunction(entity, gl, program, componentStorage, world);
            for (let attrName in entity) {
                componentStorage[attrName][i] = entity[attrName];
            }
        }
    }
}


export { System };