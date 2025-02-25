export function checkCollisions(ship, obstacles, scene) {
    obstacles.forEach(obstacle => {
        if (ship.intersectsMesh(obstacle, false)) {
            alert('Kolizja! Gra zakończona.');
            scene.stopAnimation();
        }
    });
}
