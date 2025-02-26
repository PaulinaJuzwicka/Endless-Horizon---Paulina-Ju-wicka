import { drawBackground, drawSpaceship } from './game.js';
import { startButton, highScoresButton } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja gry
    function startGame() {
        console.log('Game started'); // Debugging log
        gameLoop();
    }

    function gameLoop() {
        drawBackground();
        drawSpaceship(100, 100); // Przykładowe położenie
        requestAnimationFrame(gameLoop);
    }

    // Dodaj event listener do przycisku start
    startButton.addEventListener('click', startGame);
});

export { startGame };
