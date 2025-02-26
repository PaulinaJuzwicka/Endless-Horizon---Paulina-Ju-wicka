import { ctx } from '../../ui.js';

export function drawTower(obstacle) {

    drawTowerBase(obstacle);
    drawTowerStructure(obstacle);
    drawTowerAntenna(obstacle);
    drawTowerLight(obstacle);
}

function drawTowerBase(obstacle) {
    // Główna struktura wieży
    ctx.fillStyle = "#708090";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawTowerStructure(obstacle) {
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
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 3);
    ctx.moveTo(obstacle.x + obstacle.width, obstacle.y);
    ctx.lineTo(obstacle.x, obstacle.y + obstacle.height / 3);
    ctx.stroke();
}

function drawTowerAntenna(obstacle) {
    // Antena na szczycie
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(
        obstacle.x + obstacle.width / 2 - 2,
        obstacle.y - obstacle.height * 0.15,
        4,
        obstacle.height * 0.15
    );
}

function drawTowerLight(obstacle) {
    // Element świecący
    ctx.fillStyle = "#FF4500";
    ctx.beginPath();
    ctx.arc(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height * 0.15,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}