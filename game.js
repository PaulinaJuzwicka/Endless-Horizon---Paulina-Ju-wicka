// Ustawienia gry
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let shipX = canvas.width / 2;
let shipY = canvas.height / 2;
let shipWidth = 50;
let shipHeight = 30;
let speed = 5;
let distance = 0;

// Ustawienia żyroskopu
let beta = 0;
let gamma = 0;

let obstacles = []; // Tablica przeszkód
let terrains = ['desert', 'mountains', 'ruins']; // Typy terenów
let currentTerrain = 0; // Początkowy teren

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ustawienie żyroskopu
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(event) {
        beta = event.beta;
        gamma = event.gamma;

        shipX = (gamma / 90) * canvas.width / 2 + canvas.width / 2;
    });
} else {
    console.log("DeviceOrientationEvent nie jest wspierane.");
}

// Dodajemy dźwięki
const crashSound = new Audio('crash.mp3');
const engineSound = new Audio('engine.mp3');

// Funkcja do odtwarzania dźwięku
function playEngineSound() {
    if (engineSound.paused) {
        engineSound.play();
    }
}

function playCrashSound() {
    crashSound.play();
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
            playCrashSound();
            return true;
        }
    }
    return false;
}

// Funkcja do rysowania statku
function drawShip() {
    ctx.fillStyle = "#ff0";
    ctx.fillRect(shipX - shipWidth / 2, shipY - shipHeight / 2, shipWidth, shipHeight);
}

// Załadowanie obrazów
const images = {
    background: new Image(),
    spaceship: new Image(),
    ruins: new Image(),
    spaceshipWreck: new Image(),
    rocks: new Image(),
    canyon: new Image(),
    tower: new Image(),
    energyBarrier: new Image()
};

// Ustawianie źródeł obrazów
images.background.src = 'assets/desert.jpg';
images.spaceship.src = 'assets/spaceship.png';
images.ruins.src = 'assets/ruins.png';
images.spaceshipWreck.src = 'assets/spaceship_wreck.png';
images.rocks.src = 'assets/rocks.png';
images.canyon.src = 'assets/canyon.png';
images.tower.src = 'assets/tower.png';
images.energyBarrier.src = 'assets/energy_barrier.png';

// Funkcja do rysowania tła
function drawBackground() {
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
}

// Funkcja do rysowania statku kosmicznego
function drawSpaceship(x, y) {
    ctx.drawImage(images.spaceship, x, y, 50, 50); // 50x50 to przykładowy rozmiar statku
}

// Funkcja do rysowania przeszkód
function drawObstacle(obstacle, x, y) {
    switch (obstacle.type) {
        case 'ruins':
            ctx.drawImage(images.ruins, x, y, 50, 50);
            break;
        case 'spaceshipWreck':
            ctx.drawImage(images.spaceshipWreck, x, y, 50, 50);
            break;
        case 'rocks':
            ctx.drawImage(images.rocks, x, y, 50, 50);
            break;
        case 'canyon':
            ctx.drawImage(images.canyon, x, y, 50, 50);
            break;
        case 'tower':
            ctx.drawImage(images.tower, x, y, 50, 50);
            break;
        case 'energyBarrier':
            ctx.drawImage(images.energyBarrier, x, y, 50, 50);
            break;
    }
}

// Funkcja do rysowania dystansu
function drawDistance() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Distance: " + distance.toFixed(2), 10, 40);
}

// Funkcja do przełączania terenów
function changeTerrain() {
    if (distance > 1000 && currentTerrain === 0) {
        currentTerrain = 1; // Zmieniamy teren na góry
    } else if (distance > 2000 && currentTerrain === 1) {
        currentTerrain = 2; // Zmieniamy teren na ruiny
    }
}

// Modyfikujemy funkcję gameLoop, aby uwzględniała kolizje
function gameLoop() {
    drawBackground();
    drawSpaceship(shipX, shipY);
    drawObstacles();
    drawDistance();

    // Sprawdzamy kolizje
    if (checkCollision()) {
        alert("Game Over! Your Distance: " + distance.toFixed(2));
        return; // Zakończenie gry
    }

    // Zwiększ dystans
    distance += speed * 0.01;

    // Co 2 sekundy generujemy nową przeszkodę
    if (Math.random() < 0.02) {
        generateObstacle();
    }

    changeTerrain();

    requestAnimationFrame(gameLoop);
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGoHBweFO52qkSCtB1Tk4FQtq4F0Pz_Cc",
  authDomain: "endless-horizon-40af4.firebaseapp.com",
  projectId: "endless-horizon-40af4",
  storageBucket: "endless-horizon-40af4.appspot.com",
  messagingSenderId: "834668038891",
  appId: "1:834668038891:web:e55ff62bb27c63b9324cae",
  measurementId: "G-D2C0ZNSES0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const startButton = document.getElementById('startButton');
const highScoresButton = document.getElementById('highScoresButton');
const menu = document.getElementById('menu');

// Ustawienia gry
let gameStarted = false;

// Funkcja do rozpoczęcia gry
startButton.addEventListener('click', () => {
    menu.style.display = 'none'; // Ukryj menu
    canvas.style.display = 'block'; // Pokaż canvas
    gameStarted = true;
    startGame(); // Funkcja rozpoczynająca grę
});

// Funkcja do pokazania wyników online
highScoresButton.addEventListener('click', () => {
    getHighScores(); // Pobieranie wyników z Firebase
});

// Funkcja rozpoczęcia gry
function startGame() {
    // Kod do inicjalizacji gry, rysowania statku itp.
    // Zainicjuj wszystkie zmienne gry i uruchom pętlę gry
    gameLoop(); // Rozpocznij pętlę gry
}

// Funkcja do pobierania wyników z Firebase
function getHighScores() {
    const scoresRef = database.ref('highScores');
    scoresRef.orderByChild('score').limitToLast(5).on('value', (snapshot) => {
        let highScores = snapshot.val();
        displayHighScores(highScores);
    });
}

// Funkcja do wyświetlania wyników
function displayHighScores(scores) {
    const scoresList = document.createElement('div');
    scoresList.style.position = 'absolute';
    scoresList.style.top = '50%';
    scoresList.style.left = '50%';
    scoresList.style.transform = 'translate(-50%, -50%)';
    scoresList.style.color = '#fff';
    
    let content = '<h2>Wyniki Online</h2>';
    for (let key in scores) {
        content += `<p>${scores[key].name}: ${scores[key].score}</p>`;
    }

    scoresList.innerHTML = content;
    document.body.appendChild(scoresList);
}

// Funkcja do zapisywania wyników w Firebase
function saveHighScore(name, score) {
    const scoresRef = database.ref('highScores');
    scoresRef.push({
        name: name,
        score: score
    });
}

// Przykład zakończenia gry i zapisania wyniku
function gameOver() {
    const playerName = prompt('Podaj swoje imię:');
    const score = distance.toFixed(2); // Zmienna z wynikiem (przykład)

    saveHighScore(playerName, score);
}

gameLoop();
