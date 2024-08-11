// theme.js
class Theme {
    constructor() {
        // Default App Colors
        this.default_canvas_background = "#081622";
        this.default_menu_background = "#013561";
    }

    updateThemeForNode(node) {
        console.log("updating theme for node: ", node);
        const root = document.documentElement;
        const colors = this.getColorsForNode(node);

        root.style.setProperty('--dimension-bg-color', colors.backgroundColor);
        root.style.setProperty('--dimension-hover-bg-color', colors.hoverColor);
        root.style.setProperty('--dimension-text-color', colors.textColor);

        if (node.dimensionName === 'Spectrum') {
            root.style.setProperty('--dimension-bg-animation', 'gradient 15s ease infinite');
            root.style.setProperty('--dimension-bg-size', '400% 400%');
        } else {
            root.style.removeProperty('--dimension-bg-animation');
            root.style.removeProperty('--dimension-bg-size');
        }
    }

    getColorsForNode(node) {
        const dimensionColors = {
            'Spectrum': {
                backgroundColor: 'linear-gradient(-45deg, #ffd900 0%, #FFA500 16.67%, #FF4500 33.33%, #8A2BE2 50%, #4169E1 66.67%, #2E8B57 83.33%, #ffd900 100%)',
                hoverColor: '#f8a8a8',
                textColor: '#ffffff'
            },
            'Sol': { backgroundColor: '#ffd900', hoverColor: '#d4b200', textColor: '#000000' },
            'Amber': { backgroundColor: '#FFA500', hoverColor: '#cc8400', textColor: '#ffffff' },
            'Red': { backgroundColor: '#FF4500', hoverColor: '#b33400', textColor: '#ffffff' },
            'Violet': { backgroundColor: '#8A2BE2', hoverColor: '#661dbd', textColor: '#ffffff' },
            'Jean': { backgroundColor: '#4169E1', hoverColor: '#3151b3', textColor: '#ffffff' },
            'Ivy': { backgroundColor: '#2E8B57', hoverColor: '#226641', textColor: '#ffffff' }
        };

        return dimensionColors[node.dimensionName] || dimensionColors['Spectrum'];
    }

    getSvgPathBasedOnTextColorAndName(textColor, svgName) {
        const colorSuffix = textColor === '#ffffff' ? '-white' : '';
        return `/Images/UI/${svgName}${colorSuffix}.svg`;
    }
}

export { Theme };
