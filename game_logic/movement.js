export function loadShip(scene) {
    const ship = BABYLON.MeshBuilder.CreateBox("ship", { width: 1, height: 1, depth: 2 }, scene);
    ship.position.y = 1;
    let targetX = 0; // Cel pozycji dla płynnego ruchu

    window.addEventListener("deviceorientation", (event) => {
        let tilt = BABYLON.Scalar.Clamp(event.gamma, -30, 30) / 30; // Skaluje wartości do -1 .. 1
        targetX = BABYLON.Scalar.Lerp(targetX, tilt * 5, 0.1); // Płynne przejście
    });

    scene.onBeforeRenderObservable.add(() => {
        ship.position.x += (targetX - ship.position.x) * 0.1; // Interpolacja
    });

    return ship;
}
