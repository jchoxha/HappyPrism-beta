// canvasManager.js
import { Node, addNode, updateOrbitingNodesRefAngles } from "./nodes.js";

class CanvasManager {
  constructor(canvasRef) {
    this.canvasRef = canvasRef;
    this.canvas = null;
    this.ctx = null;

    // Load the background image
    this.backgroundImage = new Image();
    this.backgroundImage.src = "/Images/BG/day.png";

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
    this.theme = null;
    this.changeCentralNodeMode = false;
    this.nodeToChangeCentralNode = null;
    this.nextCentralNode = null;

    this.isMobile = false;
    this.allowOrbitSpin = true;

    // INIT
    this.lastInitializedTime = Date.now();

    // Default Node Init
    this.defaultNodes = [];
    this.numNodesInitialized = 0;
    this.defaultNodesInitialized = false;
    this.defaultCentralSize = 150;
    this.defaultOuterSize = 120;

    // Bind methods that will be used as event listeners
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.draw = this.draw.bind(this);
    this.updateCanvas = this.updateCanvas.bind(this);
  }

  initCanvas(theme) {
    if (!this.canvasRef.current) {
      console.error("Canvas reference is not available");
      return;
    }
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext("2d");
    this.theme = theme;
    this.canvas.style.background = theme.canvas_background;

    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
    this.createBackgroundPattern();
    this.draw();
  }

  updateCanvas() {
    if (window.innerWidth <= 768 && window.innerHeight <= 1024) {
      this.isMobile = true;
      this.defaultCentralSize = 150;
      this.defaultOuterSize = 120;
      this.updateOrbits();
    } else {
      this.isMobile = false;
      this.defaultCentralSize = 120;
      this.defaultOuterSize = 100;
      this.updateOrbits();
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
    this.backgroundPattern = this.ctx.createPattern(
      this.backgroundImage,
      "repeat"
    );
  }

  draw() {
    if (!this.ctx || !this.canvas) {
      console.error("Canvas or context is not available");
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
      this.ctx.fillRect(
        -this.translateX,
        -this.translateY,
        this.canvas.width,
        this.canvas.height
      );
    } else {
      this.ctx.drawImage(
        this.backgroundImage,
        -this.translateX,
        -this.translateY,
        this.canvas.width,
        this.canvas.height
      );
    }

    // Update the visible canvas range
    this.updateCanvasRange();

    // Draw all visible nodes
    this.nodes.forEach((node) => {
      if (this.isNodeVisible(node)) {
        this.drawNode(node);
      }
    });

    // Restore the context state
    this.ctx.restore();
  }

  isNodeVisible(node) {
    const rad = node.size / 2;
    return (
      node.x + rad >= this.topLeftX &&
      node.x - rad <= this.bottomRightX &&
      node.y + rad >= this.topLeftY &&
      node.y - rad <= this.bottomRightY
    );
  }

  updateCanvasRange() {
    this.topLeftX = -this.translateX / this.scale;
    this.topLeftY = -this.translateY / this.scale;
    this.bottomRightX = this.topLeftX + this.canvas.width / this.scale;
    this.bottomRightY = this.topLeftY + this.canvas.height / this.scale;
    this.visibleWidth = this.bottomRightX - this.topLeftX;
    this.visibleHeight = this.bottomRightY - this.topLeftY;
  }

  drawXAxis() {
    const { width, height, topLeftX, bottomRightX, ctx } = this;

    ctx.save();
    ctx.strokeStyle = "#000000";
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
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, topLeftY);
    ctx.lineTo(0, bottomRightY);
    ctx.stroke();
    ctx.restore();
  }

  drawNode(node) {
    if (!node.visible) return;
    const { x, y, size } = node;
    const radius = size / 2;
    this.ctx.beginPath();
    if (node.shapeType.name === "circle") {
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    } else if (node.shapeType.isPolygon) {
      this.drawPolygon(x, y, node.shapeType.numSides, radius);
    } else {
      console.error("Cannot draw unknown shape type:", node.shapeType.name);
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
      console.log("Attempting to draw image: ", node.image, " for node: ", node.name);
      this.ctx.drawImage(node.image, x - radius + 5, y - radius, size, size);
      this.ctx.restore();
    }
  }

  drawPolygon(x, y, numSides, radius) {
    this.ctx.moveTo(x + radius, y);
    for (let i = 1; i <= numSides; i++) {
      this.ctx.lineTo(
        x + radius * Math.cos((2 * Math.PI * i) / numSides),
        y + radius * Math.sin((2 * Math.PI * i) / numSides)
      );
    }
  }

