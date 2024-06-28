// --Physics.js-- //


//~~~~Global Properties~~~~//
const deceleration = 0.95;
const gravityStrength = 0.0025;

//~~~~Physics Functions~~~~//
function physicsUpdate(canvasManager) {
    const nodes = canvasManager.nodes;

    nodes.forEach(node => {
        if(node.isResizing && node.isGrowing || node.isShrinking){
            if(node.isGrowing && node.size < node.newSize){
                node.size += 0.5;
            }
            else if (node.isShrinking && node.size > node.newSize){
                node.size -= 0.5;
            }
            else{
                node.size = node.newSize;
                node.isResizing = false;
                node.isGrowing = false;
                node.isShrinking = false;
            }
        }
        if (Math.abs(node.vx) > Math.abs(node.vxMax)) {
            node.vxMax = node.vx;
        }
        if (Math.abs(node.vy) > Math.abs(node.vyMax)) {
            node.vyMax = node.vy;
        }

        let collisionDetected = false;
        collisionDetected = detectAndHandleCollisions(nodes, node);

        if (node.inOrbit) {
            if (canvasManager.selectedNode == null && canvasManager.allowOrbitSpin) {
                    node.refAngle += node.currentOrbit.angularVelocity;
                    if(node.refAngle > 2 * Math.PI){
                        const orbit = node.currentOrbit;
                        const orbitingNodes = orbit.orbitingNodes;
                        const currentNode = orbitingNodes.splice(orbitingNodes.indexOf(node), 1)[0];
                        // Add the item to the beginning of the array
                        orbitingNodes.unshift(currentNode);
                    }
                    node.refAngle %= 2 * Math.PI;
            }
                //Controlls the placement of the nodes in the orbit
                const centerX = node.currentOrbit.centralNode.x;
                const centerY = node.currentOrbit.centralNode.y;
                node.fixedX = centerX + node.currentOrbit.radius * Math.cos(node.refAngle);
                node.fixedY  = centerY + node.currentOrbit.radius * Math.sin(node.refAngle);
        }

        if(node.inMovementAfterBeingAdded) {
            if(node.inOrbit) {
            const expectedVx = -node.currentOrbit.angularVelocity * (node.fixedY - node.currentOrbit.centralNode.y);
            const expectedVy = node.currentOrbit.angularVelocity * (node.fixedX - node.currentOrbit.centralNode.x);
            
            if (Math.abs(node.vx - expectedVx) < 0.01 && Math.abs(node.vy - expectedVy) < 0.01) {
                if (node.positionFixed) {
                    node.x = node.fixedX;
                    node.y = node.fixedY;
                } else {
                    node.intendedX = node.x;
                    node.intendedY = node.y;
                }
                node.vx = expectedVx;
                node.vy = expectedVy;
            }
                node.inMovementAfterBeingAdded = false;
                console.log("Movement after being added complete for: " + node);
            }
            else{
                if(Math.abs(node.x - node.fixedX) < 0.01 && Math.abs(node.y - node.fixedY) < 0.01){
                    node.vx = 0;
                    node.vy = 0;
                    node.inMovementAfterBeingAdded = false;
                    console.log("Movement after being added complete for: " + node);
                }
            }
        }

        // If this node is being dragged, or if this node has a central node and that node is being dragged, do not further simulate physics
        if (!node.dragging) {
                // Apply velocity to position
                node.x += node.vx;
                node.y += node.vy;

                // Apply gravitational force if the position is fixed
                if (node.positionFixed) {
                    applyGravitationalForce(node);
                }
                // Apply deceleration to velocity
                node.vx *= deceleration;
                node.vy *= deceleration;
                return;
        }
        if (node.inOrbit && node.currentOrbit.centralNode.dragging){
            if(node.currentOrbit.centralNode.dragging){
                const centerX = node.currentOrbit.centralNode.x;
                const centerY = node.currentOrbit.centralNode.y;
                node.intendedX = centerX + node.currentOrbit.radius * Math.cos(node.refAngle);
                node.intendedY = centerY + node.currentOrbit.radius * Math.sin(node.refAngle);
                node.x = lerp(node.x, node.intendedX, 0.2);  // Increase the lerp factor for faster response
                node.y = lerp(node.y, node.intendedY, 0.2);  // Increase the lerp factor for faster response
            }
        }
    });
}





function applyGravitationalForce(node) {
    const distanceX = node.fixedX - node.x;
    const distanceY = node.fixedY - node.y;

    // Calculate the force based on distance
    const forceX = distanceX * gravityStrength;
    const forceY = distanceY * gravityStrength;

    // Apply the force to the node's velocity
    node.vx += forceX;
    node.vy += forceY;
}


