import { ctx, canvas } from './ui.js';
import { saveHighScore } from './firebase.js';

// Ustawienia gry
let shipX = window.innerWidth / 2;
const shipY = window.innerHeight * 0.8; // Stała wysokość statku (zawsze na dole)
let shipWidth = 50;
let shipHeight = 30;
let baseSpeed = 5; // Prędkość bazowa
let gameSpeed = baseSpeed; // Aktualna prędkość gry
let speedIncreaseFactor = 1.0005; // Współczynnik przyspieszenia (z każdą klatką)
let distance = 0;
let gameActive = false;
let lastTime = 0;
let deltaTime = 0;
let targetX = shipX; // Cel dla płynnego ruchu

// Ustawienia terenu
let currentTerrain = 0; // 0 - pustynia, 1 - góry, 2 - ruiny
let terrainTransition = 0; // Wartość od 0 do 1 dla płynnego przejścia
let terrainChangeDistance = 1000; // Zmiana terenu co ile jednostek dystansu
let terrainColors = [
    { ground: "#d2b48c", sky: "#87CEEB" }, // Pustynia
    { ground: "#696969", sky: "#4a5c69" },  // Góry
    { ground: "#555555", sky: "#2f4f4f" }   // Ruiny
];

// Typy przeszkód
const OBSTACLE_TYPES = {
    RUIN: 0,
    SHIPWRECK: 1,
    ROCK: 2,
    CANYON: 3,
    TOWER: 4,
    ENERGY_BARRIER: 5
};

// Ustawienia żyroskopu
let gyroActive = false;
let gyroSensitivity = 2; // Czułość żyroskopu

// Tablica przeszkód
let obstacles = [];

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
function updateShipPosition() {
    // Aktualizacja targetX na podstawie klawiszy (jeśli żyroskop nie jest aktywny)
    if (!gyroActive) {
        const moveSpeed = 8; // Prędkość ruchu statku
        if (keysPressed.left) targetX -= moveSpeed * deltaTime;
        if (keysPressed.right) targetX += moveSpeed * deltaTime;
    }
    
    // Ograniczenie targetX do granic ekranu
    targetX = Math.max(shipWidth/2, Math.min(canvas.width - shipWidth/2, targetX));
    
    // Płynny ruch w kierunku celu
    const easing = 0.1;
    shipX += (targetX - shipX) * easing;
}

