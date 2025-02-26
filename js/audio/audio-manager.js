export class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('assets/sounds/background.mp3');
        this.collisionSound = new Audio('assets/sounds/collision.mp3');
        this.engineSound = new Audio('assets/sounds/engine.mp3');
        
        this.backgroundMusic.loop = true;
        this.engineSound.loop = true;
    }

    startBackgroundMusic() {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }

    playCollisionSound() {
        this.collisionSound.play();
    }

    startEngineSound() {
        this.engineSound.play();
    }

    stopEngineSound() {
        this.engineSound.pause();
        this.engineSound.currentTime = 0;
    }
}