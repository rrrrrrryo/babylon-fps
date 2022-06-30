import * as BABYLON from "@babylonjs/core"
import {createScene} from "./scene"

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

createScene(engine, canvas).then(
  sceneToRender => {
    engine.runRenderLoop(() => sceneToRender.render());
  }
);
window.addEventListener("resize", function () {
  engine.resize()
});