// Funkcja do rysowania gwiazd
function drawStars() {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 100; i++) {
        const x = ((distance * 0.1) + i * 150) % canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Funkcja do rysowania szczegółów terenu
function drawTerrainDetails(terrainType, transition, nextTerrain) {
    // Elementy dla pustyni
    if (terrainType === 0 || (transition > 0 && nextTerrain === 0)) {
        const opacity = terrainType === 0 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Piaszczyste wydmy
        ctx.fillStyle = "#e6c995";
        for (let i = 0; i < 5; i++) {
            const x = ((distance * 0.2) + i * 300) % canvas.width;
            const height = 20 + Math.random() * 30;
            const width = 150 + Math.random() * 100;
            
            ctx.beginPath();
            ctx.ellipse(
                x, 
                canvas.height * 0.7 - height / 2, 
                width, 
                height, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    // Elementy dla gór
    if (terrainType === 1 || (transition > 0 && nextTerrain === 1)) {
        const opacity = terrainType === 1 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Góry w tle
        ctx.fillStyle = "#505050";
        for (let i = 0; i < 3; i++) {
            const baseX = ((distance * 0.1) + i * 500) % canvas.width;
            const height = 100 + Math.random() * 150;
            
            ctx.beginPath();
            ctx.moveTo(baseX - 200, canvas.height * 0.7);
            ctx.lineTo(baseX, canvas.height * 0.7 - height);
            ctx.lineTo(baseX + 200, canvas.height * 0.7);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    // Elementy dla ruin miasta
    if (terrainType === 2 || (transition > 0 && nextTerrain === 2)) {
        const opacity = terrainType === 2 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Ruiny budynków
        ctx.fillStyle = "#707070";
        for (let i = 0; i < 8; i++) {
            const x = ((distance * 0.3) + i * 200) % canvas.width;
            const height = 30 + Math.random() * 70;
            const width = 40 + Math.random() * 30;
            
            // Zniszczony budynek
            ctx.fillRect(x, canvas.height * 0.7 - height, width, height);
            
            // Okna w budynku
            ctx.fillStyle = "#404040";
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 2; k++) {
                    if (Math.random() > 0.3) { // Niektóre okna są zniszczone
                        ctx.fillRect(
                            x + 5 + k * (width / 2 - 5), 
                            canvas.height * 0.7 - height + 10 + j * 20, 
                            width / 4, 
                            10
                        );
                    }
                }
            }
            
            ctx.fillStyle = "#707070";
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// Funkcja do interpolacji kolorów
function interpolateColor(color1, color2, factor) {
    // Konwersja z formatu hex lub nazwy na RGB
    function hexToRgb(hex) {
        if (hex.startsWith('#')) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return { r, g, b };
        } else {
            // Dla prostoty obsługujemy tylko kilka podstawowych kolorów
            const tempCanvas = document.createElement('canvas');
            const context = tempCanvas.getContext('2d');
            context.fillStyle = hex;
            const rgb = context.fillStyle;
            const r = parseInt(rgb.substring(1, 3), 16);
            const g = parseInt(rgb.substring(3, 5), 16);
            const b = parseInt(rgb.substring(5, 7), 16);
            return { r, g, b };
        }
    }
    
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Funkcja do przyciemniania koloru
function darkenColor(color, factor) {
    function hexToRgb(hex) {
        if (hex.startsWith('#')) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return { r, g, b };
        } else {
            const tempCanvas = document.createElement('canvas');
            const context = tempCanvas.getContext('2d');
            context.fillStyle = hex;
            const rgb = context.fillStyle;
            const r = parseInt(rgb.substring(1, 3), 16);
            const g = parseInt(rgb.substring(3, 5), 16);
            const b = parseInt(rgb.substring(5, 7), 16);
            return { r, g, b };
        }
    }
    
    const c = hexToRgb(color);
    
    const r = Math.round(c.r * factor);
    const g = Math.round(c.g * factor);
    const b = Math.round(c.b * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Funkcja do rysowania tła
function drawBackground() {
    // Sprawdź, czy potrzebna jest zmiana terenu
    let newTerrain = Math.floor(distance / terrainChangeDistance) % terrainColors.length;
    
    // Rozpocznij przejście, jeśli teren się zmienia
    if (newTerrain !== currentTerrain && terrainTransition === 0) {
        terrainTransition = 0.01; // Rozpocznij przejście
    }
    
    // Aktualizacja przejścia terenu
    if (terrainTransition > 0 && terrainTransition < 1) {
        terrainTransition += 0.005 * deltaTime * 60; // Płynne przejście
        if (terrainTransition >= 1) {
            terrainTransition = 0;
            currentTerrain = newTerrain;
        }
    }
    
    // Kolory obecnego terenu
    let currentColors = terrainColors[currentTerrain];
    
    // Kolory następnego terenu (jeśli w trakcie przejścia)
    let nextColors = terrainColors[newTerrain];
    
    // Oblicz aktualne kolory z uwzględnieniem przejścia
    let skyColor, groundColor;
    
    if (terrainTransition > 0) {
        // Interpolacja kolorów
        skyColor = interpolateColor(currentColors.sky, nextColors.sky, terrainTransition);
        groundColor = interpolateColor(currentColors.ground, nextColors.ground, terrainTransition);
    } else {
        skyColor = currentColors.sky;
        groundColor = currentColors.ground;
    }
    
    // Rysuj niebo
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
    skyGradient.addColorStop(0, skyColor);
    skyGradient.addColorStop(1, "#000033");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    
    // Rysuj ziemię/teren
    const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
    groundGradient.addColorStop(0, groundColor);
    groundGradient.addColorStop(1, darkenColor(groundColor, 0.5));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    
    // Dodaj elementy terenu w zależności od obecnego terenu
    drawTerrainDetails(currentTerrain, terrainTransition, newTerrain);
    
    // Gwiazdy na niebie (dla wszystkich terenów)
    drawStars();
}

// Funkcja do detekcji kolizji
function checkCollision() {
    const shipHitboxWidth = shipWidth * 0.8;
    const shipHitboxHeight = shipHeight * 0.8;
    
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        // Specjalna obsługa kanionów - kolizja tylko z bokami
        if (obstacle.type === OBSTACLE_TYPES.CANYON) {
            const passageCenter = obstacle.x + obstacle.width / 2;
            const leftWallRight = passageCenter - obstacle.passageWidth / 2;
            const rightWallLeft = passageCenter + obstacle.passageWidth / 2;
            
            // Sprawdź kolizję z lewą ścianą
            if (shipX - shipHitboxWidth / 2 < leftWallRight && 
                shipY + shipHitboxHeight / 2 > obstacle.y &&
                shipY - shipHitboxHeight / 2 < obstacle.y + obstacle.height) {
                return true;
            }
            
            // Sprawdź kolizję z prawą ścianą
            if (shipX + shipHitboxWidth / 2 > rightWallLeft &&
                shipY + shipHitboxHeight / 2 > obstacle.y &&
                shipY - shipHitboxHeight / 2 < obstacle.y + obstacle.height) {
                return true;
            }
        } 
        // Specjalna obsługa barier energetycznych - większy obszar kolizji
        else if (obstacle.type === OBSTACLE_TYPES.ENERGY_BARRIER) {
            const expandedHeight = obstacle.height * 1.5; // Większy obszar kolizji dla barier
            
            if (shipX + shipHitboxWidth / 2 > obstacle.x &&
                shipX - shipHitboxWidth / 2 < obstacle.x + obstacle.width &&
                shipY + shipHitboxHeight / 2 > obstacle.y - expandedHeight / 2 &&
                shipY - shipHitboxHeight / 2 < obstacle.y + obstacle.height + expandedHeight / 2) {
                return true;
            }
        }
        // Normalna kolizja dla pozostałych obiektów
        else {
            if (shipX + shipHitboxWidth / 2 > obstacle.x &&
                shipX - shipHitboxWidth / 2 < obstacle.x + obstacle.width &&
                shipY + shipHitboxHeight / 2 > obstacle.y &&
                shipY - shipHitboxHeight / 2 < obstacle.y + obstacle.height) {
                return true;
            }
        }
    }
    
    return false;
}

// Funkcja do generowania przeszkód
function generateObstacle() {
    // Losowy typ przeszkody - bardziej zaawansowane przeszkody są częstsze przy większym dystansie
    let typeChances;
    
    if (distance < 1000) {
        // Początkowe fazy - głównie proste przeszkody
        typeChances = [0.2, 0.2, 0.4, 0, 0.1, 0.1];
    } else if (distance < 3000) {
        // Średni postęp - więcej różnorodności
        typeChances = [0.2, 0.2, 0.2, 0.1, 0.2, 0.1];
    } else {
        // Zaawansowana gra - wszystkie typy przeszkód
        typeChances = [0.2, 0.2, 0.1, 0.2, 0.1, 0.2];
    }
    
    // Losowanie typu przeszkody na podstawie prawdopodobieństwa
    const rand = Math.random();
    let cumulativeChance = 0;
    let obstacleType = 0;
    
    for (let i = 0; i < typeChances.length; i++) {
        cumulativeChance += typeChances[i];
        if (rand < cumulativeChance) {
            obstacleType = i;
            break;
        }
    }
    
    // Podstawowe parametry przeszkody
    let width, height, x, y, speed;
    
    // Dostosowanie parametrów w zależności od typu przeszkody
    switch (obstacleType) {
        case OBSTACLE_TYPES.RUIN:
            // Ruiny budynków
            width = 60 + Math.random() * 50;
            height = 80 + Math.random() * 60;
            break;
            
        case OBSTACLE_TYPES.SHIPWRECK:
            // Wraki statków
            width = 80 + Math.random() * 70;
            height = 40 + Math.random() * 30;
            break;
            
        case OBSTACLE_TYPES.ROCK:
            // Skały
            width = 40 + Math.random() * 40;
            height = width * (0.8 + Math.random() * 0.4); // Mniej więcej proporcjonalne
            break;
            
        case OBSTACLE_TYPES.CANYON:
            // Kaniony - szersze przeszkody z przejściem w środku
            width = canvas.width * 0.7;
            height = 40 + Math.random() * 20;
            break;
            
        case OBSTACLE_TYPES.TOWER:
            // Wieże transmisyjne - wysokie i wąskie
            width = 20 + Math.random() * 20;
            height = 100 + Math.random() * 80;
            break;
            
        case OBSTACLE_TYPES.ENERGY_BARRIER:
            // Bariery energetyczne - szerokie, ale cienkie
            width = 150 + Math.random() * 150;
            height = 10 + Math.random() * 10;
            break;
    }
    
    // Pozycja przeszkody
    if (obstacleType === OBSTACLE_TYPES.CANYON) {
        // Kanionu musi być wyśrodkowany
        x = (canvas.width - width) / 2;
    } else {
        x = Math.random() * (canvas.width - width);
    }
    
    y = -height; // Startuje nad ekranem
    
    // Prędkość - zależna od trudności i typu (niektóre przeszkody poruszają się szybciej)
    const baseObstacleSpeed = gameSpeed * (0.8 + Math.random() * 0.4);
    speed = baseObstacleSpeed * (obstacleType === OBSTACLE_TYPES.ENERGY_BARRIER ? 1.2 : 1.0);
    
    // Dodajemy przeszkodę do tablicy
    obstacles.push({
        type: obstacleType,
        x, 
        y, 
        width, 
        height, 
        speed,
        passageWidth: obstacleType === OBSTACLE_TYPES.CANYON ? 120 : 0, // Szerokość przejścia dla kanionu
        rotation: obstacleType === OBSTACLE_TYPES.SHIPWRECK ? Math.random() * 0.5 - 0.25 : 0, // Lekki obrót dla wraków
        glowIntensity: obstacleType === OBSTACLE_TYPES.ENERGY_BARRIER ? 0 : null, // Intensywność świecenia dla barier
        glowDirection: 1 // Kierunek pulsowania
    });
}

// Funkcja do aktualizacji przeszkód
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        // Aktualizacja pozycji
        obstacle.y += obstacle.speed * deltaTime;
        
        // Specjalne efekty dla poszczególnych przeszkód
        if (obstacle.type === OBSTACLE_TYPES.ENERGY_BARRIER) {
            // Pulsowanie barier energetycznych
            if (obstacle.glowIntensity === null) obstacle.glowIntensity = 0.5;
            
            obstacle.glowIntensity += 0.02 * obstacle.glowDirection * deltaTime * 60;
            
            if (obstacle.glowIntensity > 1) {
                obstacle.glowIntensity = 1;
                obstacle.glowDirection = -1;
            } else if (obstacle.glowIntensity < 0.5) {
                obstacle.glowIntensity = 0.5;
                obstacle.glowDirection = 1;
            }
        }
        
        // Usuwamy przeszkody, które wyszły poza ekran
        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    // Zwiększenie trudności - częstość generowania przeszkód wzrasta z czasem
    // Base chance calibrated for 60 fps, adjusted for actual frame rate using deltaTime
    const obstacleChance = 0.02 * (1 + distance / 1000) * deltaTime * 60;
    if (Math.random() < obstacleChance) {
        generateObstacle();
    }
}

// Funkcje do rysowania poszczególnych typów przeszkód
function drawRuin(obstacle) {
    // Ruina budynku
    ctx.fillStyle = "#8B8682";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Okna w budynku
    ctx.fillStyle = "#696969";
    const windowWidth = obstacle.width * 0.2;
    const windowHeight = obstacle.height * 0.1;
    const windowSpacing = obstacle.height * 0.15;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            if (Math.random() > 0.3) { // Niektóre okna są zniszczone
                ctx.fillRect(
                    obstacle.x + (col + 0.5) * (obstacle.width / 3) - windowWidth / 2,
                    obstacle.y + windowSpacing + row * windowSpacing,
                    windowWidth,
                    windowHeight
                );
            }
        }
    }
    
    // Pochylenie budynku
    ctx.fillStyle = "#A9A9A9";
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y);
    ctx.lineTo(obstacle.x - obstacle.width * 0.2, obstacle.y - obstacle.height * 0.25);
    ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y - obstacle.height * 0.25);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
    ctx.closePath();
    ctx.fill();
}

function drawShipwreck(obstacle) {
    // Zapisz stan kontekstu
    ctx.save();
    
    // Przesuń i obróć kontekst
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation);
    
    // Korpus statku
    ctx.fillStyle = "#505050";
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Górna część - wieżyczka
    ctx.fillStyle = "#606060";
    ctx.beginPath();
    ctx.ellipse(obstacle.width * 0.1, 0, obstacle.width * 0.2, obstacle.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Uszkodzenia statku - dziury
    ctx.fillStyle = "#303030";
    for (let i = 0; i < 5; i++) {
        const holeX = (Math.random() - 0.5) * obstacle.width * 0.7;
        const holeY = (Math.random() - 0.5) * obstacle.height * 0.7;
        const holeSize = Math.random() * obstacle.width * 0.15 + obstacle.width * 0.05;
        
        ctx.beginPath();
        ctx.arc(holeX, holeY, holeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Przywróć stan kontekstu
    ctx.restore();
}

function drawRock(obstacle) {
    // Podstawowy kształt skały
    ctx.fillStyle = "#696969";
    ctx.beginPath();
    ctx.ellipse(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.width / 2,
        obstacle.height / 2,
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Dodajemy teksturę - jaśniejsze fragmenty
    ctx.fillStyle = "#909090";
    for (let i = 0; i < 3; i++) {
        const spotX = obstacle.x + obstacle.width * (0.3 + Math.random() * 0.4);
        const spotY = obstacle.y + obstacle.height * (0.3 + Math.random() * 0.4);
        const spotSize = Math.min(obstacle.width, obstacle.height) * (0.1 + Math.random() * 0.15);
        
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dodajemy teksturę - ciemniejsze fragmenty
    ctx.fillStyle = "#404040";
    for (let i = 0; i < 5; i++) {
        const spotX = obstacle.x + obstacle.width * Math.random();
        const spotY = obstacle.y + obstacle.height * Math.random();
        const spotSize = Math.min(obstacle.width, obstacle.height) * (0.05 + Math.random() * 0.1);
        
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCanyon(obstacle) {
    const passageCenter = obstacle.x + obstacle.width / 2;
    const leftWallRight = passageCenter - obstacle.passageWidth / 2;
    const rightWallLeft = passageCenter + obstacle.passageWidth / 2;
    
    // Lewa ściana kanionu
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(obstacle.x, obstacle.y, leftWallRight - obstacle.x, obstacle.height);
    
    // Prawa ściana kanionu
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(rightWallLeft, obstacle.y, (obstacle.x + obstacle.width) - rightWallLeft, obstacle.height);
    
    // Ciemniejsze części przy krawędziach
    ctx.fillStyle = "#5A2D0C";
    ctx.fillRect(leftWallRight - 10, obstacle.y, 10, obstacle.height);
    ctx.fillRect(rightWallLeft, obstacle.y, 10, obstacle.height);
    
    // Tekstura ścian - linie
    ctx.strokeStyle = "#A0522D";
    ctx.lineWidth = 2;
    
    // Linie na lewej ścianie
    for (let i = 0; i < 5; i++) {
        const lineX = obstacle.x + (leftWallRight - obstacle.x) * Math.random();
        ctx.beginPath();
        ctx.moveTo(lineX, obstacle.y);
        ctx.lineTo(lineX + 10 * Math.random(), obstacle.y + obstacle.height);
        ctx.stroke();
    }
    
    // Linie na prawej ścianie
    for (let i = 0; i < 5; i++) {
        const lineX = rightWallLeft + ((obstacle.x + obstacle.width) - rightWallLeft) * Math.random();
        ctx.beginPath();
        ctx.moveTo(lineX, obstacle.y);
        ctx.lineTo(lineX - 10 * Math.random(), obstacle.y + obstacle.height);
        ctx.stroke();
    }
}

function drawTower(obstacle) {
    // Główna struktura wieży
    ctx.fillStyle = "#708090";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Elementy konstrukcyjne wieży
    ctx.strokeStyle = "#A9A9A9";
    ctx.lineWidth = 3;
    
    // Poziome elementy
    for (let i = 1; i < 6; i++) {
        const y = obstacle.y + (obstacle.height / 6) * i;
        ctx.beginPath();
        ctx.moveTo(obstacle.x - 5, y);
        ctx.lineTo(obstacle.x + obstacle.width + 5, y);
        ctx.stroke();
    }
    
    // Przekątne elementy
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y);
}