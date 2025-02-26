import { ctx } from '../../ui.js';

export function drawEnergyBarrier(obstacle) {
    // Efekt energii
    const gradient = ctx.createLinearGradient(
        obstacle.x, 
        obstacle.y, 
        obstacle.x, 
        obstacle.y + obstacle.height
    );
    
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.1)");
    gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0.1)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Pulsujący efekt
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 5) * 0.5 + 0.5;
    
    ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}