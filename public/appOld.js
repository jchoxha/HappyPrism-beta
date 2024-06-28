const {loadDependencies} = require('./Dependencies/loadDependencies.js');
const { CanvasManager } = require('./UI/canvasManager/canvasManager.js');
const { setupEventListeners } = require('./UI/eventManager.js');
const { physicsUpdate } = require('./UI/canvasManager/Physics/physics.js');
const { Theme } = require('./UI/theme.js');


document.addEventListener('DOMContentLoaded', () => {
    const theme = new Theme();
    theme.initTheme();
    const canvasManager = new CanvasManager('canvas');
    canvasManager.initCanvas(theme);
    setupEventListeners(canvasManager);
    loadDependencies();
    requestAnimationFrame(animate);
    physicsUpdate(canvasManager);
    canvasManager.updateCanvas();
    window.addEventListener('resize', () => {
        console.log("Resize detected");
        canvasManager.updateCanvas();
    });
   
    function update() {
        physicsUpdate(canvasManager);
        if(!canvasManager.defaultNodesInitialized){
            canvasManager.initDefaultNodes(canvasManager);
        }
        canvasManager.draw();
    }
    function animate() {
        update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});