  async changeCentralNode(orbit, currentCentralNode, newCentralNode) {
    if (!this.defaultNodesInitialized || this.changeCentralNodeMode) {
      console.log(
        "Default nodes not initialized or already changing central node"
      );
      return;
    }
    this.changeCentralNodeMode = true;
    let prevVelocity = orbit.angularVelocity;
    orbit.angularVelocity = 0;
    setTimeout(() => {
      orbit.angularVelocity = prevVelocity;
      setTimeout(() => {
        this.changeCentralNodeMode = false;
        if (this.nextCentralNode) {
          console.log(
            "Queued node detected, changing central node to: ",
            this.nextCentralNode.name
          );
          setTimeout(() => {
            this.changeCentralNodeMode = false;
            if (this.nextCentralNode) {
              this.changeCentralNode(
                orbit,
                newCentralNode,
                this.nextCentralNode
              );
              this.nextCentralNode = null;
            }
          }, 500);
        }
      }, 500);
    }, 3000);

    let tempNode = new Node(
      0,
      0,
      currentCentralNode.size,
      currentCentralNode.shapeType,
      "black"
    );
    tempNode.visible = false;
    tempNode.affectedByCollision = false;

    if (currentCentralNode && tempNode) {
      if (orbit) {
        orbit.centralNode = tempNode;
        currentCentralNode.isResizing = true;
        currentCentralNode.isShrinking = true;
        currentCentralNode.newSize = this.defaultOuterSize;
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
                setTimeout(() => {
                  orbit.orbitingNodes.splice(
                    orbit.orbitingNodes.indexOf(newCentralNode),
                    1
                  );
                  updateOrbitingNodesRefAngles(this, orbit, 0);
                  setTimeout(() => {
                    orbit.centralNode = newCentralNode;
                    newCentralNode.orbits.push(orbit);
                    currentCentralNode.orbits = [];
                    tempNode = null;
                  }, 500);
                }, 500);
              }, 500);
            }, 1000);
          }, 500);
        }, 500);
      }
    } else {
      console.error("Invalid central node provided");
    }
  }

  addOrbitToNode(node) {
    node.addOrbit(this);
    this.draw();
  }

  removeOrbitFromNode(node, orbitIndex) {
    const orbit = node.orbits[orbitIndex];
    if (orbit) {
      orbit.orbitingNodes.forEach((orbitingNode) => {
        orbitingNode.inOrbit = false;
        orbitingNode.centralNode = null;
        orbitingNode.currentOrbit = null;
      });

      node.orbits.splice(orbitIndex, 1);
    }

    this.draw();
  }

  highlightNodeById(nodeId) {
    const node = this.nodes.find((node) => node.id === nodeId);
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
          const centralNode = addNode(
            canvasManager,
            centralSize,
            "rgba(210, 209, 205, 0.5)",
            null,
            "/Images/Nodes/HappyPrism/static.png",
            true,
            "Spectrum"
          );
          defaultNodes.push(centralNode);
          defaultNodes[0].dimension = "HappyPrism";
          defaultNodes[0].job = "Expert";
          if (centralNode) {
            centralNode.addOrbit(canvasManager);
          }
        } else {
          if (numNodesInitialized == 1) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(255, 225, 0, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Sol/static.png",
                true,
                "Sol"
              )
            );
            defaultNodes[1].dimension = "Spiritual";
            defaultNodes[1].job = "Guide";
          } else if (numNodesInitialized == 2) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(255, 154, 0, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Amber/static.png",
                true,
                "Amber"
              )
            );
            defaultNodes[2].dimension = "Mental";
            defaultNodes[2].job = "Mentor";
          } else if (numNodesInitialized == 3) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(240, 1, 1, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Red/static.png",
                true,
                "Red"
              )
            );
            defaultNodes[3].dimension = "Physical";
            defaultNodes[3].job = "Coach";
          } else if (numNodesInitialized == 4) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(182, 50, 206, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Violet/static.png",
                true,
                "Violet"
              )
            );
            defaultNodes[4].dimension = "Social";
            defaultNodes[4].job = "Specialist";
          } else if (numNodesInitialized == 5) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(50, 50, 255, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Jean/static.png",
                true,
                "Jean"
              )
            );
            defaultNodes[5].dimension = "Vocational";
            defaultNodes[5].job = "Consultant";
          } else if (numNodesInitialized == 6) {
            defaultNodes.push(
              addNode(
                canvasManager,
                outerSize,
                "rgba(50, 153, 50, 0.5)",
                defaultNodes[0].orbits[0],
                "/Images/Nodes/Ivy/static.png",
                true,
                "Ivy"
              )
            );
            defaultNodes[6].dimension = "Environmental";
            defaultNodes[6].job = "Enthusiast";
            this.defaultNodesInitialized = true;
            //console.log("Number of nodes in default orbit: ", defaultNodes[0].orbits[0].orbitingNodes.length);
          }
          this.numNodesInitialized++;
          this.lastInitializedTime = Date.now();
        }

        if (this.numNodesInitialized >= 7) {
          // Adjust this number based on your needs
          this.defaultNodesInitialized = true;
          //console.log("Default nodes initialized");
        }
      }
    }
  }

  updateOrbits() {
    let windowSizeOrbitRadiusMult = 1.5;
    let centralSize = this.defaultCentralSize;
    let outerSize = this.defaultOuterSize;
    if (this.isMobile) {
      windowSizeOrbitRadiusMult = 1;
    }
    for (let i = 0; i < this.nodes.length; i++) {
      let currentNode = this.nodes[i];
      if (currentNode.orbits.length > 0) {
        currentNode.size = centralSize;
        for (let j = 0; j < currentNode.orbits.length; j++) {
          let currentOrbit = currentNode.orbits[j];
          currentOrbit.radius =
            currentNode.size * windowSizeOrbitRadiusMult * (j + 1);
        }
      } else if (currentNode.inOrbit) {
        currentNode.size = outerSize;
      }
    }
  }
}

export default CanvasManager;
