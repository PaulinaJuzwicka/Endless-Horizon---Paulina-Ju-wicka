import { initGame, startGame } from './game.js';
import { setupUI, setupCanvas } from './ui.js';
import { initializeFirebase, getHighScores } from './firebase.js';
import { GAME_SETTINGS } from './game/settings.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing game...');
    
    // Get DOM elements
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('gameCanvas');
    const startButton = document.getElementById('startButton');
    const highScoresButton = document.getElementById('highScoresButton');

    // Debug log to check if elements are found
    console.log('Elements found:', {
        menu: menu !== null,
        canvas: canvas !== null,
        startButton: startButton !== null,
        highScoresButton: highScoresButton !== null
    });

    // Initialize game components
    setupCanvas(canvas);
    setupUI();
    initializeFirebase();
    initGame(canvas);

    // Add button listeners
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        menu.style.display = 'none';
        canvas.style.display = 'block';
        startGame();
    });

    highScoresButton.addEventListener('click', async () => {
        console.log('High scores button clicked');
        try {
            const scores = await getHighScores();
            showHighScores(scores);
        } catch (error) {
            console.error('Error loading scores:', error);
            alert('Nie udało się załadować wyników.');
        }
    });

    function showHighScores(scores) {
        const scoresDiv = document.createElement('div');
        scoresDiv.className = 'high-scores';
        scoresDiv.innerHTML = `
            <h2>Najlepsze Wyniki</h2>
            ${scores.map((score, index) => `
                <p>${index + 1}. ${score.score} punktów</p>
            `).join('')}
            <button onclick="this.parentElement.remove()">Zamknij</button>
        `;
        document.body.appendChild(scoresDiv);
    }

    // Log debug info
    console.log('Game initialized with settings:', GAME_SETTINGS);
});