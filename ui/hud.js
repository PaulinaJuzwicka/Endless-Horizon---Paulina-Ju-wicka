export function createHUD(scene) {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const scoreText = new BABYLON.GUI.TextBlock();
    scoreText.text = "Score: 0";
    scoreText.color = "white";
    scoreText.fontSize = 24;
    scoreText.top = "-40px";
    scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(scoreText);

    const distanceText = new BABYLON.GUI.TextBlock();
    distanceText.text = "Distance: 0m";
    distanceText.color = "white";
    distanceText.fontSize = 24;
    distanceText.top = "-80px";
    distanceText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    distanceText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(distanceText);

    function updateScore(value) {
        scoreText.text = `Score: ${value}`;
    }

    function updateDistance(value) {
        distanceText.text = `Distance: ${Math.floor(value)}m`;
    }

    function toggleNightMode(isNight) {
        scoreText.color = isNight ? "yellow" : "white";
        distanceText.color = isNight ? "yellow" : "white";
    }

    return { updateScore, updateDistance, toggleNightMode };
}
