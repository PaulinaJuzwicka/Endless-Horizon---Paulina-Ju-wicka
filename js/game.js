import { ctx, canvas } from './ui.js';
import { saveHighScore } from './supabase.js'; // Change Firebase to Supabase

// Ustawienia gry
let shipX = window.innerWidth / 2;
const shipY = window.innerHeight * 0.8; // Stała wysokość statku (zawsze na dole)
let shipWidth = 60; // Zwiększone z 50
let shipHeight = 36; // Zwiększone z 30 (zachowując proporcje)
const baseSpeed = 200; // Bazowa prędkość
const speedIncreasePerLevel = 50; // O ile zwiększamy prędkość na poziom
let gameSpeed = baseSpeed; // Aktualna prędkość gry
let speedIncreaseFactor = 1.0005; // Współczynnik przyspieszenia (z każdą klatką)
let distance = 0;
let gameActive = false;
let lastTime = 0;
let deltaTime = 0;
let targetX = shipX; // Cel dla płynnego ruchu
let level = 1; // Poziom gry

// Ustawienia żyroskopu
let gyroActive = false;
let gyroSensitivity = 2; // Czułość żyroskopu

// Tablica przeszkód
let obstacles = [];

// Zmienna do przechowywania prędkości poruszania się statkiem
const shipMoveSpeed = 500; // Zwiększona prędkość poruszania się statkiem

// Stałe dla biomów z poprawionymi ścieżkami do obrazów
const BIOMES = {
    DESERT: {
        name: 'Pustynia',
        obstacles: ['rocks', 'canyons'],
        backgroundColor: "#FFD700",
        background: 'desert'
    },
    MOUNTAINS: {
        name: 'Góry',
        obstacles: ['rocks', 'canyons', 'transmissionTowers'],
        backgroundColor: "#4B0082",
        background: 'mountains'
    },
    CITY: {
        name: 'Miasto',
        obstacles: ['buildingRuins', 'transmissionTowers', 'energyBarriers'],
        backgroundColor: "#2F4F4F",
        background: 'city'
    },
    RUINS: {
        name: 'Ruiny Miasta',
        obstacles: ['buildingRuins', 'spaceshipWreck'],
        backgroundColor: "#2F4F4F",
        background: 'ruins'
    }
};

// Cache dla załadowanych obrazów
const backgroundCache = new Map();

// Funkcja do ładowania obrazu
function loadImage(src) {
    if (backgroundCache.has(src)) {
        return backgroundCache.get(src);
    }
    
    const img = new Image();
    img.src = src;
    backgroundCache.set(src, img);
    return img;
}

// Dodaj zmienne do skalowania
let screenScale = 1;
const BASE_WIDTH = 1920; // Bazowa szerokość dla projektu
const BASE_HEIGHT = 1080; // Bazowa wysokość dla projektu

// Dodaj zmienną przechowującą aktualny biom
let currentBiome = BIOMES.RUINS;

// Add background images
const backgrounds = {
    desert: new Image(),
    mountains: new Image(),
    city: new Image(),
    ruins: new Image()
};

// Load background images
backgrounds.desert.src = 'assets/pustynia.png';
backgrounds.mountains.src = 'assets/gory.png';
backgrounds.city.src = 'assets/miasto.png';
backgrounds.ruins.src = 'assets/ruiny_miasta.png';

// Zmodyfikuj funkcję resizeCanvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Oblicz skalę na podstawie wymiarów ekranu
    const widthScale = canvas.width / BASE_WIDTH;
    const heightScale = canvas.height / BASE_HEIGHT;
    screenScale = Math.min(widthScale, heightScale);
    
    // Dostosuj wymiary statku i przeszkód
    shipWidth = 60 * screenScale;
    shipHeight = 36 * screenScale;
    
    // Ustaw początkową pozycję statku
    shipX = canvas.width / 2;
    targetX = shipX;
    
    // Dostosuj prędkości
    baseSpeed = 200 * screenScale;
    shipMoveSpeed = 500 * screenScale;
    speedIncreasePerLevel = 50 * screenScale;
    
    // Zaktualizuj style UI
    updateUIStyles();
}

