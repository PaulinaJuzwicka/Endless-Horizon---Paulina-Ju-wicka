import * as BABYLON from './scripts/babylon.js';
import { loadShip } from './game_logic/movement.js';
import { createObstacles } from './game_logic/obstacles.js';
import { checkCollisions } from './game_logic/collisions.js';
import { createTerrain } from './game_logic/terrain.js';
import { updateScore } from './game_logic/score.js';

// Inicjalizacja sceny
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Ładowanie statku i przeszkód
let ship = loadShip(scene);
createTerrain(scene);
let obstacles = createObstacles(scene);

// Pętla gry
engine.runRenderLoop(() => {
    updateScore();
    checkCollisions(ship, obstacles, scene);
    scene.render();
});

// Obsługa zmian rozmiaru
window.addEventListener("resize", () => {
    engine.resize();
});

// Obsługa akcelerometru
window.addEventListener("deviceorientation", (event) => {
    const gamma = event.gamma; // Zakres od -90 do 90
    ship.position.x = gamma / 90 * 10; // Przeskalowanie do zakresu pozycji statku
});
