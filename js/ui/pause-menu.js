export class PauseMenu {
    constructor() {
        this.isPaused = false;
        this.setupEventListeners();
    }

    draw(ctx) {
        if (!this.isPaused) return;

        // Przyciemnione tło
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Menu
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUZA', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillText('Naciśnij SPACJĘ aby kontynuować', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
        ctx.fillText('ESC aby wrócić do menu', ctx.canvas.width / 2, ctx.canvas.height / 2 + 60);
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.isPaused = !this.isPaused;
            } else if (e.code === 'Escape' && this.isPaused) {
                // Powrót do menu głównego
                window.location.reload();
            }
        });
    }
}