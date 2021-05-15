import { Component, Types } from '../ecsy/index.js'
class Collision extends Component { }

Collision.schema = {
    collisionObject: { type: Types.Ref },
};

export { Collision }