// Dodaj funkcję do aktualizacji stylów UI
function updateUIStyles() {
    ctx.font = `${20 * screenScale}px Arial`;
    // Dostosuj inne elementy UI
    const fontSize = Math.max(16, Math.floor(20 * screenScale));
    document.documentElement.style.setProperty('--game-font-size', `${fontSize}px`);
}

// Wywołujemy funkcję dostosowania przy starcie
window.addEventListener('load', () => {
    preloadImages();
    resizeCanvas();
});

// Nasłuchiwanie na zmianę rozmiaru okna
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
function updateShipPosition() {
    // Aktualizacja targetX na podstawie klawiszy (jeśli żyroskop nie jest aktywny)
    if (!gyroActive) {
        const moveSpeed = shipMoveSpeed * deltaTime; // Zwiększona prędkość ruchu statku
        if (keysPressed.left) targetX -= moveSpeed;
        if (keysPressed.right) targetX += moveSpeed;
    }
    
    // Ograniczenie targetX do granic ekranu
    targetX = Math.max(shipWidth / 2, Math.min(canvas.width - shipWidth / 2, targetX));
    
    // Płynny ruch w kierunku celu
    const easing = 0.1;
    shipX += (targetX - shipX) * easing;
}

// Funkcja do detekcji kolizji
function checkCollision() {
    // Hitbox statku (mniejszy niż grafika dla lepszej rozgrywki)
    const shipHitbox = {
        x: shipX - shipWidth * 0.3,
        y: shipY - shipHeight * 0.3,
        width: shipWidth * 0.6,
        height: shipHeight * 0.6
    };

    for (let obstacle of obstacles) {
        let obstacleHitbox;
        
        switch(obstacle.type) {
            case 'canyons':
                // Dla kanionu sprawdzamy kolizję z ścianami
                const leftWall = {
                    x: obstacle.x,
                    y: obstacle.y,
                    width: obstacle.width * 0.3,
                    height: obstacle.height
                };
                
                const rightWall = {
                    x: obstacle.x + obstacle.width * 0.7,
                    y: obstacle.y,
                    width: obstacle.width * 0.3,
                    height: obstacle.height
                };
                
                if (checkHitboxCollision(shipHitbox, leftWall) || 
                    checkHitboxCollision(shipHitbox, rightWall)) {
                    return true;
                }
                continue;
                
            case 'spaceshipWreck':
                // Mniejszy hitbox dla wraku
                obstacleHitbox = {
                    x: obstacle.x + obstacle.width * 0.2,
                    y: obstacle.y + obstacle.height * 0.2,
                    width: obstacle.width * 0.6,
                    height: obstacle.height * 0.6
                };
                break;
                
            case 'energyBarriers':
                // Ukośny hitbox dla barier energetycznych
                const angle = Math.atan2(obstacle.height, obstacle.width);
                const length = Math.sqrt(obstacle.width * obstacle.width + 
                                      obstacle.height * obstacle.height);
                obstacleHitbox = {
                    x: obstacle.x,
                    y: obstacle.y,
                    width: length * 0.8,
                    height: 20,
                    angle: angle
                };
                break;
                
            default:
                // Standardowy hitbox dla pozostałych przeszkód
                obstacleHitbox = {
                    x: obstacle.x,
                    y: obstacle.y,
                    width: obstacle.width,
                    height: obstacle.height
                };
        }
        
        if (checkHitboxCollision(shipHitbox, obstacleHitbox)) {
            return true;
        }
    }
    return false;
}

// Funkcja pomocnicza do sprawdzania kolizji między dwoma hitboxami
function checkHitboxCollision(hitboxA, hitboxB) {
    if (hitboxB.angle !== undefined) {
        // Dla ukośnych hitboxów (np. bariery energetyczne)
        // Przekształć punkt statku względem kąta przeszkody
        const dx = hitboxA.x - hitboxB.x;
        const dy = hitboxA.y - hitboxB.y;
        const rotatedX = dx * Math.cos(-hitboxB.angle) - dy * Math.sin(-hitboxB.angle);
        const rotatedY = dx * Math.sin(-hitboxB.angle) + dy * Math.cos(-hitboxB.angle);
        
        return (rotatedX >= 0 && rotatedX <= hitboxB.width &&
                Math.abs(rotatedY) <= hitboxB.height / 2);
    }
    
    return (hitboxA.x < hitboxB.x + hitboxB.width &&
            hitboxA.x + hitboxA.width > hitboxB.x &&
            hitboxA.y < hitboxB.y + hitboxB.height &&
            hitboxA.y + hitboxA.height > hitboxB.y);
}

