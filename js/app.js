import { drawBackground, drawSpaceship, startGame as gameStart } from './game.js';
import { startButton, highScoresButton, canvas, getHighScores, setupUI } from './ui.js';
import { initializeFirebase } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('gameCanvas');
    const startButton = document.getElementById('startButton');
    const highScoresButton = document.getElementById('highScoresButton');

    // Upewnij się, że elementy zostały znalezione
    console.log('Menu:', menu);
    console.log('Canvas:', canvas);
    console.log('Start Button:', startButton);
    console.log('High Scores Button:', highScoresButton);

    // Funkcja do rozpoczęcia gry
    function startGame() {
        console.log('Game started');
        menu.style.display = 'none';
        canvas.style.display = 'block';
        
        // Dostosuj canvas do pełnego ekranu
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Rozpocznij grę
        gameStart();
    }
    
    // Dodaj instrukcje gry po załadowaniu strony
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.marginTop = '20px';
    instructionsDiv.style.padding = '10px';
    instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    instructionsDiv.style.borderRadius = '5px';
    
    instructionsDiv.innerHTML = `
        <h3>Instrukcja:</h3>
        <p>Sterowanie: Strzałki ← → lub klawisze A/D</p>
        <p>Na urządzeniach mobilnych: Przechyl telefon lub dotknij ekranu</p>
        <p>Unikaj przeszkód i staraj się przelecieć jak najdalej!</p>
    `;
    
    menu.appendChild(instructionsDiv);

    // Obsługa przycisku Start
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        menu.style.display = 'none';
        canvas.style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        startGame();
    });
    
    // Obsługa przycisku Wyników
    highScoresButton.addEventListener('click', async () => {
        console.log('High scores button clicked');
        try {
            const scores = await getHighScores();
            displayHighScores(scores);
        } catch (error) {
            console.error('Błąd podczas pobierania wyników:', error);
            alert('Nie udało się pobrać wyników. Spróbuj ponownie później.');
        }
    });

    function displayHighScores(scores) {
        // Usuń poprzedni panel wyników, jeśli istnieje
        const existingScores = document.querySelector('.high-scores');
        if (existingScores) {
            existingScores.remove();
        }

        const scoresHTML = scores.length > 0
            ? scores.map((score, index) => 
                `<p>${index + 1}. ${score.name}: ${score.score} punktów</p>`
              ).join('')
            : '<p>Brak wyników</p>';

        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'high-scores';
        scoreDisplay.innerHTML = `
            <h2>Najlepsze Wyniki</h2>
            ${scoresHTML}
            <button id="closeScores">Zamknij</button>
        `;

        document.body.appendChild(scoreDisplay);

        // Obsługa przycisku zamykania
        document.getElementById('closeScores').addEventListener('click', () => {
            scoreDisplay.remove();
        });
    }

    setupUI();
    initializeFirebase();
});