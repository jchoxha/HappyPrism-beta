// canvasManager.js
import React from 'react';
import { ShapeType } from '../../Misc/shapes.js';
import { Node, addNode, updateOrbitingNodesRefAngles } from './nodes.js';
import { physicsUpdate } from './Physics/physics.js';
import { colorToHex, hexToColor, rgbToColor, colorToRGB, isValidColor, isValidRGB, getRandomColor } from '../../Misc/colors.js';
import { nearestMultiple } from '../../Misc/utils.js';
import { setupEventListeners } from '../eventManager.js';
import { Theme } from '../theme.js';
import { drawDashboard } from '../dashboard/dashboard.js';


class CanvasManager {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.canvas = null;
        this.ctx = null;
        
        // Load the background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = '../Images/BG/day.png'; 
        
        this.nodes = [];
        this.orbits = [];
        this.selectedNode = null;
        this.highlightedNode = null;
        this.draggingCanvas = false;
        this.width = 0;
        this.height = 0;
        this.xCenter = 0;
        this.yCenter = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 1;
        this.topLeftX = 0;
        this.topLeftY = 0;
        this.bottomRightX = 0;
        this.bottomRightY = 0;
        this.visibleWidth = 0;
        this.visibleHeight = 0;
        this.mousePositionOnDown = { x: 0, y: 0 };
        this.mousePositionOnUp = { x: 0, y: 0 };
        this.mousePositionOnMoveStart = { x: 0, y: 0 };
        this.mousePositionOnMoveLast = { x: 0, y: 0 };
        this.currentmousePos = { x: 0, y: 0 };
        this.currentmouseV = { x: 0, y: 0 };
        this.mouseLastMoveTime = null;
        this.mouseLastMovePos = { x: null, y: null };
        this.toggleNodeDetails = false;
        this.toggleOrbitDetails = false;
        this.nodeDetailsStaticContentInit = false;
        this.toggleCanvasDetails = false;
        this.theme = null;
        this.changeCentralNodeMode = false;
        this.nodeToChangeCentralNode = null;

        this.isMobile = false;
        this.allowOrbitSpin = true;

        //INIT
        this.lastInitializedTime = Date.now();

        //Default Node Init
        this.defaultNodes = [];
        this.numNodesInitialized = 0;
        this.defaultNodesInitialized = false;
        this.defaultCentralSize = 150;
        this.defaultOuterSize = 120;

        //UI Init
        this.uiInitalized = false;

