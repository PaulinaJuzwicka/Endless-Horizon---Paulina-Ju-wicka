export function createTerrain(scene) {
    let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 100 }, scene);
    ground.position.z = -50;
    
    scene.registerBeforeRender(() => {
        ground.position.z += 0.1; // Powolne przesuwanie terenu w tył
        if (ground.position.z > 0) {
            ground.position.z = -50; // Reset terenu, gdy przejdzie do przodu
        }
    });

    return ground;
}