// Enhanced functions for drawing more visually appealing obstacles

// Function to draw building ruins
function drawBuildingRuins(obstacle) {
    // Base structure
    ctx.fillStyle = obstacle.color || "#8B4513";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Damaged/exposed interior section
    ctx.fillStyle = "#654321";
    ctx.fillRect(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.1, 
                obstacle.width * 0.6, obstacle.height * 0.8);
    
    // Add structural details - columns/support beams
    ctx.fillStyle = "#A0522D";
    // Left column
    ctx.fillRect(obstacle.x + obstacle.width * 0.15, obstacle.y, 
                obstacle.width * 0.1, obstacle.height);
    // Right column
    ctx.fillRect(obstacle.x + obstacle.width * 0.75, obstacle.y, 
                obstacle.width * 0.1, obstacle.height);
    
    // Windows and architectural details
    ctx.fillStyle = "#000";
    // Row of windows
    const windowSpacing = obstacle.width * 0.15;
    const windowSize = obstacle.width * 0.1;
    for (let i = 1; i <= 4; i++) {
        ctx.fillRect(obstacle.x + windowSpacing * i, 
                    obstacle.y + obstacle.height * 0.2, 
                    windowSize, obstacle.height * 0.15);
        
        ctx.fillRect(obstacle.x + windowSpacing * i, 
                    obstacle.y + obstacle.height * 0.5, 
                    windowSize, obstacle.height * 0.15);
    }
    
    // Debris/rubble at the base
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.moveTo(obstacle.x - obstacle.width * 0.1, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.9);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 1.1, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.9, obstacle.y + obstacle.height * 0.85);
    ctx.fill();
    
    // Cracks in the structure
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.3, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.4);
    ctx.lineTo(obstacle.x + obstacle.width * 0.4, obstacle.y + obstacle.height);
    ctx.stroke();
    
    // Border outline for definition
    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 3;
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// Function to draw spaceship wrecks
function drawSpaceshipWreck(obstacle) {
    // Main hull
    ctx.fillStyle = obstacle.color || "#A9A9A9";
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y + obstacle.height * 0.8);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // Damaged section with exposed interior
    ctx.fillStyle = "#696969";
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.4);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.2);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.4);
    ctx.lineTo(obstacle.x + obstacle.width * 0.6, obstacle.y + obstacle.height * 0.6);
    ctx.lineTo(obstacle.x + obstacle.width * 0.4, obstacle.y + obstacle.height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Engine exhaust ports
    ctx.fillStyle = "#4D4D4D";
    ctx.beginPath();
    ctx.arc(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.75, 
            obstacle.width * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.75, 
            obstacle.width * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Smoke/fire from damage
    ctx.fillStyle = "rgba(255, 69, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.3, 
            obstacle.width * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Debris field around wreck
    ctx.fillStyle = "#808080";
    for (let i = 0; i < 5; i++) {
        const debrisX = obstacle.x + Math.random() * obstacle.width;
        const debrisY = obstacle.y + obstacle.height * 0.8 + Math.random() * (obstacle.height * 0.2);
        const debrisSize = obstacle.width * 0.05 + Math.random() * (obstacle.width * 0.05);
        
        ctx.beginPath();
        ctx.arc(debrisX, debrisY, debrisSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ship details - windows, panels
    ctx.fillStyle = "#C0C0C0";
    // Windows
    ctx.fillRect(obstacle.x + obstacle.width * 0.4, obstacle.y + obstacle.height * 0.3, 
                obstacle.width * 0.05, obstacle.height * 0.05);
    ctx.fillRect(obstacle.x + obstacle.width * 0.55, obstacle.y + obstacle.height * 0.3, 
                obstacle.width * 0.05, obstacle.height * 0.05);
    
    // Hull panels
    ctx.strokeStyle = "#2F4F4F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.5);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height * 0.5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.3);
    ctx.stroke();
    
    // Outline to define the shape
    ctx.strokeStyle = "#4682B4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y + obstacle.height * 0.8);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.8);
    ctx.closePath();
    ctx.stroke();
}

// Function to draw rocks
function drawRocks(obstacle) {
    // Main rock formation - irregular shape
    ctx.fillStyle = obstacle.color || "#808080";
    
    // Draw main rock with jagged edges
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y + obstacle.height * 0.6);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.4, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.2);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.5);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height);
    ctx.closePath();
    ctx.fill();
    
    // Highlights on the rock
    ctx.fillStyle = "#A9A9A9";
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.4, obstacle.y + obstacle.height * 0.1);
    ctx.lineTo(obstacle.x + obstacle.width * 0.6, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.5);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.6);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Shadows and crevices
    ctx.fillStyle = "#4D4D4D";
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.5);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.7);
    ctx.lineTo(obstacle.x + obstacle.width * 0.1, obstacle.y + obstacle.height * 0.8);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.6, obstacle.y + obstacle.height * 0.4);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height * 0.6);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.8);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Detailed cracks
    ctx.strokeStyle = "#2F4F4F";
    ctx.lineWidth = 1;
    
    // Multiple cracks
    for (let i = 0; i < 3; i++) {
        const startX = obstacle.x + Math.random() * obstacle.width;
        const startY = obstacle.y + Math.random() * obstacle.height;
        const length = obstacle.width * (0.2 + Math.random() * 0.3);
        const angle = Math.random() * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + length * Math.cos(angle), 
                  startY + length * Math.sin(angle));
        
        // Branch in the crack
        if (Math.random() > 0.5) {
            const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            const branchLength = length * 0.7;
            ctx.moveTo(startX + length * 0.6 * Math.cos(angle), 
                      startY + length * 0.6 * Math.sin(angle));
            ctx.lineTo(startX + length * 0.6 * Math.cos(angle) + branchLength * Math.cos(branchAngle),
                      startY + length * 0.6 * Math.sin(angle) + branchLength * Math.sin(branchAngle));
        }
        
        ctx.stroke();
    }
    
    // Outline for definition
    ctx.strokeStyle = "#696969";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y + obstacle.height * 0.6);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.3);
    ctx.lineTo(obstacle.x + obstacle.width * 0.4, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.2);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.5);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height);
    ctx.closePath();
    ctx.stroke();
}

