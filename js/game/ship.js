import { ctx } from '../ui.js';

export function drawShip(x, y, width, height) {
    // Korpus statku
    ctx.fillStyle = "#4169E1";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.closePath();
    ctx.fill();

    // Efekt silnika
    ctx.fillStyle = "#FF4500";
    const engineWidth = width * 0.3;
    const engineHeight = height * 0.4;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.35, y + height);
    ctx.lineTo(x + width * 0.65, y + height);
    ctx.lineTo(x + width * 0.5, y + height + engineHeight);
    ctx.closePath();
    ctx.fill();

    // Detale statku
    ctx.strokeStyle = "#87CEEB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height * 0.3);
    ctx.lineTo(x + width * 0.8, y + height * 0.3);
    ctx.stroke();
}