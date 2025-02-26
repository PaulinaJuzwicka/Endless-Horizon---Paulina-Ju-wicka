// Poprawiony plik app.js
import { drawBackground, drawSpaceship, startGame as gameStart } from './game.js';
import { startButton, highScoresButton, canvas, getHighScores } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu');
    
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

    // Dodaj event listener do przycisku start
    startButton.addEventListener('click', startGame);
    
    // Dodaj event listener do przycisku wyników
    highScoresButton.addEventListener('click', getHighScores);
});