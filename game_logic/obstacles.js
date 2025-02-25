export function createObstacles(scene) {
    let obstacles = [];
    const obstacleTypes = [
        () => BABYLON.MeshBuilder.CreateCylinder("rock", { diameter: 2, height: 2 }, scene),  // Skały
        () => BABYLON.MeshBuilder.CreateBox("ruin", { width: 3, height: 4, depth: 2 }, scene), // Ruiny
        () => BABYLON.MeshBuilder.CreateSphere("wreck", { diameter: 3 }, scene) // Wrak statku
    ];

    for (let i = 0; i < 5; i++) {
        let obstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)](); // Losowy typ przeszkody
        obstacle.position.x = Math.random() * 10 - 5;
        obstacle.position.z = Math.random() * -20 - 10;
        obstacles.push(obstacle);
    }

    let speed = 0.1; // Początkowa prędkość przeszkód
    scene.registerBeforeRender(() => {
        obstacles.forEach(obstacle => {
            obstacle.position.z += speed;

            // Jeśli przeszkoda przeszła poza ekran, resetujemy ją
            if (obstacle.position.z > 0) {
                obstacle.position.z = Math.random() * -20 - 10;
                obstacle.position.x = Math.random() * 10 - 5;
            }
        });

        // Stopniowo zwiększamy trudność gry
        if (speed < 0.5) {
            speed += 0.0005; // Przeszkody stają się szybsze z czasem
        }
    });

    return obstacles;
}
