export function interpolateColor(color1, color2, factor) {
    function hexToRgb(hex) {
        if (hex.startsWith('#')) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return { r, g, b };
        } else {
            const tempCanvas = document.createElement('canvas');
            const context = tempCanvas.getContext('2d');
            context.fillStyle = hex;
            const rgb = context.fillStyle;
            const r = parseInt(rgb.substring(1, 3), 16);
            const g = parseInt(rgb.substring(3, 5), 16);
            const b = parseInt(rgb.substring(5, 7), 16);
            return { r, g, b };
        }
    }
    
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return `rgb(${r}, ${g}, ${b})`;
}

export function darkenColor(color, factor) {
    function hexToRgb(hex) {
        if (hex.startsWith('#')) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return { r, g, b };
        } else {
            const tempCanvas = document.createElement('canvas');
            const context = tempCanvas.getContext('2d');
            context.fillStyle = hex;
            const rgb = context.fillStyle;
            const r = parseInt(rgb.substring(1, 3), 16);
            const g = parseInt(rgb.substring(3, 5), 16);
            const b = parseInt(rgb.substring(5, 7), 16);
            return { r, g, b };
        }
    }
    
    const rgb = hexToRgb(color);
    return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
}