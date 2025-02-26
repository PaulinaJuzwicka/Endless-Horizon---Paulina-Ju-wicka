import { ctx, canvas, setupUI, drawUI } from './ui.js';
import { saveHighScore } from './firebase.js';
import { GAME_SETTINGS, OBSTACLE_TYPES } from './game/settings.js';
import { drawBackground } from './game/terrain/terrain.js';
import { checkCollision } from './game/collision.js';
import { setupControls } from './controls.js';
import { generateObstacle, updateObstacles, drawObstacles } from './game/obstacles.js';

// Game state variables
let gameActive = false;
let lastTime = 0;
let deltaTime = 0;
let distance = 0;
let score = 0;
let gameSpeed = GAME_SETTINGS.baseSpeed;
let obstacles = [];

// Ustawienia gry
let shipX = window.innerWidth / 2;
const shipY = window.innerHeight * 0.8; // Stała wysokość statku (zawsze na dole)
let shipWidth = 50;
let shipHeight = 30;
let targetX = shipX; // Cel dla płynnego ruchu

// Ustawienia terenu
let currentTerrain = 0; // 0 - pustynia, 1 - góry, 2 - ruiny
let terrainTransition = 0; // Wartość od 0 do 1 dla płynnego przejścia
let terrainChangeDistance = 1000; // Zmiana terenu co ile jednostek dystansu

// Ustawienia żyroskopu
let gyroActive = false;
let gyroSensitivity = 2; // Czułość żyroskopu

// Funkcja do dostosowania rozmiaru canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    shipX = canvas.width / 2;
}

// Wywołujemy funkcję dostosowania przy starcie
window.addEventListener('load', () => {
    resizeCanvas();
});

// Nasłuchiwanie na zmianę rozmiaru okna
window.addEventListener('resize', resizeCanvas);

// Ustawienie żyroskopu
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(event) {
        if (event.gamma !== null && event.gamma !== undefined) {
            gyroActive = true;
            // Konwertuj gamma (przechylenie na boki) na pozycję statku
            targetX = (canvas.width / 2) + (event.gamma * gyroSensitivity);
        }
    });
} 

// Obsługa sterowania klawiaturą - płynny ruch
let keysPressed = {
    left: false,
    right: false
};

window.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            keysPressed.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            keysPressed.right = true;
            break;
    }
});

window.addEventListener('keyup', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            keysPressed.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keysPressed.right = false;
            break;
    }
});

// Obsługa dotykowego sterowania dla urządzeń mobilnych
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    targetX = touch.clientX;
}, { passive: false });

// Aktualizacja pozycji statku
function updateShipPosition(newTargetX) {
    targetX = newTargetX;
    
    // Płynny ruch w kierunku celu
    const easing = 0.1;
    shipX += (targetX - shipX) * easing;
    
    // Ograniczenie pozycji statku do granic ekranu
    shipX = Math.max(GAME_SETTINGS.shipWidth / 2, 
                     Math.min(canvas.width - GAME_SETTINGS.shipWidth / 2, shipX));
}

export function startGame() {
    gameActive = true;
    resetGame();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    distance = 0;
    score = 0;
    gameSpeed = GAME_SETTINGS.baseSpeed;
    obstacles = [];
    shipX = window.innerWidth / 2;
    targetX = shipX;
}

function gameLoop(currentTime) {
    if (!gameActive) return;

    // Obliczanie deltaTime
    if (lastTime === 0) lastTime = currentTime;
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Czyszczenie ekranu
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aktualizacja gry
    drawBackground(distance, deltaTime);
    updateObstacles(obstacles, deltaTime, gameSpeed, distance);
    drawObstacles(obstacles);
    
    // Aktualizacja pozycji statku
    updateShipPosition(targetX);

    // Sprawdzanie kolizji
    if (checkCollision(shipX, GAME_SETTINGS.shipY, GAME_SETTINGS.shipWidth, 
                      GAME_SETTINGS.shipHeight, obstacles)) {
        gameOver();
        return;
    }

    // Aktualizacja wyniku i prędkości
    score += deltaTime * gameSpeed;
    distance += gameSpeed * deltaTime;
    gameSpeed *= GAME_SETTINGS.speedIncreaseFactor;

    // Rysowanie UI
    drawUI(score, distance);

    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameActive = false;
    saveHighScore(Math.floor(score)).then(() => {
        alert(`Koniec gry! Twój wynik: ${Math.floor(score)}`);
        document.getElementById('menu').style.display = 'block';
        canvas.style.display = 'none';
    });
}

// Inicjalizacja kontrolek
setupControls(updateShipPosition);