import { ctx } from '../ui.js';
import { OBSTACLE_TYPES } from './settings.js';
import { drawRuin } from './obstacles/ruin.js';
import { drawShipwreck } from './obstacles/shipwreck.js';
import { drawRock } from './obstacles/rock.js';
import { drawCanyon } from './obstacles/canyon.js';
import { drawTower } from './obstacles/tower.js';

export function generateObstacle(distance) {
    const type = Math.floor(Math.random() * Object.keys(OBSTACLE_TYPES).length);
    const width = 50 + Math.random() * 100;
    const height = 100 + Math.random() * 150;
    const x = Math.random() * (window.innerWidth - width);
    
    return {
        type,
        x,
        y: window.innerHeight * 0.7 - height,
        width,
        height,
        passageWidth: type === OBSTACLE_TYPES.CANYON ? 100 + Math.random() * 50 : 0
    };
}

export function updateObstacles(obstacles, deltaTime, gameSpeed, distance) {
    // Usuń przeszkody, które wyszły poza ekran
    obstacles = obstacles.filter(obstacle => obstacle.y < window.innerHeight);
    
    // Dodaj nowe przeszkody
    if (Math.random() < 0.02 * deltaTime * gameSpeed) {
        obstacles.push(generateObstacle(distance));
    }
    
    // Aktualizuj pozycje przeszkód
    obstacles.forEach(obstacle => {
        obstacle.y += gameSpeed * deltaTime;
    });
}

export function drawObstacles(obstacles) {
    obstacles.forEach(obstacle => {
        switch(obstacle.type) {
            case OBSTACLE_TYPES.RUIN:
                drawRuin(obstacle);
                break;
            case OBSTACLE_TYPES.SHIPWRECK:
                drawShipwreck(obstacle);
                break;
            case OBSTACLE_TYPES.ROCK:
                drawRock(obstacle);
                break;
            case OBSTACLE_TYPES.CANYON:
                drawCanyon(obstacle);
                break;
            case OBSTACLE_TYPES.TOWER:
                drawTower(obstacle);
                break;
        }
    });
}