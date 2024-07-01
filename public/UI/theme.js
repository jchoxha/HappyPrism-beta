const { getRandomColor } = require("../Misc/colors.js");

class Theme {
    constructor() {
        //Default App Colors

        //UI
        this.default_canvas_background = "#081622";
        this.default_menu_background = "#013561";

        //Nodes
        this.default_node_fill = null;
    }
}
  

module.exports = { Theme };