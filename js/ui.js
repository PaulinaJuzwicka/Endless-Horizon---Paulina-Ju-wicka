import { database } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const highScoresButton = document.getElementById('highScoresButton');
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let gameStarted = false;

    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        menu.style.display = 'none';
        canvas.style.display = 'block';
        gameStarted = true;
        startGame();
    });

    highScoresButton.addEventListener('click', () => {
        console.log('High Scores button clicked');
        getHighScores();
    });

    function getHighScores() {
        const scoresRef = database.ref('highScores');
        scoresRef.orderByChild('score').limitToLast(5).on('value', (snapshot) => {
            let highScores = snapshot.val();
            displayHighScores(highScores);
        });
    }

    function displayHighScores(scores) {
        const scoresList = document.createElement('div');
        scoresList.style.position = 'absolute';
        scoresList.style.top = '50%';
        scoresList.style.left = '50%';
        scoresList.style.transform = 'translate(-50%, -50%)';
        scoresList.style.color = '#fff';
        
        let content = '<h2>Wyniki Online</h2>';
        for (let key in scores) {
            content += `<p>${scores[key].name}: ${scores[key].score}</p>`;
        }

        scoresList.innerHTML = content;
        document.body.appendChild(scoresList);
    }

    export { startButton, highScoresButton, canvas, ctx };
}); 