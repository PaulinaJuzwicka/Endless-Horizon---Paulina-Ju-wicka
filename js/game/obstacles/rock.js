import { ctx } from '../../ui.js';

export function drawRock(obstacle) {
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