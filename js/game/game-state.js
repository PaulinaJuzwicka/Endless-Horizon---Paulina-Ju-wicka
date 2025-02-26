export class GameState {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.distance = 0;
        this.currentTerrain = 0;
        this.difficultyLevel = 1;
    }

    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.distance = 0;
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
    }

    updateState(deltaTime, speed) {
        if (!this.isPlaying || this.isPaused) return;
        
        this.distance += speed * deltaTime;
        this.score += deltaTime * speed;
        this.difficultyLevel = Math.floor(this.distance / 1000) + 1;
    }
}