// Poprawiony plik ui.js
import { db } from './firebase.js';
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Wybór elementów DOM
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const startButton = document.getElementById('startButton');
export const highScoresButton = document.getElementById('highScoresButton');
const menu = document.getElementById('menu');

// Funkcja do pobierania wyników
export async function getHighScores() {
    try {
        const highScoresQuery = query(
            collection(db, "highScores"),
            orderBy("score", "desc"),
            limit(5)
        );
        
        const querySnapshot = await getDocs(highScoresQuery);
        const scores = [];
        
        querySnapshot.forEach((doc) => {
            scores.push({ id: doc.id, ...doc.data() });
        });
        
        displayHighScores(scores);
    } catch (e) {
        console.error("Error getting high scores: ", e);
        displayHighScores([]);
    }
}

// Funkcja do wyświetlania wyników
function displayHighScores(scores) {
    // Usuń istniejący panel wyników, jeśli istnieje
    const existingScoresList = document.getElementById('scoresList');
    if (existingScoresList) {
        document.body.removeChild(existingScoresList);
    }
    
    // Utwórz nowy panel wyników
    const scoresList = document.createElement('div');
    scoresList.id = 'scoresList';
    scoresList.style.position = 'absolute';
    scoresList.style.top = '50%';
    scoresList.style.left = '50%';
    scoresList.style.transform = 'translate(-50%, -50%)';
    scoresList.style.color = '#fff';
    scoresList.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    scoresList.style.padding = '30px';
    scoresList.style.borderRadius = '10px';
    scoresList.style.zIndex = '100';
    scoresList.style.minWidth = '300px';
    scoresList.style.textAlign = 'center';
    
    // Generuj zawartość
    let content = '<h2 style="color: #4080ff; margin-bottom: 20px;">Najlepsze Wyniki</h2>';
    
    if (scores.length === 0) {
        content += '<p style="font-style: italic;">Brak wyników</p>';
    } else {
        content += '<table style="width: 100%; border-collapse: collapse;">';
        content += '<tr><th style="padding: 8px; text-align: left; border-bottom: 1px solid #444;">Gracz</th>' +
                  '<th style="padding: 8px; text-align: right; border-bottom: 1px solid #444;">Wynik (km)</th></tr>';
        
        scores.forEach((score, index) => {
            const rowStyle = index % 2 === 0 ? 'background-color: rgba(50, 50, 80, 0.3);' : '';
            content += `<tr style="${rowStyle}">
                <td style="padding: 8px; text-align: left;">${score.name}</td>
                <td style="padding: 8px; text-align: right;">${Number(score.score).toFixed(0)}</td>
            </tr>`;
        });
        
        content += '</table>';
    }
    
    content += '<button id="backButton" style="margin-top: 20px; padding: 10px 20px; background-color: #4080ff; ' +
              'color: white; border: none; border-radius: 5px; cursor: pointer;">Powrót</button>';
    
    scoresList.innerHTML = content;
    document.body.appendChild(scoresList);
    
    // Dodaj obsługę przycisku powrotu
    document.getElementById('backButton').addEventListener('click', () => {
        document.body.removeChild(scoresList);
    });
}

export function setupUI() {
    const menu = document.getElementById('menu');
    const startButton = document.getElementById('startButton');
    const highScoresButton = document.getElementById('highScoresButton');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return { menu, startButton, highScoresButton };
}

export function drawUI(score, distance) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Wynik: ${Math.floor(score)}`, 10, 30);
    ctx.fillText(`Dystans: ${Math.floor(distance)}m`, 10, 60);
}

export { startButton, highScoresButton, canvas, ctx, getHighScores };