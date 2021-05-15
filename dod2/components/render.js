import { Component, Types } from '../ecsy/index.js'
class Render extends Component { }

Render.schema = {
    VAO: { type: Types.Number },
    indicesLength: { type: Types.Number },
    colorR: { type: Types.Number },
    colorG: { type: Types.Number },
    colorB: { type: Types.Number },
};

export { Render }