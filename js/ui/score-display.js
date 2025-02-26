import { ctx } from '../ui.js';

export class ScoreDisplay {
    constructor() {
        this.score = 0;
        this.distance = 0;
        this.currentLevel = 1;
        this.nextLevelDistance = 1000;
    }
    
    update(score, distance) {
        this.score = Math.floor(score);
        this.distance = Math.floor(distance);
        this.currentLevel = Math.floor(distance / 1000) + 1;
        this.nextLevelDistance = this.currentLevel * 1000;
    }
    
    draw() {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        
        // Wyświetl wynik
        ctx.fillText(`Wynik: ${this.score}`, 20, 40);
        
        // Wyświetl dystans
        ctx.fillText(`Dystans: ${this.distance}m`, 20, 70);
        
        // Wyświetl poziom trudności
        ctx.fillText(`Poziom: ${this.currentLevel}`, 20, 100);
        
        // Pasek postępu do następnego poziomu
        const progressWidth = 200;
        const progress = (this.distance % 1000) / 1000;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, 110, progressWidth, 10);
        
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fillRect(20, 110, progressWidth * progress, 10);
    }
}