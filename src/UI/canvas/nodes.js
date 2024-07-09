// nodes.js
// nodes.js
import { ShapeType } from '../../Misc/shapes.js';

//GLOBAL VARIABLES
const radiusMult = 1.5;

class Orbit {
  constructor(centralNode = null, orbitingNodes = [], radius = 100, angularVelocity = 0.005) {
    this.centralNode = centralNode;
    this.orbitingNodes = orbitingNodes;
    this.radius = radius;
    this.angularVelocity = angularVelocity;
    this.radiusMult = radiusMult;
    if(centralNode){
      this.centralSize = centralNode.size;
    } else{
      this.centralSize = 120;
    }
    this.outerSizeMult = .75;
  }

}

class Node {
  constructor(startingX, startingY, size, shapeType, fill = "randomColor", startingOrbit = null, imageSrc = null) {
    this.name = "New Node";
    this.description = "New Node Description";
    this.dimensionName = "New Node Dimension Name";
    this.dimensionDescription = "New Node Dimension Description";
    this.id = crypto.randomUUID();
    this.visible = true;

    //Positioning
    this.x = this.intendedX = this.fixedX = startingX;
    this.y = this.intendedY = this.fixedY = startingY;

    //Node Sizing
    this.size = this.newSize = size;
    this.isResizing = this.isGrowing = this.isShrinking = false;

    //Physics
    this.mass = size;
    this.vx = this.vy = 0; // Velocity in X and 
    this.positionFixed = true;
    this.positionOnDragStart = { x: 0, y: 0 };
    this.dragOffsetX = this.dragOffsetY = 0;
    this.angle = this.intendedAngle = this.refAngle = 0;
    this.affectedByCollision = true;
    

    //Orbits
    this.startingOrbit = null;
    this.inOrbit = false;
    if (startingOrbit) {
      this.inOrbit = true;
      this.positionFixed = false;
      this.currentOrbit = startingOrbit;
  }
    this.orbits = [];
    

    //Handle dragging and movement
    this.inMovementAfterBeingAdded = true;
    this.grabbed = this.dragging = this.inMovementAfterDragging = this.inMovementAfterCollision = false;

    //Node Visuals
    this.shapeType = shapeType;
    this.fill = fill;
    this.fillStyle = "solidColor";


    // Image
    this.image = new Image();
    if (imageSrc) {
      this.image.src = imageSrc+"static.png";
    }
  }
  
  addSelfToOrbit(canvasManager, orbit) {
    if (orbit) {
      orbit.orbitingNodes.push(this);
      this.currentOrbit = orbit;
      this.inOrbit = true;
      updateOrbitingNodesRefAngles(canvasManager, orbit, 0);
    } else {
      console.error('Invalid orbit provided');
    }
  }
  addOrbit(canvasManager) {
    canvasManager.nodeDetailsStaticContentInit = false;
    let orbit = new Orbit(this, [], this.size * radiusMult * (this.orbits.length + 1), 0.005);
    this.orbits.push(orbit);
    canvasManager.orbits.push(orbit);
    return orbit;
  }
}
export function addNode(canvasManager, starting_Size = 60, starting_Fill = "white", startingOrbit = null, image_Src = null, position_Fixed = false, nodeName = "New Node", starting_Position = { x: canvasManager.xCenter, y: canvasManager.yCenter }) {
  canvasManager.nodeDetailsStaticContentInit = false;
  if (!canvasManager.canvas || !canvasManager.canvas.width || !canvasManager.canvas.height) {
    console.error('Canvas or its dimensions are not set!');
    return null;
  }
  canvasManager.nodeDetailsStaticContentInit = false;
  if (!canvasManager.width || !canvasManager.height) {
    console.error('Canvas dimensions are not set!');
    return;
  }

  let startingSize = starting_Size;
  let startingShapeType = ShapeType.CIRCLE;
  let startingFill = starting_Fill;
  let startingPosition = starting_Position
  if(startingOrbit != null){
    const orbitingNodes = startingOrbit.orbitingNodes;
    const index = orbitingNodes.length;
    const angleStep = (2 * Math.PI) / (index + 1);
    const startingRefAngle = index * angleStep;
    const centerX = startingOrbit.centralNode.x;
    const centerY = startingOrbit.centralNode.y;
    startingPosition.x = centerX + startingOrbit.radius * Math.cos(startingRefAngle);
    startingPosition.y  = centerY + startingOrbit.radius * Math.sin(startingRefAngle);
  }
  const newNode = new Node(startingPosition.x, startingPosition.y, startingSize, startingShapeType, startingFill, startingOrbit, image_Src);
  
      newNode.positionFixed = position_Fixed;
      newNode.name = nodeName;

  if (startingOrbit) {
      newNode.addSelfToOrbit(canvasManager, startingOrbit);
  }

  //console.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  canvasManager.updateCanvas();
  return newNode;
}

//Set numChange to the number of nodes added or removed
export function updateOrbitingNodesRefAngles(canvasManager, orbit, numChange = 0) {
  const orbitingNodes = orbit.orbitingNodes;
  const angleStep = (2 * Math.PI) / (orbitingNodes.length + numChange);
  orbitingNodes.forEach((node, index) => {
    node.refAngle = index * angleStep;
  });
}



export { Node, Orbit };