// Function to draw canyons - made to look like a real canyon
function drawCanyons(obstacle) {
    const gapWidth = canvas.width * 0.4; // 40% szerokości ekranu na przejście
    const wallWidth = (canvas.width - gapWidth) / 2;
    
    // Canyon walls
    ctx.fillStyle = obstacle.color || "#8B4513";
    
    // Left wall
    ctx.beginPath();
    ctx.moveTo(0, obstacle.y);
    ctx.lineTo(wallWidth, obstacle.y);
    ctx.lineTo(wallWidth - 50, obstacle.y + obstacle.height);
    ctx.lineTo(0, obstacle.y + obstacle.height);
    ctx.closePath();
    ctx.fill();
    
    // Right wall
    ctx.beginPath();
    ctx.moveTo(canvas.width - wallWidth, obstacle.y);
    ctx.lineTo(canvas.width, obstacle.y);
    ctx.lineTo(canvas.width, obstacle.y + obstacle.height);
    ctx.lineTo(canvas.width - wallWidth + 50, obstacle.y + obstacle.height);
    ctx.closePath();
    ctx.fill();
    
    // Add details to walls
    const gradient = ctx.createLinearGradient(0, obstacle.y, 0, obstacle.y + obstacle.height);
    gradient.addColorStop(0, "#A0522D");
    gradient.addColorStop(0.5, "#8B4513");
    gradient.addColorStop(1, "#654321");
    
    // Add texture to walls
    ctx.fillStyle = gradient;
    for (let i = 0; i < 5; i++) {
        // Left wall details
        ctx.beginPath();
        ctx.moveTo(Math.random() * wallWidth * 0.8, obstacle.y + obstacle.height * (i/5));
        ctx.lineTo(wallWidth * (0.7 + Math.random() * 0.3), obstacle.y + obstacle.height * (i/5));
        ctx.lineTo(wallWidth * (0.6 + Math.random() * 0.3), obstacle.y + obstacle.height * ((i+1)/5));
        ctx.closePath();
        ctx.fill();
        
        // Right wall details
        ctx.beginPath();
        ctx.moveTo(canvas.width - wallWidth + Math.random() * wallWidth * 0.2, obstacle.y + obstacle.height * (i/5));
        ctx.lineTo(canvas.width - wallWidth * (0.7 + Math.random() * 0.3), obstacle.y + obstacle.height * (i/5));
        ctx.lineTo(canvas.width - wallWidth * (0.6 + Math.random() * 0.3), obstacle.y + obstacle.height * ((i+1)/5));
        ctx.closePath();
        ctx.fill();
    }
}

