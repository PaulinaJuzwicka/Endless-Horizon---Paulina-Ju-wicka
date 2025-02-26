import { ctx, canvas } from '../../ui.js';
import { interpolateColor, darkenColor } from '../colors.js';

export const terrainSettings = {
    currentTerrain: 0,
    terrainTransition: 0,
    terrainChangeDistance: 1000,
    terrainColors: [
        { ground: "#d2b48c", sky: "#87CEEB" }, // Pustynia
        { ground: "#696969", sky: "#4a5c69" },  // Góry
        { ground: "#555555", sky: "#2f4f4f" },  // Ruiny
        { ground: "#8B0000", sky: "#FF4500" }   // Wulkaniczny teren
    ]
};

export function drawTerrainDetails(terrainType, transition, nextTerrain, distance) {
    // Elementy dla pustyni
    if (terrainType === 0 || (transition > 0 && nextTerrain === 0)) {
        const opacity = terrainType === 0 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Piaszczyste wydmy
        ctx.fillStyle = "#e6c995";
        for (let i = 0; i < 5; i++) {
            const x = ((distance * 0.2) + i * 300) % canvas.width;
            const height = 20 + Math.random() * 30;
            const width = 150 + Math.random() * 100;
            
            ctx.beginPath();
            ctx.ellipse(
                x, 
                canvas.height * 0.7 - height / 2, 
                width, 
                height, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // Elementy dla gór
    if (terrainType === 1 || (transition > 0 && nextTerrain === 1)) {
        const opacity = terrainType === 1 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Góry w tle
        ctx.fillStyle = "#505050";
        for (let i = 0; i < 3; i++) {
            const baseX = ((distance * 0.1) + i * 500) % canvas.width;
            const height = 100 + Math.random() * 150;
            
            ctx.beginPath();
            ctx.moveTo(baseX - 200, canvas.height * 0.7);
            ctx.lineTo(baseX, canvas.height * 0.7 - height);
            ctx.lineTo(baseX + 200, canvas.height * 0.7);
            ctx.fill();
        }
    }
    
    // Elementy dla ruin miasta
    if (terrainType === 2 || (transition > 0 && nextTerrain === 2)) {
        const opacity = terrainType === 2 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Ruiny budynków
        ctx.fillStyle = "#707070";
        for (let i = 0; i < 8; i++) {
            const x = ((distance * 0.3) + i * 200) % canvas.width;
            const height = 30 + Math.random() * 70;
            const width = 40 + Math.random() * 30;
            
            // Zniszczony budynek
            ctx.fillRect(x, canvas.height * 0.7 - height, width, height);
            
            // Okna w budynku
            ctx.fillStyle = "#404040";
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 2; k++) {
                    if (Math.random() > 0.3) { // Niektóre okna są zniszczone
                        ctx.fillRect(
                            x + 5 + k * (width / 2 - 5), 
                            canvas.height * 0.7 - height + 10 + j * 20, 
                            width / 4, 
                            10
                        );
                    }
                }
            }
        }
    }
    
    // Elementy dla wulkanicznego terenu
    if (terrainType === 3 || (transition > 0 && nextTerrain === 3)) {
        const opacity = terrainType === 3 ? 1 - transition : transition;
        ctx.globalAlpha = opacity;
        
        // Lawa i dymy
        for (let i = 0; i < 3; i++) {
            const x = ((distance * 0.2) + i * 400) % canvas.width;
            
            // Strumienie lawy
            ctx.fillStyle = "#FF4500";
            ctx.beginPath();
            ctx.moveTo(x, canvas.height * 0.7);
            ctx.quadraticCurveTo(
                x + 50, 
                canvas.height * 0.8,
                x + 100, 
                canvas.height
            );
            ctx.fill();
            
            // Dymy
            createSmoke(x, canvas.height * 0.6);
        }
    }
    
    // Resetuj przezroczystość
    ctx.globalAlpha = 1.0;
}

export function drawBackground(distance, deltaTime) {
    // Sprawdź, czy potrzebna jest zmiana terenu
    let newTerrain = Math.floor(distance / terrainSettings.terrainChangeDistance) % terrainSettings.terrainColors.length;
    
    // Rozpocznij przejście, jeśli teren się zmienia
    if (newTerrain !== terrainSettings.currentTerrain && terrainSettings.terrainTransition === 0) {
        terrainSettings.terrainTransition = 0.01;
    }
    
    // Aktualizacja przejścia terenu
    if (terrainSettings.terrainTransition > 0 && terrainSettings.terrainTransition < 1) {
        terrainSettings.terrainTransition += 0.005 * deltaTime * 60;
        if (terrainSettings.terrainTransition >= 1) {
            terrainSettings.terrainTransition = 0;
            terrainSettings.currentTerrain = newTerrain;
        }
    }
    
    const currentColors = terrainSettings.terrainColors[terrainSettings.currentTerrain];
    const nextColors = terrainSettings.terrainColors[newTerrain];
    
    let skyColor, groundColor;
    
    if (terrainSettings.terrainTransition > 0) {
        skyColor = interpolateColor(currentColors.sky, nextColors.sky, terrainSettings.terrainTransition);
        groundColor = interpolateColor(currentColors.ground, nextColors.ground, terrainSettings.terrainTransition);
    } else {
        skyColor = currentColors.sky;
        groundColor = currentColors.ground;
    }
    
    // Rysuj tło
    drawSky(skyColor);
    drawGround(groundColor);
    drawTerrainDetails(terrainSettings.currentTerrain, terrainSettings.terrainTransition, newTerrain, distance);
    drawStars(distance);
}