export class Tutorial {
    constructor() {
        this.isFirstTime = !localStorage.getItem('tutorialShown');
        this.steps = [
            'Przechyl telefon w lewo/prawo aby sterować statkiem',
            'Unikaj przeszkód i przetrwaj jak najdłużej',
            'Zbieraj punkty za przebyty dystans',
            'Naciśnij SPACJĘ aby rozpocząć'
        ];
        this.currentStep = 0;
    }

    draw(ctx) {
        if (!this.isFirstTime) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.steps[this.currentStep], 
                    ctx.canvas.width / 2, 
                    ctx.canvas.height / 2);
    }

    complete() {
        localStorage.setItem('tutorialShown', 'true');
        this.isFirstTime = false;
    }
}