// Function to draw transmission towers
function drawTransmissionTowers(obstacle) {
    ctx.fillStyle = obstacle.color || "#4682B4";
    ctx.fillRect(obstacle.x + obstacle.width * 0.4, obstacle.y, obstacle.width * 0.2, obstacle.height);
    ctx.fillStyle = "rgba(70, 130, 180, 0.5)";
    ctx.fillRect(obstacle.x + obstacle.width * 0.45, obstacle.y + obstacle.height * 0.2, obstacle.width * 0.1, obstacle.height * 0.8);
    ctx.strokeStyle = "#4169E1";
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x + obstacle.width * 0.4, obstacle.y, obstacle.width * 0.2, obstacle.height);
    // Dodaj szczegóły, takie jak anteny
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.5, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y - obstacle.height * 0.2);
    ctx.moveTo(obstacle.x + obstacle.width * 0.45, obstacle.y - obstacle.height * 0.1);
    ctx.lineTo(obstacle.x + obstacle.width * 0.55, obstacle.y - obstacle.height * 0.1);
    ctx.stroke();
}

// Function to draw energy barriers
function drawEnergyBarriers(obstacle) {
    ctx.strokeStyle = obstacle.color || "#00FF00";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width * 0.1, obstacle.y + obstacle.height * 0.1);
    ctx.lineTo(obstacle.x + obstacle.width * 0.9, obstacle.y + obstacle.height * 0.9);
    ctx.stroke();
}

// Zmodyfikowana funkcja generowania przeszkód
function generateObstacle() {
    const minSize = 80 * screenScale;
    const maxSize = 200 * screenScale;
    let width = minSize + Math.random() * (maxSize - minSize);
    let height = minSize + Math.random() * (maxSize - minSize);
    
    // Wybierz typ przeszkody z dostępnych dla aktualnego biomu
    const type = currentBiome.obstacles[Math.floor(Math.random() * currentBiome.obstacles.length)];
    
    // Pozycja przeszkody
    let x, y;
    
    // Special handling for canyons
    if (type === 'canyons') {
        width = canvas.width; // Full screen width
        x = 0; // Start from left edge
    } else {
        // Normal obstacle positioning
        x = Math.random() * (canvas.width - width);
    }
    y = -height;

    // Dostosuj wymiary w zależności od typu przeszkody
    switch(type) {
        case 'transmissionTowers':
            width *= 0.5;
            height *= 1.5;
            break;
        case 'energyBarriers':
            width *= 1.2;
            height *= 0.3;
            break;
        case 'spaceshipWreck':
            width *= 1.3;
            break;
    }

    obstacles.push({ 
        x, 
        y, 
        width,
        height,
        speed: gameSpeed,
        type,
        color: getObstacleColor(type),
        hitbox: {
            x,
            y,
            width,
            height
        }
    });
}

