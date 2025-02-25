let score = 0;

export function updateScore() {
    score += 0.1; // Aktualizacja wyniku
    document.getElementById('score').innerText = `Wynik: ${Math.floor(score)}`;
}