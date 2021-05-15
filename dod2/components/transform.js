import { Component, Types } from '../ecsy/index.js'
class Transform extends Component { }

Transform.schema = {
    x: { type: Types.Number },
    y: { type: Types.Number },
    z: { type: Types.Number },
    xRot: { type: Types.Number },
    yRot: { type: Types.Number },
    zRot: { type: Types.Number },
    wRot: { type: Types.Number },
    parent: { type: Types.Ref }
};

export { Transform }