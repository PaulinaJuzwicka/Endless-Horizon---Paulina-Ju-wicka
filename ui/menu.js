export function createMenu(scene) {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(stackPanel);

    function createButton(text, color, callback) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(text, text);
        button.width = "250px";
        button.height = "60px";
        button.color = "white";
        button.background = color;
        button.cornerRadius = 10;
        button.fontSize = 24;
        button.thickness = 2;
        button.onPointerUpObservable.add(() => {
            playClickSound();
            callback();
        });

        stackPanel.addControl(button);
        return button;
    }

    function playClickSound() {
        const clickSound = new BABYLON.Sound("click", "sounds/click.mp3", scene);
        clickSound.play();
    }

    createButton("Start Game", "green", () => startGame(scene));
    createButton("High Score", "blue", showHighScores);
    createButton("Settings", "gray", showSettings);
}

function startGame(scene) {
    console.log("Game started!");
    scene.getMeshByName("ship").position.z = -10; // Reset pozycji statku
}

function showHighScores() {
    console.log("Showing high scores...");
}

function showSettings() {
    console.log("Opening settings...");
}
