import { ctx } from '../../ui.js';

export function drawShipwreck(obstacle) {
    // Zapisz stan kontekstu
    ctx.save();
    
    // Przesuń i obróć kontekst
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation);
    
    // Korpus statku
    ctx.fillStyle = "#505050";
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Górna część - wieżyczka
    ctx.fillStyle = "#606060";
    ctx.beginPath();
    ctx.ellipse(obstacle.width * 0.1, 0, obstacle.width * 0.2, obstacle.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Uszkodzenia statku - dziury
    ctx.fillStyle = "#303030";
    for (let i = 0; i < 5; i++) {
        const holeX = (Math.random() - 0.5) * obstacle.width * 0.7;
        const holeY = (Math.random() - 0.5) * obstacle.height * 0.7;
        const holeSize = Math.random() * obstacle.width * 0.15 + obstacle.width * 0.05;
        
        ctx.beginPath();
        ctx.arc(holeX, holeY, holeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Przywróć stan kontekstu
    ctx.restore();
}