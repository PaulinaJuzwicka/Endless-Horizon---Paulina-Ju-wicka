import { OBJLoader } from './scripts/OBJLoader.js';
import { MTLLoader } from './scripts/MTLLoader.js';
import * as THREE from './scripts/three.module.min.js';

// Inicjalizacja sceny, kamery, renderera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let ship; // Zmienna na statek
let obstacles = []; // Tablica na przeszkody
let score = 0; // Zmienna na wynik
let currentBiome = ''; // Zmienna na obecny biom

// Funkcja ładowania statku
function loadShipModel() {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('assets/spaceship.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('assets/spaceship.obj', (object) => {
            ship = object;
            ship.scale.set(0.5, 0.5, 0.5);
            ship.position.set(0, 1, 4); // Początkowa pozycja
            scene.add(ship);
            animate();
        }, undefined, (error) => {
            console.error('Błąd ładowania modelu: ', error);
        });
    }, undefined, (error) => {
        console.error('Błąd ładowania materiałów: ', error);
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

// Funkcja dodawania przeszkód dla różnych biomów
function addObstaclesForCity() {
    addBuilding();
    addStreetLamp();
    addContainer();
    addCar();
    addBarrier();
}

// Funkcja dodawania budynków
function addBuilding() {
    const width = Math.random() * 2 + 1;
    const depth = Math.random() * 2 + 1;
    const height = Math.random() * 5 + 5;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x8B8B8B });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(Math.random() * 10 - 5, height / 2, Math.random() * -10 - 5);
    obstacles.push(building);
    scene.add(building);
}

// Funkcja dodawania latarni
function addStreetLamp() {
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 12);
    const kulaGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const pole = new THREE.Mesh(poleGeometry, material);
    const kula = new THREE.Mesh(kulaGeometry, material);
    kula.position.set(0, 2.5, 0);
    pole.position.set(Math.random() * 10 - 5, 1.5, Math.random() * -10 - 5);

    const lamp = new THREE.Group();
    lamp.add(pole);
    lamp.add(kula);

    obstacles.push(lamp);
    scene.add(lamp);
}

// Funkcja dodawania kontenerów
function addContainer() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xFF5733 });
    const container = new THREE.Mesh(geometry, material);
    container.position.set(Math.random() * 10 - 5, 0.5, Math.random() * -10 - 5);
    obstacles.push(container);
    scene.add(container);
}

// Funkcja dodawania samochodów
function addCar() {
    const geometry = new THREE.BoxGeometry(2, 1, 3);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
    const car = new THREE.Mesh(geometry, material);
    car.position.set(Math.random() * 10 - 5, 0.5, Math.random() * -10 - 5);
    obstacles.push(car);
    scene.add(car);
}

// Funkcja dodawania barierek
function addBarrier() {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 12);
    const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const barrier = new THREE.Mesh(geometry, material);
    barrier.position.set(Math.random() * 10 - 5, 1, Math.random() * -10 - 5);
    obstacles.push(barrier);
    scene.add(barrier);
}

// Funkcja zmieniająca biom
function changeBiome() {
    const biomes = ['desert', 'mountain', 'city', 'forest'];
    currentBiome = biomes[Math.floor(Math.random() * biomes.length)];
    console.log('Current biome:', currentBiome);
    
    if (currentBiome === 'city') {
        setInterval(addObstaclesForCity, 2000); // Co 2 sekundy dodajemy przeszkody w mieście
    }
    // Dodaj inne biome
}

// Obsługa kliknięć przycisków w menu
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    loadShipModel();
    setInterval(changeBiome, 5000); // Zmieniamy biom co 5 sekund
});

document.getElementById('highScoresButton').addEventListener('click', () => {
    alert('Wyniki:'); // Możliwość wyświetlania wyników
});