// Funkcja zwracająca kolor dla danego typu przeszkody
function getObstacleColor(type) {
    switch(type) {
        case 'buildingRuins':
            return '#8B4513';
        case 'spaceshipWreck':
            return '#A9A9A9';
        case 'rocks':
            return '#808080';
        case 'canyons':
            return '#A0522D';
        case 'transmissionTowers':
            return '#4682B4';
        case 'energyBarriers':
            return '#00FF00';
        default:
            return '#FFFFFF';
    }
}

// Funkcja do aktualizacji przeszkód
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed * deltaTime;
        
        // Aktualizacja prędkości przeszkód na aktualną prędkość gry
        obstacles[i].speed = gameSpeed;
        
        // Usuwamy przeszkody, które wyszły poza ekran
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    // Zwiększenie trudności - częstość generowania przeszkód wzrasta z czasem
    const obstacleChance = 0.02 * (1 + distance / 2000); // Zmniejszona częstość generowania przeszkód
    if (Math.random() < obstacleChance * deltaTime * 60) { // Dostosowane do deltaTime
        generateObstacle();
    }
}

// Funkcja do rysowania statku
function drawShip() {
    // Zapisz aktualny stan kontekstu
    ctx.save();
    ctx.translate(shipX, shipY);
    
    // Skalowanie dla lepszego efektu
    const scale = 1.2; // Dodatkowe skalowanie dla wszystkich elementów
    ctx.scale(scale, scale);
    
    // Główny korpus statku
    ctx.fillStyle = "#304878";
    ctx.beginPath();
    ctx.moveTo(0, -shipHeight/2);
    ctx.lineTo(-shipWidth/2, shipHeight/3);
    ctx.lineTo(-shipWidth/4, shipHeight/2);
    ctx.lineTo(shipWidth/4, shipHeight/2);
    ctx.lineTo(shipWidth/2, shipHeight/3);
    ctx.closePath();
    ctx.fill();

    // Detale korpusu - paski
    ctx.strokeStyle = "#4080ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-shipWidth/3, 0);
    ctx.lineTo(shipWidth/3, 0);
    ctx.stroke();

    // Skrzydła
    ctx.fillStyle = "#4080ff";
    ctx.beginPath();
    ctx.moveTo(-shipWidth/2, shipHeight/3);
    ctx.lineTo(-shipWidth * 0.7, shipHeight/4);
    ctx.lineTo(-shipWidth/2, 0);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(shipWidth/2, shipHeight/3);
    ctx.lineTo(shipWidth * 0.7, shipHeight/4);
    ctx.lineTo(shipWidth/2, 0);
    ctx.fill();

    // Kokpit
    const gradient = ctx.createRadialGradient(0, -shipHeight/4, 2, 0, -shipHeight/4, shipWidth/4);
    gradient.addColorStop(0, "#80ffff");
    gradient.addColorStop(1, "#40a0ff");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, -shipHeight/4, shipWidth/4, shipHeight/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Efekt silnika
    const engineGlow = ctx.createRadialGradient(0, shipHeight/2, 0, 0, shipHeight/2, shipWidth/4);
    engineGlow.addColorStop(0, "#ff8060");
    engineGlow.addColorStop(0.5, "#ff4020");
    engineGlow.addColorStop(1, "transparent");
    
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(0, shipHeight/2, shipWidth/4, 0, Math.PI * 2);
    ctx.fill();

    // Efekt płomienia silnika
    ctx.fillStyle = "#ff6040";
    ctx.beginPath();
    ctx.moveTo(-shipWidth/4, shipHeight/2);
    ctx.quadraticCurveTo(0, shipHeight/2 + 20 + Math.random() * 10, shipWidth/4, shipHeight/2);
    ctx.fill();

    // Przywróć poprzedni stan kontekstu
    ctx.restore();
}

// Funkcja do rysowania przeszkód
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        switch (obstacle.type) {
            case 'buildingRuins':
                drawBuildingRuins(obstacle);
                break;
            case 'spaceshipWreck':
                drawSpaceshipWreck(obstacle);
                break;
            case 'rocks':
                drawRocks(obstacle);
                break;
            case 'canyons':
                drawCanyons(obstacle);
                break;
            case 'transmissionTowers':
                drawTransmissionTowers(obstacle);
                break;
            case 'energyBarriers':
                drawEnergyBarriers(obstacle);
                break;
        }
    }
}

