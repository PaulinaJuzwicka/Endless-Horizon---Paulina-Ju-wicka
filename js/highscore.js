export class HighScoreManager {
    constructor() {
        this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    }

    addScore(score) {
        this.highScores.push({
            score: Math.floor(score),
            date: new Date().toISOString()
        });
        
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
    }

    getTopScores() {
        return this.highScores;
    }

    clearScores() {
        this.highScores = [];
        localStorage.removeItem('highScores');
    }
}