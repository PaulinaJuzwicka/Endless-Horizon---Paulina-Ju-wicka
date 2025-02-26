import { OBSTACLE_TYPES } from './settings.js';

export function checkCollision(shipX, shipY, shipWidth, shipHeight, obstacles) {
    for (const obstacle of obstacles) {
        // Podstawowa detekcja kolizji prostokątów
        if (shipX < obstacle.x + obstacle.width &&
            shipX + shipWidth > obstacle.x &&
            shipY < obstacle.y + obstacle.height &&
            shipY + shipHeight > obstacle.y) {
            
            // Specjalna obsługa dla kanionu
            if (obstacle.type === OBSTACLE_TYPES.CANYON) {
                const passageStart = obstacle.x + (obstacle.width - obstacle.passageWidth) / 2;
                const passageEnd = passageStart + obstacle.passageWidth;
                
                if (shipX > passageStart && shipX + shipWidth < passageEnd) {
                    continue; // Statek jest w bezpiecznym przejściu
                }
            }
            
            return true; // Kolizja wykryta
        }
    }
    return false;
}