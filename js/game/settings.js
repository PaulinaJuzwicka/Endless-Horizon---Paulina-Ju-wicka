export const GAME_SETTINGS = {
    baseSpeed: 5,
    speedIncreaseFactor: 1.0005,
    shipStartX: window.innerWidth / 2,
    shipStartY: window.innerHeight * 0.8,
    shipWidth: 50,
    shipHeight: 30,
    gyroSensitivity: 2,
    minObstacleSpacing: 200,
    maxObstacleSpacing: 500,
    obstacleSpawnRate: 0.02,
    terrainChangeDistance: 1000,
    difficultyIncreaseFactor: 1.1
};

export const OBSTACLE_TYPES = {
    RUIN: 0,
    SHIPWRECK: 1,
    ROCK: 2,
    CANYON: 3,
    TOWER: 4,
    ENERGY_BARRIER: 5
};