// Update drawBackground function to use images
function drawBackground() {
    // Try to draw the background image first
    const backgroundImage = backgrounds[currentBiome.background];
    if (backgroundImage && backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback to gradient if image is not available
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, currentBiome.backgroundColor);
        gradient.addColorStop(1, "#000000");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Add stars in the sky (common for all biomes)
    drawStars();
}

// Helper functions for background details
function drawStars() {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = (Math.random() * canvas.height) % canvas.height;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDunes() {
    ctx.fillStyle = currentBiome.backgroundDetails.color;
    for (let i = 0; i < currentBiome.backgroundDetails.count; i++) {
        const y = canvas.height * (0.3 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.lineTo(x, y - Math.sin(x / 200 + i) * 20);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();
    }
}

function drawMountainPeaks() {
    ctx.fillStyle = currentBiome.backgroundDetails.color;
    for (let i = 0; i < currentBiome.backgroundDetails.count; i++) {
        const baseY = canvas.height * (0.4 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(-100, canvas.height);
        ctx.lineTo(canvas.width * (0.2 + i * 0.1), baseY);
        ctx.lineTo(canvas.width * (0.5 + i * 0.1), baseY - 100);
        ctx.lineTo(canvas.width * (0.8 + i * 0.1), baseY);
        ctx.lineTo(canvas.width + 100, canvas.height);
        ctx.fill();
    }
}

function drawRuinedBuildings() {
    ctx.fillStyle = currentBiome.backgroundDetails.color;
    for (let i = 0; i < currentBiome.backgroundDetails.count; i++) {
        const x = canvas.width * (0.2 + i * 0.2);
        const height = canvas.height * (0.2 + Math.random() * 0.3);
        ctx.fillRect(x, canvas.height - height, 60, height);
        // Add some windows
        ctx.fillStyle = "#000000";
        for (let y = canvas.height - height + 20; y < canvas.height; y += 30) {
            ctx.fillRect(x + 10, y, 10, 20);
            ctx.fillRect(x + 40, y, 10, 20);
        }
    }
}

function drawTechGrid() {
    ctx.strokeStyle = currentBiome.backgroundDetails.color;
    ctx.lineWidth = 1;
    // Draw vertical lines
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    // Draw horizontal lines
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// Zmodyfikuj drawUI
function drawUI() {
    const fontSize = Math.max(16, Math.floor(20 * screenScale));
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.fillText(`Dystans: ${Math.floor(distance)} km`, 20 * screenScale, 30 * screenScale);
    ctx.fillText(`Prędkość: ${gameSpeed.toFixed(1)}`, 20 * screenScale, 60 * screenScale);
}

// Funkcja do rysowania statku kosmicznego (stara, używamy teraz drawShip)
function drawSpaceship(x, y) {
    ctx.fillStyle = "#ff0"; // Kolor statku
    ctx.fillRect(x - shipWidth / 2, y - shipHeight / 2, shipWidth, shipHeight); // Rysowanie prostokąta jako statku
}

// Zmodyfikuj showLevelUpMessage
function showLevelUpMessage() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const largeFontSize = Math.max(24, Math.floor(48 * screenScale));
    const mediumFontSize = Math.max(20, Math.floor(32 * screenScale));
    
    ctx.fillStyle = "#ffffff";
    ctx.font = `${largeFontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`Poziom ${level}`, canvas.width / 2, canvas.height / 2 - 30 * screenScale);
    ctx.font = `${mediumFontSize}px Arial`;
    ctx.fillText(currentBiome.name, canvas.width / 2, canvas.height / 2 + 30 * screenScale);
}

// Funkcja do przejścia na nowy poziom
function nextLevel() {
    gameActive = false;
    level++;
    
    // Zmień biom w zależności od poziomu
    switch(level % 4) {
        case 1:
            currentBiome = BIOMES.DESERT;
            break;
        case 2:
            currentBiome = BIOMES.MOUNTAINS;
            break;
        case 3:
            currentBiome = BIOMES.CITY;
            break;
        case 0:
            currentBiome = BIOMES.RUINS;
            break;
    }
    
    // Zwiększamy prędkość tylko przy zmianie poziomu
    gameSpeed = baseSpeed + (level - 1) * speedIncreasePerLevel;
    
    showLevelUpMessage();
    
    setTimeout(() => {
        obstacles = [];
        gameActive = true;
        requestAnimationFrame(gameLoop);
    }, 2000);
}

// Główna pętla gry - z obsługą czasu
function gameLoop(currentTime) {
    if (!gameActive) return;
    
    // Obliczanie deltaTime (sekund od ostatniej klatki)
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    deltaTime = (currentTime - lastTime) / 1000; // Konwersja na sekundy
    lastTime = currentTime;
    
    // Ograniczenie deltaTime dla przypadków gdy karta jest nieaktywna
    if (deltaTime > 0.1) deltaTime = 0.1;
    
    // Czyszczenie ekranu
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rysowanie elementów gry
    drawBackground();
    updateShipPosition();
    drawShip();
    updateObstacles();
    drawObstacles();
    // drawHitboxes(); // Odkomentuj tę linię, aby zobaczyć hitboxy
    drawUI();
    
    // Zmniejsz mnożnik dystansu znacznie bardziej
    distance += (gameSpeed * deltaTime) * 0.1; // Zmniejszono mnożnik z 0.5 na 0.1
    
    // Sprawdzamy kolizje
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Dostosuj warunek zmiany poziomu do nowej skali punktacji
    if (distance >= level * 1000) { // Zmniejszono z 2000 na 1000 dla balansu
        nextLevel();
        return;
    }
    
    // Kontynuujemy pętlę gry
    requestAnimationFrame(gameLoop);
}

// Funkcja pomocnicza do debugowania - rysowanie hitboxów
function drawHitboxes() {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    
    // Hitbox statku
    const shipHitbox = {
        x: shipX - shipWidth * 0.3,
        y: shipY - shipHeight * 0.3,
        width: shipWidth * 0.6,
        height: shipHeight * 0.6
    };
    
    ctx.strokeRect(
        shipHitbox.x,
        shipHitbox.y,
        shipHitbox.width,
        shipHitbox.height
    );
    
    // Hitboxy przeszkód
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'canyons') {
            // Rysuj hitboxy ścian kanionu
            ctx.strokeRect(
                obstacle.x,
                obstacle.y,
                obstacle.width * 0.3,
                obstacle.height
            );
            ctx.strokeRect(
                obstacle.x + obstacle.width * 0.7,
                obstacle.y,
                obstacle.width * 0.3,
                obstacle.height
            );
        } else {
            ctx.strokeRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );
        }
    });
}

// Funkcja do rozpoczęcia gry
function startGame() {
    // Resetowanie zmiennych gry
    obstacles = [];
    distance = 0;
    shipX = canvas.width / 2;
    targetX = shipX;
    gameSpeed = baseSpeed;
    lastTime = 0;
    gameActive = true;
    level = 1;
    
    // Uruchom pętlę gry
    requestAnimationFrame(gameLoop);
}

// Funkcja gameOver
async function gameOver() {
    gameActive = false;
    const finalScore = distance.toFixed(0);
    
    // Rysujemy ostatnią scenę z "Game Over"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff0000";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 50);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Arial";
    ctx.fillText(`Dystans: ${finalScore} km`, canvas.width/2, canvas.height/2 + 10);
    
    // Opóźnij pokazanie komunikatu, aby gracz zobaczył ostatnią scenę
    setTimeout(async () => {
        const playerName = prompt('Podaj swoje imię:', 'Pilot');
        if (playerName) {
            try {
                await saveHighScore(playerName, parseFloat(finalScore));
                console.log('Score saved successfully');
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }
        
        // Pokaż menu główne
        document.getElementById('menu').style.display = 'block';
        canvas.style.display = 'none';
    }, 2000);
}

// Eksport funkcji
export { drawBackground, drawSpaceship, startGame };