function detectAndHandleCollisions(nodes, currentNode) {
    let collisionOccurred = false;
    nodes.forEach(node => {
        if (node!= currentNode){
            if (!node.affectedByCollision || !currentNode.affectedByCollision)
                {
                    console.log("No collision because affectedByCollision is true for either: " + currentNode + " or " + node)
                   return;
                }
            if (checkCollision(currentNode, node)) {
            console.log("Collision detected between: " + currentNode + " and " + node);
            handleCollision(currentNode, node);
                collisionOccurred = true; 
            }
        }
    });
    return collisionOccurred;
}

function handleCollision(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = (node1.size / 2) + (node2.size / 2);

    // Calculate overlap
    const overlap = totalRadius - distance;
    if (overlap <= 0) return;

    // Ensure separation strength is sufficient to prevent re-collision
    const displacementX = (overlap * (dx / distance));
    const displacementY = (overlap * (dy / distance));

    // Calculate mass based on node size
    const mass1 = node1.mass;
    const mass2 = node2.mass;
    const totalMass = mass1 + mass2;

    // Calculate relative velocity
    const relVelX = node1.vx - node2.vx;
    const relVelY = node1.vy - node2.vy;

    // Calculate impulse scalar
    const normalX = dx / distance;
    const normalY = dy / distance;
    const relVelAlongNormal = relVelX * normalX + relVelY * normalY;
    const restitution = 1; // Elastic collision
    const impulseScalar = (2 * relVelAlongNormal) / (1 / mass1 + 1 / mass2);

    // Apply impulse to nodes
    node1.vx -= (impulseScalar * normalX) / mass1;
    node1.vy -= (impulseScalar * normalY) / mass1;
    node2.vx += (impulseScalar * normalX) / mass2;
    node2.vy += (impulseScalar * normalY) / mass2;

    // Apply displacement to avoid overlapping and ensure an immediate bounce
    if (!node1.dragging && !node1.isResizing) {
        node1.inMovementAfterCollision = true;
        node1.x += displacementX / 2;
        node1.y += displacementY / 2;
    }
    if (!node2.dragging && !node2.isResizing) {
        node2.inMovementAfterCollision = true;
        node2.x -= displacementX / 2;
        node2.y -= displacementY / 2;
    }

    // Correction to ensure nodes are not stuck together
    const correctionFactor = 0.5; // Adjust this value for better results
    const correctionX = (correctionFactor * displacementX) / (1 / mass1 + 1 / mass2);
    const correctionY = (correctionFactor * displacementY) / (1 / mass1 + 1 / mass2);
    if (!node1.dragging && !node1.isResizing) {
        node1.x += correctionX / mass1;
        node1.y += correctionY / mass1;
    }
    if (!node2.dragging && !node2.isResizing) {
        node2.x -= correctionX / mass2;
        node2.y -= correctionY / mass2;
    }

    // Apply additional iterations if needed
    for (let i = 0; i < 5; i++) {
        const newDx = node1.x - node2.x;
        const newDy = node1.y - node2.y;
        const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);
        const newOverlap = totalRadius - newDistance;
        if (newOverlap <= 0) break;

        const newDisplacementX = (newOverlap * (newDx / newDistance)) / 2;
        const newDisplacementY = (newOverlap * (newDy / newDistance)) / 2;
        if (!node1.dragging && !node1.isResizing) {
            node1.x += newDisplacementX;
            node1.y += newDisplacementY;
        }
        if (!node2.dragging && !node2.isResizing) {
            node2.x -= newDisplacementX;
            node2.y -= newDisplacementY;
        }
    }
}


//~~~~Collision Functions~~~~//

function checkCollision(node1, node2) {
    const shape1 = node1.shapeType;
    const shape2 = node2.shapeType;

    if (shape1.name === 'circle' && shape2.name === 'circle') {
        return circleCircleCollision(node1, node2);
    } else if ((shape1.name === 'circle' && shape2.isPolygon) || (shape2.name === 'circle' && shape1.isPolygon)) {
        return circlePolygonCollision(node1, node2);
    } else if (shape1.isPolygon && shape2.isPolygon) {
        return polygonPolygonCollision(node1, node2);
    } else {
        return boundingCircleCollision(node1, node2);  // Default check for undefined or complex shapes
    }
}


function isOverCircle(x, y, node) {
    const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    return distance < node.size / 2;
}

