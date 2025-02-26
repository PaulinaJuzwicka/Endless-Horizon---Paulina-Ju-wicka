export class MobileControls {
    constructor(sensitivity = 2) {
        this.sensitivity = sensitivity;
        this.isGyroAvailable = false;
        this.currentX = 0;
        this.targetX = 0;
        
        this.setupGyroscope();
        this.setupTouchControls();
    }

    setupGyroscope() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                if (event.gamma !== null) {
                    this.isGyroAvailable = true;
                    this.targetX = window.innerWidth / 2 + (event.gamma * this.sensitivity);
                }
            });
        }
    }

    setupTouchControls() {
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.targetX = touch.clientX;
        }, { passive: false });
    }

    update() {
        // Płynne przejście do pozycji docelowej
        const easing = 0.1;
        this.currentX += (this.targetX - this.currentX) * easing;
        return this.currentX;
    }
}