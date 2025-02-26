import { GAME_SETTINGS } from './game/settings.js';

export function setupControls(updateShipPosition) {
    let keysPressed = {
        left: false,
        right: false
    };

    // Obsługa klawiatury
    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                keysPressed.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                keysPressed.right = true;
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                keysPressed.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                keysPressed.right = false;
                break;
        }
    });

    // Obsługa żyroskopu
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (event) => {
            if (event.gamma !== null && event.gamma !== undefined) {
                const targetX = (window.innerWidth / 2) + (event.gamma * GAME_SETTINGS.gyroSensitivity);
                updateShipPosition(targetX);
            }
        });
    }

    return keysPressed;
}