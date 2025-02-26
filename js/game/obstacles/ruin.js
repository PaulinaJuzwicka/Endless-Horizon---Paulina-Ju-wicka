import { ctx } from '../../ui.js';

export function drawRuin(obstacle) {
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