export function createShip(scene) {
    // Stworzenie głównej bryły statku
    let ship = BABYLON.MeshBuilder.CreateBox("ship", { width: 1, height: 0.5, depth: 2 }, scene);
    ship.position.y = 1;

    // Materiał statku
    let shipMaterial = new BABYLON.StandardMaterial("shipMaterial", scene);
    shipMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 1); // Niebieski kolor
    ship.material = shipMaterial;

    // Światło na statku (efekt silnika)
    let engineLight = new BABYLON.PointLight("engineLight", new BABYLON.Vector3(0, 0, -1), scene);
    engineLight.diffuse = new BABYLON.Color3(1, 0.5, 0); // Pomarańczowe światło silnika
    engineLight.intensity = 2;
    engineLight.parent = ship; // Światło podąża za statkiem

    return ship;
}