        // Bind methods that will be used as event listeners
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.draw = this.draw.bind(this);
        this.updateCanvas = this.updateCanvas.bind(this);
    }


    initCanvas(theme) {
        if (!this.canvasRef.current) {
          console.error('Canvas reference is not available');
          return;
        }
        this.canvas = this.canvasRef.current;
        this.ctx = this.canvas.getContext('2d');
        this.theme = theme;
        this.canvas.style.background = theme.canvas_background;
    
        // Set canvas dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        this.createBackgroundPattern();
        this.draw();
      }

    updateCanvas()
    {
    if((window.innerWidth <= 768 && window.innerHeight <= 1024)){
            this.isMobile = true;
            this.defaultCentralSize = 150;
            this.defaultOuterSize = 120;
            this.updateOrbits();
            this.resizeUI();
        }
        else{
            this.isMobile = false;
            this.defaultCentralSize = 120;
            this.defaultOuterSize = 100;
            this.updateOrbits();
            this.resizeUI();
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.translateX = this.canvas.width / 2;
        this.translateY = this.canvas.height / 2;
        this.draw();
    }

    createBackgroundPattern() {
        // Create the pattern
        this.backgroundPattern = this.ctx.createPattern(this.backgroundImage, 'repeat');
    }

    draw() {
        if (!this.ctx || !this.canvas) {
            console.error('Canvas or context is not available');
            return;
        }
    
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Save the current context state
        this.ctx.save();
    
        // Apply the current translation and scale
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);
    
        // Draw the background
        if (this.backgroundPattern) {
            this.ctx.fillStyle = this.backgroundPattern;
            this.ctx.fillRect(-this.translateX, -this.translateY, this.canvas.width, this.canvas.height);
        } else {
            // Fallback to drawing the background image directly if pattern isn't available
            this.ctx.drawImage(this.backgroundImage, -this.translateX, -this.translateY, this.canvas.width, this.canvas.height);
        }
    
        // Update the visible canvas range
        this.updateCanvasRange();
    
        // Draw all visible nodes
        this.nodes.forEach(node => {
            if (this.isNodeVisible(node)) {
                this.drawNode(node);
            }
        });
    
        // Restore the context state
        this.ctx.restore();
    
        // Draw any UI elements that need to be on top of the canvas
        // (Note: Most UI should be handled by React components)
        this.drawUI();
    }
    
    isNodeVisible(node) {
        const rad = node.size / 2;
        return node.x + rad >= this.topLeftX && node.x - rad <= this.bottomRightX &&
               node.y + rad >= this.topLeftY && node.y - rad <= this.bottomRightY;
    }

    updateCanvasRange() {
        this.topLeftX = -this.translateX / this.scale;
        this.topLeftY = -this.translateY / this.scale;
        this.bottomRightX = this.topLeftX + (this.canvas.width / this.scale);
        this.bottomRightY = this.topLeftY + (this.canvas.height / this.scale);
        this.visibleWidth = this.bottomRightX - this.topLeftX;
        this.visibleHeight = this.bottomRightY - this.topLeftY;
    }

    drawXAxis() {
        const { width, height, topLeftX, bottomRightX, ctx } = this;

        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(topLeftX, 0);
        ctx.lineTo(bottomRightX, 0);
        ctx.stroke();
        ctx.restore();
    }

    drawYAxis() {
        const { topLeftY, bottomRightY, ctx } = this;

        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, topLeftY);
        ctx.lineTo(0, bottomRightY);
        ctx.stroke();
        ctx.restore();
    }

    drawNode(node) {
        if(!node.visible) return;
        const { x, y, size } = node;
        const radius = size / 2;
        this.ctx.beginPath();
        if (node.shapeType.name === 'circle') {
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        } else if (node.shapeType.isPolygon) {
            this.drawPolygon(x, y, node.shapeType.numSides, radius);
        } else {
            console.error('Cannot draw unknown shape type:', node.shapeType.name);
        }
        this.ctx.closePath();
        

        if (node.fillStyle === "solidColor") {
            this.ctx.fillStyle = node.fill;
            this.ctx.fill();
        } else {
            console.error("No fill style found for node, using black instead");
            this.ctx.fillStyle = "black";
            this.ctx.fill();
        }
        if (node.image.src) {
            this.ctx.save();
            this.ctx.clip();
            this.ctx.drawImage(node.image, x - radius + 5, y - radius, size, size);
            this.ctx.restore();
        } 
    }

    drawPolygon(x, y, numSides, radius) {
        this.ctx.moveTo(x + radius, y);
        for (let i = 1; i <= numSides; i++) {
            this.ctx.lineTo(x + radius * Math.cos(2 * Math.PI * i / numSides), y + radius * Math.sin(2 * Math.PI * i / numSides));
        }
    }

    drawUI() {
        // Instead of directly manipulating the DOM, we'll return the JSX
        // This will be used in the React component
        return (
            <div id="uiMenus">
                <div id="top-bar">
                    <div id="top-left" className="menuDiv"></div>
                    <div id="top-center"></div>
                    <div id="top-right" className="menuDiv"></div>
                </div>
                <div id="lower-bar-popups">
                    <div id="dashboard-popup"></div>
                    <div id="lower-center-popup"></div>
                </div>
                <div id="lower-bar">
                    <div id="lower-left"></div>
                    <div id="lower-center"></div>
                    <div id="lower-right"></div>
                    <div id="chat-popup" className="chat-ai"></div>
                </div>
            </div>
        );
    }
    renderUI() {
        return (
          <div id="uiMenus">
            <div id="top-bar">
              <div id="top-left" className="menuDiv">
                <button id="home-button" className="no-select">
                  <img id="home-button-logo" src="../Images/UI/LogoDarkLargeNoBG.svg" alt="Home" />
                  <span id="app-name">
                    {'HappyPrism'.split('').map((letter, index) => (
                      <span key={index} className="app-name-letter">{letter}</span>
                    ))}
                  </span>
                </button>
              </div>
              <div id="top-center"></div>
              <div id="top-right" className="menuDiv">
                <button id="search-button" className="activatable-button">
                    <img src="../Images/UI/search.svg" alt="Search" />
                </button>
                <button id="options-menu-button" className="activatable-button">
                    <img src="../Images/UI/menu.svg" alt="Options Menu" />
                </button>
                <button id="profile-button" className="activatable-button">
                    <img src="../Images/UI/profile-circle.svg" alt="User Profile" className="circle-image" />
                </button>
              </div>
            </div>
            <div id="lower-bar-popups">
              <div id="lower-center-popup"></div>
            </div>
            <div id="lower-bar">
              <div id="lower-left">
                <button id="dashboard-button" className="activatable-button">
                  <img src="../Images/UI/dashboard.svg" alt="Dashboard" />
                </button>
              </div>
              <div id="lower-center">
                <div id="current-node-div">
                  <button id="prev-node-button">
                    <img src="../Images/UI/left.svg" alt="Previous Node" />
                  </button>
                  <span id="current-node">Spectrum</span>
                  <button id="next-node-button">
                    <img src="../Images/UI/right.svg" alt="Next Node" />
                  </button>
                </div>
              </div>
              <div id="lower-right">
                <button id="chat-button" className="activatable-button">
                  <img src="../Images/UI/chat-sparkle.svg" alt="Chat" />
                </button>
              </div>
            </div>
          </div>
        );
      }

    resizeUI(){
        if(this.isMobile){
            //Hide App Name
            document.getElementById("app-name").style.display = "none";

            //Move lower center up
            document.getElementById("lower-center").style.bottom = "14vh"
        }
        else{
            //Show App Name
            document.getElementById("app-name").style.display = "flex";

            //Move lower center down
            document.getElementById("lower-center").style.bottom = null;
        }
        //Adjust Response Buttons Lower Padding to Equal User Message Height
        // document.getElementById('chat-content').style.paddingBottom = `${((document.getElementById('chat-message-form').offsetHeight / window.innerHeight) * 100) + 4}vh`;

        // let chatMessages = document.getElementById('chat-messages');
        // if(chatMessages){
        //     chatMessages.style.marginTop = `${((document.getElementById('chat-conversation-title').offsetHeight / window.innerHeight) * 100)}vh`
        // };

        // //Adjust chat text area
        // let chatTextArea = document.getElementById('chat-textarea');
        // if(chatTextArea){
        //     let chatTextAreaRect = chatTextArea.getBoundingClientRect();
        //     let submitButton = document.getElementById('chat-submit-button');
        //     let submitButtonRect = submitButton.getBoundingClientRect();
        //     chatTextArea.style.maxWidth = `${submitButtonRect.left - chatTextAreaRect.left - (window.innerHeight * .05)}px`;
        // }
    }

    async changeCentralNode(orbit, currentCentralNode, newCentralNode) {
        if(!this.defaultNodesInitialized){
            document.getElementById("prev-node-button").classList.remove('button-active');
            document.getElementById("next-node-button").classList.remove('button-active');
            return;
        } 
        this.changeCentralNodeMode = true;
        let prevVelocity = orbit.angularVelocity;
        orbit.angularVelocity = 0;
        setTimeout(() => {
            orbit.angularVelocity = prevVelocity;
            setTimeout(() => {
                this.changeCentralNodeMode = false;
                document.getElementById("prev-node-button").classList.remove('button-active');
                document.getElementById("next-node-button").classList.remove('button-active');
            }, 500);
        }, 3000);
        
        //This adds the current central node to its own orbit, then addes the new central node to the center, makes for a dynamic motion
        let tempNode = new Node(0, 0, currentCentralNode.size, currentCentralNode.shapeType, "black");
        tempNode.visible = false;
        tempNode.affectedByCollision = false;

        //Make the new temp Node the central node for now
        if (currentCentralNode && tempNode) {
            if (orbit) {
                
                const currentNodeName = document.getElementById("current-node");
                currentNodeName.innerHTML = "Changing...";
                orbit.centralNode = tempNode;
                //Update Angle of orbiting nodes to +1
                currentCentralNode.isResizing = true;
                currentCentralNode.isShrinking = true;
                currentCentralNode.newSize = this.defaultOuterSize;
                //Move the new central node into the center
                setTimeout(() => {
                    updateOrbitingNodesRefAngles(this, orbit, 1);
                    setTimeout(() => {
                        currentCentralNode.addSelfToOrbit(this, orbit);
                        setTimeout(() => {
                            
                            newCentralNode.inOrbit = false;
                            newCentralNode.fixedX = tempNode.fixedX;
                            newCentralNode.fixedY = tempNode.fixedY;
                            setTimeout(() => {
                                newCentralNode.isResizing = true;
                                newCentralNode.isGrowing = true;
                                newCentralNode.newSize = this.defaultCentralSize;
                                currentNodeName.style.background = newCentralNode.fill;
                                setTimeout(() => {
                                    orbit.orbitingNodes.splice(orbit.orbitingNodes.indexOf(newCentralNode), 1);
                                    updateOrbitingNodesRefAngles(this, orbit, 0);
                                    setTimeout(() => {
                                        orbit.centralNode = newCentralNode;
                                        newCentralNode.orbits.push(orbit);
                                        currentCentralNode.orbits = [];
                                        currentNodeName.innerHTML = newCentralNode.name;
                                        tempNode = null;
                                        }, 500);
                                    }, 500);
                                }, 500);
                            }, 1000);
                    }, 500);
                }, 500);
            }
        }
        else{
            console.error("Invalid central node provided");
        }
    }

    addOrbitToNode(node) {
        node.addOrbit(this);
        this.drawOrbitDetails(node);
        this.draw();
    }

    removeOrbitFromNode(node, orbitIndex) {
        const orbit = node.orbits[orbitIndex];
        if (orbit) {
            orbit.orbitingNodes.forEach(orbitingNode => {
                orbitingNode.inOrbit = false;
                orbitingNode.centralNode = null;
                orbitingNode.currentOrbit = null;
            });

            node.orbits.splice(orbitIndex, 1);
        }

        this.drawOrbitDetails(node);
        this.draw();
    }

    highlightNodeById(nodeId) {
        const node = this.nodes.find(node => node.id === nodeId);
        if (node) {
            this.highlightedNode = node;
            this.draw();
        }
    }

    
    initDefaultNodes(canvasManager) {
        if (!this.defaultNodesInitialized && this.width && this.height) {
          const { defaultNodes, lastInitializedTime } = this;
          const numNodesInitialized = defaultNodes.length;
          const centralSize = this.defaultCentralSize;
          const outerSize = this.defaultOuterSize;
    
          if (Date.now() - lastInitializedTime >= 500) {
            if (numNodesInitialized === 0) {
              const centralNode = addNode(canvasManager, centralSize, "rgba(210, 209, 205, 0.5)", null, "../images/Nodes/HappyPrism/", true, "Spectrum");
              defaultNodes.push(centralNode);
              if (centralNode) {
                centralNode.addOrbit(canvasManager);
              }
            }
            else{
                if(numNodesInitialized == 1){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(255, 225, 0, 0.5)",  defaultNodes[0].orbits[0], "../images/Nodes/Sol/", true, "Sol"));
                }
                else if(numNodesInitialized == 2){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(255, 154, 0, 0.5)", defaultNodes[0].orbits[0], "../images/Nodes/Amber/", true, "Amber"));
                }
                else if(numNodesInitialized == 3){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(240, 1, 1, 0.5)", defaultNodes[0].orbits[0], "../images/Nodes/Red/", true, "Red"));
                }
                else if(numNodesInitialized == 4){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(182, 50, 206, 0.5)", defaultNodes[0].orbits[0], "../images/Nodes/Violet/", true, "Violet"));
                }
                else if(numNodesInitialized == 5){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(50, 50, 255, 0.5)", defaultNodes[0].orbits[0], "../images/Nodes/Jean/", true, "Jean"));
                }
                else if(numNodesInitialized == 6){
                    defaultNodes.push(addNode(canvasManager, outerSize, "rgba(50, 153, 50, 0.5)", defaultNodes[0].orbits[0], "../images/Nodes/Ivy/", true, "Ivy"));
                    this.defaultNodesInitialized = true;
                    console.log("Number of nodes in default orbit: ", defaultNodes[0].orbits[0].orbitingNodes.length);
                }
                this.numNodesInitialized++;
                this.lastInitializedTime = Date.now();
              }
        
                if (this.numNodesInitialized >= 7) {  // Adjust this number based on your needs
                this.defaultNodesInitialized = true;
                console.log("Default nodes initialized");
                }
            }
        }
    }
        

    updateOrbits(){
        let windowSizeOrbitRadiusMult = 1.5;
        let centralSize = this.defaultCentralSize;
        let outerSize = this.defaultOuterSize;
        if(this.isMobile){
            windowSizeOrbitRadiusMult = 1;
        }
        for(let i = 0; i < this.nodes.length; i++){
            let currentNode = this.nodes[i];
            if(currentNode.orbits.length > 0){ 
                currentNode.size = centralSize;
                for(let j = 0; j < currentNode.orbits.length; j++){
                    let currentOrbit = currentNode.orbits[j];
                    currentOrbit.radius = currentNode.size * windowSizeOrbitRadiusMult * (j+1);
                }
            } else if(currentNode.inOrbit){
                currentNode.size = outerSize;
            }
        }
    }
}

export default CanvasManager;
