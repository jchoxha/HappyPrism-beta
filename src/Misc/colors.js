const ColorCategories = {
  Reds: {
    crimson: { hex: "#DC143C", rgb: "rgb(220,20,60)" },
    firebrick: { hex: "#B22222", rgb: "rgb(178,34,34)" },
    red: { hex: "#FF0000", rgb: "rgb(255,0,0)" },
    darkred: { hex: "#8B0000", rgb: "rgb(139,0,0)" },
    lightcoral: { hex: "#F08080", rgb: "rgb(240,128,128)" },
    indianred: { hex: "#CD5C5C", rgb: "rgb(205,92,92)" },
    darksalmon: { hex: "#E9967A", rgb: "rgb(233,150,122)" },
    salmon: { hex: "#FA8072", rgb: "rgb(250,128,114)" },
    lightsalmon: { hex: "#FFA07A", rgb: "rgb(255,160,122)" }
  },
  Oranges: {
    coral: { hex: "#FF7F50", rgb: "rgb(255,127,80)" },
    tomato: { hex: "#FF6347", rgb: "rgb(255,99,71)" },
    orangered: { hex: "#FF4500", rgb: "rgb(255,69,0)" },
    orange: { hex: "#FFA500", rgb: "rgb(255,165,0)" },
    darkorange: { hex: "#FF8C00", rgb: "rgb(255,140,0)" }
  },
  Yellows: {
    gold: { hex: "#FFD700", rgb: "rgb(255,215,0)" },
    yellow: { hex: "#FFFF00", rgb: "rgb(255,255,0)" },
    lightyellow: { hex: "#FFFFE0", rgb: "rgb(255,255,224)" },
    lemonchiffon: { hex: "#FFFACD", rgb: "rgb(255,250,205)" },
    lightgoldenrodyellow: { hex: "#FAFAD2", rgb: "rgb(250,250,210)" },
    palegoldenrod: { hex: "#EEE8AA", rgb: "rgb(238,232,170)" },
    khaki: { hex: "#F0E68C", rgb: "rgb(240,230,140)" },
    darkkhaki: { hex: "#BDB76B", rgb: "rgb(189,183,107)" }
  },
  Greens: {
    greenyellow: { hex: "#ADFF2F", rgb: "rgb(173,255,47)" },
    chartreuse: { hex: "#7FFF00", rgb: "rgb(127,255,0)" },
    lawngreen: { hex: "#7CFC00", rgb: "rgb(124,252,0)" },
    lime: { hex: "#00FF00", rgb: "rgb(0,255,0)" },
    limegreen: { hex: "#32CD32", rgb: "rgb(50,205,50)" },
    palegreen: { hex: "#98FB98", rgb: "rgb(152,251,152)" },
    lightgreen: { hex: "#90EE90", rgb: "rgb(144,238,144)" },
    mediumspringgreen: { hex: "#00FA9A", rgb: "rgb(0,250,154)" },
    springgreen: { hex: "#00FF7F", rgb: "rgb(0,255,127)" },
    mediumseagreen: { hex: "#3CB371", rgb: "rgb(60,179,113)" },
    seagreen: { hex: "#2E8B57", rgb: "rgb(46,139,87)" },
    forestgreen: { hex: "#228B22", rgb: "rgb(34,139,34)" },
    green: { hex: "#008000", rgb: "rgb(0,128,0)" },
    darkgreen: { hex: "#006400", rgb: "rgb(0,100,0)" },
    yellowgreen: { hex: "#9ACD32", rgb: "rgb(154,205,50)" },
    olivedrab: { hex: "#6B8E23", rgb: "rgb(107,142,35)" },
    olive: { hex: "#808000", rgb: "rgb(128,128,0)" },
    darkolivegreen: { hex: "#556B2F", rgb: "rgb(85,107,47)" },
    mediumaquamarine: { hex: "#66CDAA", rgb: "rgb(102,205,170)" },
    darkseagreen: { hex: "#8FBC8F", rgb: "rgb(143,188,143)" }
  },
  Blues: {
    aqua: { hex: "#00FFFF", rgb: "rgb(0,255,255)" },
    cyan: { hex: "#00FFFF", rgb: "rgb(0,255,255)" },
    lightcyan: { hex: "#E0FFFF", rgb: "rgb(224,255,255)" },
    paleturquoise: { hex: "#AFEEEE", rgb: "rgb(175,238,238)" },
    aquamarine: { hex: "#7FFFD4", rgb: "rgb(127,255,212)" },
    turquoise: { hex: "#40E0D0", rgb: "rgb(64,224,208)" },
    mediumturquoise: { hex: "#48D1CC", rgb: "rgb(72,209,204)" },
    darkturquoise: { hex: "#00CED1", rgb: "rgb(0,206,209)" },
    cadetblue: { hex: "#5F9EA0", rgb: "rgb(95,158,160)" },
    steelblue: { hex: "#4682B4", rgb: "rgb(70,130,180)" },
    lightsteelblue: { hex: "#B0C4DE", rgb: "rgb(176,196,222)" },
    powderblue: { hex: "#B0E0E6", rgb: "rgb(176,224,230)" },
    lightblue: { hex: "#ADD8E6", rgb: "rgb(173,216,230)" },
    skyblue: { hex: "#87CEEB", rgb: "rgb(135,206,235)" },
    lightskyblue: { hex: "#87CEFA", rgb: "rgb(135,206,250)" },
    deepskyblue: { hex: "#00BFFF", rgb: "rgb(0,191,255)" },
    dodgerblue: { hex: "#1E90FF", rgb: "rgb(30,144,255)" },
    cornflowerblue: { hex: "#6495ED", rgb: "rgb(100,149,237)" },
    mediumslateblue: { hex: "#7B68EE", rgb: "rgb(123,104,238)" },
    royalblue: { hex: "#4169E1", rgb: "rgb(65,105,225)" },
    blue: { hex: "#0000FF", rgb: "rgb(0,0,255)" },
    mediumblue: { hex: "#0000CD", rgb: "rgb(0,0,205)" },
    darkblue: { hex: "#00008B", rgb: "rgb(0,0,139)" },
    navy: { hex: "#000080", rgb: "rgb(0,0,128)" },
    midnightblue: { hex: "#191970", rgb: "rgb(25,25,112)" },
    teal: { hex: "#008080", rgb: "rgb(0,128,128)" },
    darkcyan: { hex: "#008B8B", rgb: "rgb(0,139,139)" },
    lightseagreen: { hex: "#20B2AA", rgb: "rgb(32,178,170)" }
  },
  Purples: {
    lavender: { hex: "#E6E6FA", rgb: "rgb(230,230,250)" },
    thistle: { hex: "#D8BFD8", rgb: "rgb(216,191,216)" },
    plum: { hex: "#DDA0DD", rgb: "rgb(221,160,221)" },
    violet: { hex: "#EE82EE", rgb: "rgb(238,130,238)" },
    orchid: { hex: "#DA70D6", rgb: "rgb(218,112,214)" },
    fuchsia: { hex: "#FF00FF", rgb: "rgb(255,0,255)" },
    magenta: { hex: "#FF00FF", rgb: "rgb(255,0,255)" },
    mediumorchid: { hex: "#BA55D3", rgb: "rgb(186,85,211)" },
    mediumpurple: { hex: "#9370DB", rgb: "rgb(147,112,219)" },
    blueviolet: { hex: "#8A2BE2", rgb: "rgb(138,43,226)" },
    darkviolet: { hex: "#9400D3", rgb: "rgb(148,0,211)" },
    darkorchid: { hex: "#9932CC", rgb: "rgb(153,50,204)" },
    darkmagenta: { hex: "#8B008B", rgb: "rgb(139,0,139)" },
    purple: { hex: "#800080", rgb: "rgb(128,0,128)" },
    indigo: { hex: "#4B0082", rgb: "rgb(75,0,130)" }
  },
  Whites: {
    white: { hex: "#FFFFFF", rgb: "rgb(255,255,255)" },
    snow: { hex: "#FFFAFA", rgb: "rgb(255,250,250)" },
    honeydew: { hex: "#F0FFF0", rgb: "rgb(240,255,240)" },
    mintcream: { hex: "#F5FFFA", rgb: "rgb(245,255,250)" },
    azure: { hex: "#F0FFFF", rgb: "rgb(240,255,255)" },
    aliceblue: { hex: "#F0F8FF", rgb: "rgb(240,248,255)" },
    ghostwhite: { hex: "#F8F8FF", rgb: "rgb(248,248,255)" },
    whitesmoke: { hex: "#F5F5F5", rgb: "rgb(245,245,245)" },
    seashell: { hex: "#FFF5EE", rgb: "rgb(255,245,238)" },
    beige: { hex: "#F5F5DC", rgb: "rgb(245,245,220)" },
    oldlace: { hex: "#FDF5E6", rgb: "rgb(253,245,230)" },
    floralwhite: { hex: "#FFFAF0", rgb: "rgb(255,250,240)" },
    ivory: { hex: "#FFFFF0", rgb: "rgb(255,255,240)" },
    antiquewhite: { hex: "#FAEBD7", rgb: "rgb(250,235,215)" },
    linen: { hex: "#FAF0E6", rgb: "rgb(250,240,230)" },
    lavenderblush: { hex: "#FFF0F5", rgb: "rgb(255,240,245)" },
    mistyrose: { hex: "#FFE4E1", rgb: "rgb(255,228,225)" }
  },
  Greys: {
    gainsboro: { hex: "#DCDCDC", rgb: "rgb(220,220,220)" },
    lightgray: { hex: "#D3D3D3", rgb: "rgb(211,211,211)" },
    silver: { hex: "#C0C0C0", rgb: "rgb(192,192,192)" },
    darkgray: { hex: "#A9A9A9", rgb: "rgb(169,169,169)" },
    gray: { hex: "#808080", rgb: "rgb(128,128,128)" },
    dimgray: { hex: "#696969", rgb: "rgb(105,105,105)" },
    lightslategray: { hex: "#778899", rgb: "rgb(119,136,153)" },
    slategray: { hex: "#708090", rgb: "rgb(112,128,144)" },
    darkslategray: { hex: "#2F4F4F", rgb: "rgb(47,79,79)" },
    black: { hex: "#000000", rgb: "rgb(0,0,0)" }
  },
  Browns: {
    cornsilk: { hex: "#FFF8DC", rgb: "rgb(255,248,220)" },
    blanchedalmond: { hex: "#FFEBCD", rgb: "rgb(255,235,205)" },
    bisque: { hex: "#FFE4C4", rgb: "rgb(255,228,196)" },
    navajowhite: { hex: "#FFDEAD", rgb: "rgb(255,222,173)" },
    wheat: { hex: "#F5DEB3", rgb: "rgb(245,222,179)" },
    burlywood: { hex: "#DEB887", rgb: "rgb(222,184,135)" },
    tan: { hex: "#D2B48C", rgb: "rgb(210,180,140)" },
    rosybrown: { hex: "#BC8F8F", rgb: "rgb(188,143,143)" },
    sandybrown: { hex: "#F4A460", rgb: "rgb(244,164,96)" },
    goldenrod: { hex: "#DAA520", rgb: "rgb(218,165,32)" },
    peru: { hex: "#CD853F", rgb: "rgb(205,133,63)" },
    chocolate: { hex: "#D2691E", rgb: "rgb(210,105,30)" },
    saddlebrown: { hex: "#8B4513", rgb: "rgb(139,69,19)" },
    sienna: { hex: "#A0522D", rgb: "rgb(160,82,45)" },
    brown: { hex: "#A52A2A", rgb: "rgb(165,42,42)" },
    maroon: { hex: "#800000", rgb: "rgb(128,0,0)" }
  },
  Pinks: {
    pink: { hex: "#FFC0CB", rgb: "rgb(255,192,203)" },
    lightpink: { hex: "#FFB6C1", rgb: "rgb(255,182,193)" },
    hotpink: { hex: "#FF69B4", rgb: "rgb(255,105,180)" },
    deeppink: { hex: "#FF1493", rgb: "rgb(255,20,147)" },
    palevioletred: { hex: "#DB7093", rgb: "rgb(219,112,147)" },
    mediumvioletred: { hex: "#C71585", rgb: "rgb(199,21,133)" }
  }
};

