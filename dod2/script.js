var gl;
var displayWidth;
var displayHeight;
var process = {};

import { mat4, vec3, vec4, quat, glMatrix } from '../common/gl-matrix/index.js'
import { loadObj } from '../common/parse-obj.js'
import { DOD2Test, testInit, testUpdate, test } from '../common/test.js'
import { viewPos, perspectiveProjection, testWorld } from '../common/constants.js';
import { World, System, Component, TagComponent, Types } from "./ecsy/index.js";
import { yNegativePos, resetPos } from '../common/constants.js'
import { Transform, Render, Collision } from './components/allComponents.js'

async function main(vertexShaderSource, fragmentShaderSource, section) {

  Math.seedrandom('0');

  //glMatrix.setMatrixArrayType(Array)

  const canvas = document.querySelector("#glCanvas");

  gl = canvas.getContext("webgl2");

  resizeCanvasToDisplaySize(gl.canvas);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  let program = createProgram(gl, vertexShader, fragmentShader);

  let cache = new Map();

  let world = testWorld();

  class RenderSystem extends System {
    // This method will get called on every frame by default
    execute(delta, time) {
      // Iterate through all the entities on the query
      this.queries.moving.results.forEach(entity => {
        var transform = entity.getMutableComponent(Transform);
        var render = entity.getMutableComponent(Render);

        let getTransformRecursive = (parentEntity) => {

          let parentTransform = parentEntity.getMutableComponent(Transform);
          let currentTransform = mat4.fromRotationTranslation(mat4.create(),
            quat.fromValues(parentTransform.xRot, parentTransform.yRot, parentTransform.zRot, parentTransform.wRot),
            vec3.fromValues(parentTransform.x, parentTransform.y, parentTransform.z));

          if (parentTransform.parent !== null) {
            parentTransform = getTransformRecursive(parentTransform.parent);
            mat4.multiply(currentTransform, parentTransform, currentTransform);
          }

          return currentTransform;
        }

        let model;
        if (transform.parent !== null) {

          model = getTransformRecursive(transform.parent);
          mat4.multiply(model, model, mat4.fromRotationTranslation(mat4.create(),
            quat.fromValues(transform.xRot, transform.yRot, transform.zRot, transform.wRot),
            vec3.fromValues(transform.x, transform.y, transform.z)));
        }
        else
          model = mat4.fromRotationTranslation(mat4.create(),
            quat.fromValues(transform.xRot, transform.yRot, transform.zRot, transform.wRot),
            vec3.fromValues(transform.x, transform.y, transform.z));



        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);

        gl.uniform3fv(gl.getUniformLocation(program, "color"), vec3.fromValues(render.colorR, render.colorG, render.colorB));

        //this.color = (Math.sin((new Date).getTime() / 1000) / 2.0) + 0.5;

        gl.bindVertexArray(render.VAO);

        //gl.drawArrays(primitiveType, offset, count);
        gl.drawElements(gl.TRIANGLES, render.indicesLength, gl.UNSIGNED_SHORT, 0);
      });
    }
  }

  // Define a query of entities that have "Velocity" and "Position" components
  RenderSystem.queries = {
    moving: {
      components: [Transform, Render]
    }
  }

  class PhysicsSystem extends System {
    // This method will get called on every frame by default
    execute(delta, time) {
      // Iterate through all the entities on the query
      world.step();

      this.queries.moving.results.forEach(entity => {
        var transform = entity.getMutableComponent(Transform);
        var collision = entity.getMutableComponent(Collision);

        if (transform.y < yNegativePos) {
          let pos = resetPos();
          collision.resetPosition(pos[0], pos[1], pos[2]);
        }

        transform.x = collision.collisionObject.getPosition().x;
        transform.y = collision.collisionObject.getPosition().y;
        transform.z = collision.collisionObject.getPosition().z;
        transform.xRot = collision.collisionObject.getQuaternion().x;
        transform.yRot = collision.collisionObject.getQuaternion().y;
        transform.zRot = collision.collisionObject.getQuaternion().z;
        transform.wRot = collision.collisionObject.getQuaternion().w;
      });
    }
  }

  // Define a query of entities that have "Velocity" and "Position" components
  PhysicsSystem.queries = {
    moving: {
      components: [Transform, Collision]
    }
  }

  var ecsWorld = new World();
  ecsWorld
    .registerComponent(Transform)
    .registerComponent(Render)
    .registerComponent(Collision)
    //.registerComponent(Parent)
    .registerSystem(RenderSystem)
    .registerSystem(PhysicsSystem);

  const renderData = await loadObj('../common/models/teapot.obj', cache, gl, program);

  DOD2Test(ecsWorld, renderData.VAO, renderData.indicesLength, world, gl, program, section);

  //createTeapot(componentStorage, world, -15, 10, 0, renderData.VAO, renderData.indicesLength);
  //createTeapot(componentStorage, world, -12, 30, 0, renderData.VAO, renderData.indicesLength);
  //createEntity(componentStorage, { VAO: renderData.VAO, indicesLength: renderData.indicesLength });

  //viewport

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //rendering

  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);

  //gl.enableVertexAttribArray(positionAttributeLocation);

  // let time = (new Date).getTime();
  // let counter = 0;

  let view = mat4.create();
  let projection = mat4.create();

  view = mat4.translate(mat4.create(), view, viewPos);
  projection = perspectiveProjection(displayWidth, displayHeight);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, projection);

  gl.uniform3fv(gl.getUniformLocation(program, "lightColor"), vec3.fromValues(1, 1, 1));
  gl.uniform3fv(gl.getUniformLocation(program, "lightPos"), vec3.fromValues(20, 20, 0));
  gl.uniform3fv(gl.getUniformLocation(program, "viewPos"), viewPos);

  testInit(section);
  while (true) {
    await new Promise(r => setTimeout(r, 1));

    // counter++;
    // if ((new Date).getTime() > time + 1000) {
    //   time = (new Date).getTime();
    //   console.log(counter);
    //   counter = 0;
    // }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.clear(gl.GL_DEPTH_BUFFER_BIT);


    ecsWorld.execute();

    if (testUpdate(section)) {
      gl = null;
      return;
    }
  }
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  displayWidth = canvas.clientWidth;
  displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function reportWindowSize() {
  resizeCanvasToDisplaySize(gl.canvas);
}

window.onresize = reportWindowSize;
window.onload = () => {

  Promise.all([fetch("../common/shaders/shader.vs"), fetch("../common/shaders/shader.fs")]).then(([vertex, fragment]) => {
    if (!vertex.ok || !fragment.ok) {
      //throw new Error("HTTP error " + res.status)
    }
    return Promise.all([vertex.text(), fragment.text()]);
  }).then(([vertex, fragment]) => {
    test(main, vertex, fragment, "DOD");
  })
}