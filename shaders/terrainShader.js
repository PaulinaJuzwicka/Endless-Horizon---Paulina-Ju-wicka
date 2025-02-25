export function createTerrainShader(scene) {
    const shaderMaterial = new BABYLON.ShaderMaterial("terrainShader", scene, {
        vertex: "terrain",
        fragment: "terrain",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        defines: ["USE_FOG"]
    });

    shaderMaterial.setColor3("fogColor", new BABYLON.Color3(0.5, 0.5, 0.5)); // Szary kolor mgły
    shaderMaterial.setFloat("fogDensity", 0.02); // Gęstość mgły

    return shaderMaterial;
}