function getRandomColor() {
  const [red, green, blue] = Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
  return `rgb(${red},${green},${blue})`;
}


// Helper function to find a color by iterating over categories
function findColor(predicate) {
  for (const category in ColorCategories) {
    for (const colorName in ColorCategories[category]) {
      const color = ColorCategories[category][colorName];
      if (predicate(color)) {
        return color;
      }
    }
  }
  return null; // Return null if no color matches
}

// Convert color name to hex
function colorToHex(colorName) {
  colorName = colorName.toLowerCase();
  const color = findColor(color => color.name === colorName);
  return color ? color.hex : null;
}

// Convert hex to color name
function hexToColor(hex) {
  hex = hex.toLowerCase();
  const color = findColor(color => color.hex === hex);
  return color ? color.name : null;
}

// Convert rgb to color name
function rgbToColor(rgb) {
  rgb = rgb.replace(/\s+/g, '');
  const color = findColor(color => color.rgb === rgb);
  return color ? color.name : null;
}

// Convert color name to RGB
function colorToRGB(colorName) {
  colorName = colorName.toLowerCase();
  const color = findColor(color => color.name === colorName);
  return color ? color.rgb : null;
}

// Check if the color string is valid
function isValidColor(color) {
  const hexPattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
  const rgbPattern = /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/;
  // Updated RGBA pattern to correctly handle RGBA values
  const rgbaPattern = /^rgba\(\d{1,3},\d{1,3},\d{1,3},(0|1|0?\.\d+)\)$/;

  return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color) || 
         !!findColor(c => c.hex === color || c.rgb === color);
}

// Check if the RGB values are within range
function isValidRGB(color) {
  const matches = color.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/);
  return matches && parseInt(matches[1]) <= 255 && parseInt(matches[2]) <= 255 && parseInt(matches[3]) <= 255;
}

// Export all functions
export { colorToHex, hexToColor, rgbToColor, colorToRGB, isValidColor, isValidRGB, getRandomColor };