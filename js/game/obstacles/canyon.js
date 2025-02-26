import { ctx } from '../../ui.js';

export function drawCanyon(obstacle) {
    // Rysuj ściany kanionu
    ctx.fillStyle = "#8B4513";
    
    // Lewa ściana
    ctx.fillRect(
        obstacle.x,
        obstacle.y,
        (obstacle.width - obstacle.passageWidth) / 2,
        obstacle.height
    );
    
    // Prawa ściana
    ctx.fillRect(
        obstacle.x + (obstacle.width + obstacle.passageWidth) / 2,
        obstacle.y,
        (obstacle.width - obstacle.passageWidth) / 2,
        obstacle.height
    );
    
    // Dodaj teksturę do ścian
    drawCanyonTexture(obstacle);
}

function drawCanyonTexture(obstacle) {
    ctx.fillStyle = "#A0522D";
    
    // Tekstura dla lewej ściany
    for (let i = 0; i < 5; i++) {
        const x = obstacle.x + Math.random() * (obstacle.width - obstacle.passageWidth) / 2;
        const y = obstacle.y + Math.random() * obstacle.height;
        const size = Math.random() * 20 + 10;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Tekstura dla prawej ściany
    for (let i = 0; i < 5; i++) {
        const x = obstacle.x + (obstacle.width + obstacle.passageWidth) / 2 + 
                 Math.random() * (obstacle.width - obstacle.passageWidth) / 2;
        const y = obstacle.y + Math.random() * obstacle.height;
        const size = Math.random() * 20 + 10;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}