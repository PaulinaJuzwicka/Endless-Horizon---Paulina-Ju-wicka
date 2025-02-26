export class DifficultyManager {
    constructor(baseSpeed, speedIncreaseFactor) {
        this.baseSpeed = baseSpeed;
        this.speedIncreaseFactor = speedIncreaseFactor;
        this.currentSpeed = baseSpeed;
        this.distanceThresholds = [
            1000,  // First increase
            2500,  // Second increase
            5000,  // Third increase
            10000  // Final increase
        ];
    }
    
    updateDifficulty(distance) {
        this.currentSpeed = this.baseSpeed;
        
        for (let threshold of this.distanceThresholds) {
            if (distance > threshold) {
                this.currentSpeed *= this.speedIncreaseFactor;
            }
        }
        
        return this.currentSpeed;
    }
    
    getObstacleFrequency(distance) {
        return Math.min(0.05, 0.02 + (distance / 10000) * 0.03);
    }
}