function isOverPolygon(x, y, node) {
    const numSides = node.shapeType.numSides;
    const radius = node.size / 2;
    let inside = false;
    for (let i = 0, j = numSides - 1; i < numSides; j = i++) {
        const xi = node.x + radius * Math.cos(2 * Math.PI * i / numSides + node.angle);
        const yi = node.y + radius * Math.sin(2 * Math.PI * i / numSides + node.angle);
        const xj = node.x + radius * Math.cos(2 * Math.PI * j / numSides + node.angle);
        const yj = node.y + radius * Math.sin(2 * Math.PI * j / numSides + node.angle);

        const intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}


function pointInPolygon(point, polygon) {
    let isInside = false;
    const numPoints = polygon.length;
    let j = numPoints - 1;
    for (let i = 0; i < numPoints; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}



function circleCircleCollision(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const totalSizeOfNodes = node1.size + node2.size;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const totalRadius = totalSizeOfNodes / 2;

    return distance < totalRadius;
}

function circlePolygonCollision(circleNode, polygonNode) {
    // Ensure the first node is always the circle for simplicity
    if (!isPolygon(polygonNode.shapeType.name)) {
        [circleNode, polygonNode] = [polygonNode, circleNode];
    }
    const numSides = polygonNode.shapeType.numSides;
    const radius = polygonNode.size / 2;
    const circleRadius = circleNode.size / 2;

    // Check if circle's center is inside the polygon (using isOverPolygon)
    if (isOverPolygon(circleNode.x, circleNode.y, polygonNode)) {
        return true;
    }

    // Check distance from circle center to each polygon edge
    for (let i = 0, j = numSides - 1; i < numSides; j = i++) {
        const xi = polygonNode.x + radius * Math.cos(2 * Math.PI * i / numSides + polygonNode.angle);
        const yi = polygonNode.y + radius * Math.sin(2 * Math.PI * i / numSides + polygonNode.angle);
        const xj = polygonNode.x + radius * Math.cos(2 * Math.PI * j / numSides + polygonNode.angle);
        const yj = polygonNode.y + radius * Math.sin(2 * Math.PI * j / numSides + polygonNode.angle);

        if (pointToSegmentDistance(circleNode.x, circleNode.y, xi, yi, xj, yj) < circleRadius) {
            return true;
        }
    }
    return false;
}


function polygonPolygonCollision(node1, node2) {
    const vertices1 = getPolygonVertices(node1);
    const vertices2 = getPolygonVertices(node2);

    // Check all axes of both polygons
    return checkSATCollision(vertices1, vertices2) && checkSATCollision(vertices2, vertices1);
}

function getPolygonVertices(node) {
    const vertices = [];
    const numSides = node.shapeType.numSides;
    const radius = node.size / 2;
    for (let i = 0; i < numSides; i++) {
        const angle = 2 * Math.PI * i / numSides + node.angle;
        const x = node.x + radius * Math.cos(angle);
        const y = node.y + radius * Math.sin(angle);
        vertices.push({ x, y });
    }
    return vertices;
}

function checkSATCollision(vertices1, vertices2) {
    for (let i = 0; i < vertices1.length; i++) {
        // Get the normal of the current edge
        const currentVertex = vertices1[i];
        const nextVertex = vertices1[(i + 1) % vertices1.length];
        const edge = {
            x: nextVertex.x - currentVertex.x,
            y: nextVertex.y - currentVertex.y
        };
        const normal = { x: -edge.y, y: edge.x };

        const projection1 = projectVertices(vertices1, normal);
        const projection2 = projectVertices(vertices2, normal);
        
        // Check if there is a gap between the projections
        if (projection1.max < projection2.min || projection2.max < projection1.min) {
            return false; // No collision
        }
    }
    return true; // Collision detected
}

function projectVertices(vertices, axis) {
    let min = dotProduct(vertices[0], axis);
    let max = min;
    for (const vertex of vertices) {
        const projection = dotProduct(vertex, axis);
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }
    return { min, max };
}

function dotProduct(point, axis) {
    return point.x * axis.x + point.y * axis.y;
}

function boundingCircleCollision(node1, node2) {
    // Simple bounding circle collision check for complex shapes
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = (node1.size + node2.size) / 2;
    return distance < totalRadius;
}

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
    const dx = ax + h * bax - px, dy = ay + h * bay - py;
    return Math.sqrt(dx * dx + dy * dy);
}

//~~~~Movement~~~~//
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function lerpAngle(start, end, amt) {
    
    start += amt;
    start %= 2 * Math.PI;
    // let difference = end - start;
    // difference = ((difference + Math.PI) % (2 * Math.PI)) - Math.PI; // Normalize difference to be within -π to π
    // return start + difference * amt;
    return start;
  }

module.exports = { physicsUpdate };
