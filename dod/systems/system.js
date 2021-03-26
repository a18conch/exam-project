class System {
    iterateEntitiesOfTypes(types, componentStorage, gl, program, viewPos, iterateFunction) {
        //since javascript does not use pointers we have to directly search through the list of component each time
        let length = componentStorage[types[0].name][Object.keys(componentStorage[types[0].name])[0]].length

        outer:
        for (let i = 0; i < length; i++) {
            let entity = {};
            for (let componentType of types) {
                entity[componentType.name] = {};
                for (let componentAttribute in componentStorage[componentType.name]) {
                    let attribute = componentStorage[componentType.name][componentAttribute][i];
                    if (attribute == null) {
                        continue outer;
                    }
                    entity[componentType.name][componentAttribute] = attribute;
                }
            }
            iterateFunction(gl, program, viewPos, entity);
        }
    }
}


export { System };