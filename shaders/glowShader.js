export function createGlowEffect(scene, ship) {
    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 0.6;

    scene.registerBeforeRender(() => {
        const speedFactor = Math.abs(ship.position.z) / 100;
        glowLayer.intensity = 0.6 + speedFactor * 0.4; // Glow wzrasta z prędkością
    });

    return glowLayer;
}
