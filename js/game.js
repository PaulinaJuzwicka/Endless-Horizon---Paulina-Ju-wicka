// Ulepszony plik game.js
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

// Funkcja do detekcji kolizji
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        if (
            shipX + shipWidth / 2 > obstacle.x &&
            shipX - shipWidth / 2 < obstacle.x + obstacle.width &&
            shipY + shipHeight / 2 > obstacle.y &&
            shipY - shipHeight / 2 < obstacle.y + obstacle.height
        ) {
            return true;
        }
    }
    return false;
}

// Funkcja do generowania przeszkód
function generateObstacle() {
    // Różne wielkości przeszkód
    const minSize = 30;
    const maxSize = 80;
    const width = minSize + Math.random() * (maxSize - minSize);
    const height = minSize + Math.random() * (maxSize - minSize);
    
    // Pozycja przeszkody
    const x = Math.random() * (canvas.width - width);
    const y = -height; // Startuje nad ekranem
    
    // Losowa prędkość w zakresie od 80% do 120% aktualnej prędkości gry
    const obstacleSpeed = gameSpeed * (0.8 + Math.random() * 0.4);
    
    obstacles.push({ 
        x, 
        y, 
        width, 
        height, 
        speed: obstacleSpeed,
        color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})` 
    });
}

// Funkcja do aktualizacji przeszkód
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed * deltaTime;
        
        // Usuwamy przeszkody, które wyszły poza ekran
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    // Zwiększenie trudności - częstość generowania przeszkód wzrasta z czasem
    const obstacleChance = 0.02 * (1 + distance / 1000);
    if (Math.random() < obstacleChance * deltaTime * 60) { // Dostosowane do deltaTime
        generateObstacle();
    }
}

// Funkcja do rysowania statku
function drawShip() {
    // Korpus statku
    ctx.fillStyle = "#4080ff";
    ctx.beginPath();
    ctx.moveTo(shipX, shipY - shipHeight / 2);
    ctx.lineTo(shipX - shipWidth / 2, shipY + shipHeight / 2);
    ctx.lineTo(shipX + shipWidth / 2, shipY + shipHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    // Silnik - efekt płomienia
    ctx.fillStyle = "#ff5500";
    ctx.beginPath();
    ctx.moveTo(shipX - shipWidth / 4, shipY + shipHeight / 2);
    ctx.lineTo(shipX, shipY + shipHeight / 2 + 10 + Math.random() * 5);
    ctx.lineTo(shipX + shipWidth / 4, shipY + shipHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    // Kabina
    ctx.fillStyle = "#80ff80";
    ctx.beginPath();
    ctx.arc(shipX, shipY - shipHeight / 4, shipWidth / 8, 0, Math.PI * 2);
    ctx.fill();
}

// Funkcja do rysowania przeszkód
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        ctx.fillStyle = obstacle.color || "#ff3333";
        
        // Rysujemy meteoryt (przeszkodę)
        ctx.beginPath();
        ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Dodajemy szczegóły do meteorytu
        ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        ctx.beginPath();
        ctx.arc(
            obstacle.x + obstacle.width * 0.3,
            obstacle.y + obstacle.height * 0.3,
            obstacle.width * 0.15,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Funkcja do rysowania tła
function drawBackground() {
    // Gradienterowane tło kosmosu
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000033");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gwiazdy w tle
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

// Funkcja do rysowania interfejsu
function drawUI() {
    // Dystans
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Dystans: ${distance.toFixed(0)} km`, 20, 30);
    
    // Prędkość
    ctx.fillText(`Prędkość: ${gameSpeed.toFixed(1)}`, 20, 60);
}

// Funkcja do rysowania statku kosmicznego (stara, używamy teraz drawShip)
function drawSpaceship(x, y) {
    ctx.fillStyle = "#ff0"; // Kolor statku
    ctx.fillRect(x - shipWidth / 2, y - shipHeight / 2, shipWidth, shipHeight); // Rysowanie prostokąta jako statku
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
    drawUI();
    
    // Zwiększamy trudność z czasem
    gameSpeed *= speedIncreaseFactor;
    
    // Zwiększamy dystans proporcjonalnie do prędkości
    distance += gameSpeed * deltaTime;
    
    // Sprawdzamy kolizje
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Kontynuujemy pętlę gry
    requestAnimationFrame(gameLoop);
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
            await saveHighScore(playerName, parseFloat(finalScore));
        }
        
        // Pokaż menu główne
        document.getElementById('menu').style.display = 'block';
        canvas.style.display = 'none';
    }, 2000);
}

// Eksport funkcji
export { drawBackground, drawSpaceship, startGame };