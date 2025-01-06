import { GLTFLoader } from 'scripts/GLTFLoader.js';

// Inicjalizacja sceny, kamery, renderera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let ship; // Zmienna na statek
let obstacles = []; // Tablica na przeszkody
let score = 0; // Zmienna na wynik

// Funkcja ładowania statku
function loadShipModel() {
    const loader = new GLTFLoader();
    loader.load('assets/spaceship.glb', (gltf) => {
        ship = gltf.scene;
        ship.scale.set(0.5, 0.5, 0.5);
        ship.position.set(0, 1, 4); // Początkowa pozycja
        scene.add(ship);
        animate();
    });
}

// Funkcja animacji
function animate() {
    requestAnimationFrame(animate);

    // Rysowanie przeszkód
    obstacles.forEach(obstacle => {
        obstacle.position.z -= 0.05; // Poruszanie przeszkodami w kierunku gracza
    });

    // Sprawdzenie kolizji
    checkCollisions();

    renderer.render(scene, camera);
}

// Funkcja sprawdzania kolizji
function checkCollisions() {
    obstacles.forEach(obstacle => {
        if (ship.position.distanceTo(obstacle.position) < 1) {
            // Kolizja wykryta
            alert('Kolizja! Gra zakończona.');
            resetGame();
        }
    });
}

// Funkcja do resetowania gry
function resetGame() {
    obstacles = [];
    score = 0;
    // Reset pozycji statku, restart logiki gry
}

// Dodanie przeszkód
function addObstacles() {
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(Math.random() * 10 - 5, 1, Math.random() * -10 - 5);
    obstacles.push(obstacle);
    scene.add(obstacle);
}

// Funkcja do obsługi kliknięć przycisków w menu
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none'; // Ukrywanie menu
    loadShipModel(); // Ładowanie statku
    setInterval(addObstacles, 2000); // Dodawanie przeszkód co 2 sekundy
});
document.getElementById('highScoresButton').addEventListener('click', () => {
    alert('Wyniki:'); // Możliwość wyświetlania wyników
});
