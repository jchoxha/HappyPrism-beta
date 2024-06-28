
// eventManager.js

let CanvasManager = null;

export function setupEventListeners(canvasManager) {
    CanvasManager = canvasManager;
    
    if (!canvasManager.canvas) {
        console.error('Canvas is not available');
        return;
    }

    const events = ['mousedown', 'mouseup', 'mousemove', 'wheel'];
    const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];

    events.forEach(event => {
        canvasManager.canvas.addEventListener(event, (e) => handleEvent(e, canvasManager), { passive: false });
    });

    touchEvents.forEach(event => {
        canvasManager.canvas.addEventListener(event, (e) => handleTouchEvent(e, canvasManager), { passive: false });
    });

    document.addEventListener('mouseout', (event) => {
        if (!event.relatedTarget || event.relatedTarget.nodeName === "HTML") {
            handleMouseLeave(canvasManager);
        }
    });

    // Set up button event listeners
    setupButtonListeners();
}

function setupButtonListeners() {
    const buttons = {
        'home-button': handleHomeButtonClick,
        'search-button': handleSearchButtonClick,
        'options-menu-button': handleOptionsMenuButtonClick,
        'profile-button': handleProfileButtonClick,
        'dashboard-button': handleDashboardButtonClick,
        'chat-button': handleChatButtonClick,
        'prev-node-button': handlePrevNodeButtonClick,
        'next-node-button': handleNextNodeButtonClick
    };

    Object.entries(buttons).forEach(([id, clickHandler]) => {
        const button = document.getElementById(id);
        if (button) {
            if (id !== 'home-button') {
                button.addEventListener('mousedown', handleButtonMouseDown);
                button.addEventListener('mouseup', handleButtonMouseUp);
                button.addEventListener('mouseover', handleButtonMouseOver);
                button.addEventListener('mouseout', handleButtonMouseOut);
            } else {
                handleHomeButtonHover();
            }
            button.addEventListener('click', clickHandler);
        }
    });
}

function handleHomeButtonHover(){
    //Custom Hover For Home Button
    const homeButton = document.getElementById('home-button');
    const letters = document.querySelectorAll('.app-name-letter');

    if (!homeButton || letters.length === 0) {
        console.error('Home button or letters not found');
        return;
    }

    let letterAnimation;
    let logoAnimation;

    function animateLogo() {
    if (logoAnimation) logoAnimation.pause();
    logoAnimation = anime({
        targets: '#home-button-logo',
        translateY: [
            { value: -2.5, duration: 500 },
            { value: 0, duration: 500 },
            { value: 2.5, duration: 500 },
            { value: 0, duration: 500 }
        ],
        easing: 'linear',
        loop: true,
        
    });
    }

    function animateLogoBackToDefault() {
    if (logoAnimation) logoAnimation.pause();
    logoAnimation = anime({
        targets: '#home-button-logo',
        translateY: 0,
        easing: 'spring(1, 80, 10, 0)',
        duration: 500,
        complete: () => {
            anime.remove('#home-button-logo');
        }
    });
}

const animateLetters = () => {
if (letterAnimation) letterAnimation.pause();
letterAnimation = anime({
    targets: letters,
    color: [
        { value: '#FF0000' }, // Red
        { value: '#FF7F00' }, // Orange
        { value: '#FFFF00' }, // Yellow
        { value: '#00FF00' }, // Green
        { value: '#0000FF' }, // Blue
        { value: '#4B0082' }, // Indigo
        { value: '#9400D3' }, // Violet
        { value: '#f0f0f0' }, // BG Color
    ],
    easing: 'linear',
    duration: 2500,
    loop: 1,
    delay: anime.stagger(100, { start: 0, direction: 'normal' }),
    complete: function() {
        animateLetters();
    },
});
};

const animateBackToBlack = () => {
if (letterAnimation) letterAnimation.pause();
letterAnimation = anime({
    targets: letters,
    color:  '#000000',
    easing: 'linear',
    duration: 500,
    delay: anime.stagger(100, { start: 0, direction: 'normal' }),
    complete: () => {
        anime.remove(letters);
    }
});
};

homeButton.addEventListener('mouseover', () => {
animateLogo();
animateLetters();
});

homeButton.addEventListener('mouseout', () => {
animateLogoBackToDefault()
animateBackToBlack();
});
}


function handleButtonMouseDown(event) {
    const button = event.currentTarget;
    button.classList.add('button-overlay');
    
}

function handleButtonMouseUp(event) {
    const button = event.currentTarget;
    button.classList.remove('button-overlay');
}

function handleButtonMouseOver(event) {
    const button = event.currentTarget;
    if (!button.classList.contains('button-disabled') && !CanvasManager.isMobile) {
        button.classList.add('button-hover');
    } 
}

function handleButtonMouseOut(event) {
    const button = event.currentTarget;
    button.classList.remove('button-hover');
}

function handleAllButtonClick(event) {
    console.log("Button clicked: ", event.currentTarget.id);
    let buttons = null;
        buttons = document.querySelectorAll('.activatable-button');
        
    
    if (buttons != null) {
        buttons.forEach(btn => {
            if(btn != event.currentTarget){
                btn.classList.remove('button-active');
            }
            else{
                btn.classList.add('button-active');
            }
        });
       
        
    }
}

function handlePrevNodeButtonClick (event) {
    handleAllButtonClick(event);
    const button = event.currentTarget;
    if(!CanvasManager.changeCentralNodeMode){
        button.classList.add('button-active');
        const defaultNodes = CanvasManager.defaultNodes;
        const orbit = CanvasManager.orbits[0];
        const centralNode = orbit.centralNode;
        const indexOfCentralNode = defaultNodes.indexOf(centralNode);
        let prevNode = null;
        if(indexOfCentralNode == 0){
            prevNode = defaultNodes[defaultNodes.length - 1];
        }
        else{  
            prevNode = defaultNodes[indexOfCentralNode - 1];
        }
        CanvasManager.changeCentralNode(orbit, centralNode, prevNode);
    }

}

function handleNextNodeButtonClick (event) {
    handleAllButtonClick(event);
    const button = event.currentTarget;
    if(!CanvasManager.changeCentralNodeMode){
        button.classList.add('button-active');
        const defaultNodes = CanvasManager.defaultNodes;
        const orbit = CanvasManager.orbits[0];
        const centralNode = orbit.centralNode;
        const indexOfCentralNode = defaultNodes.indexOf(centralNode);
        let nextNode = null;
        if(indexOfCentralNode == defaultNodes.length - 1){
            nextNode = defaultNodes[0];
        }
        else{
            nextNode = defaultNodes[indexOfCentralNode + 1];
        }
        CanvasManager.changeCentralNode(orbit, centralNode, nextNode);
    }
}


function handleHomeButtonClick(event) {
}

function handleDashboardButtonClick(event) {
    handleAllButtonClick(event);
    const button = event.currentTarget;
    if (CanvasManager) {
        CanvasManager.toggleDashboard();
        button.classList.add('button-active');
    } 
}


function handleChatButtonClick(event) {
    handleAllButtonClick(event);
    if (CanvasManager) {
        CanvasManager.toggleChat();
        const button = event.currentTarget;
        button.classList.remove('button-active');
    } 
}


function handleSearchButtonClick (event) {
    handleAllButtonClick(event);
}

function handleOptionsMenuButtonClick (event) {
    handleAllButtonClick(event);
}

function handleProfileButtonClick (event) {
    handleAllButtonClick(event);
}




let initialPinchDistance = null;
let lastScale = 1;

function handleTouchEvent(event, canvasManager) {
    if (event.touches.length > 1) {
        // Handle pinch
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (event.type === 'touchmove') {
            if (initialPinchDistance != null) {
                const scaleRatio = distance / initialPinchDistance;
                const newScale = lastScale * scaleRatio;
                canvasManager.scale = Math.max(0.1, Math.min(newScale, 10)); // Adjust limits as necessary
                canvasManager.draw();
            }
        } else if (event.type === 'touchstart') {
            initialPinchDistance = distance;
            lastScale = canvasManager.scale;
        }

        event.preventDefault(); // Prevent the browser from doing its default pinch-to-zoom
    } else if (event.touches.length === 1 && event.type !== 'touchend' && event.type !== 'touchcancel') {
        // Normalize touch events to behave like mouse events for single touch
        const touch = event.touches[0];
        event.clientX = touch.clientX;
        event.clientY = touch.clientY;
        handleEvent(event, canvasManager);
    }

    if (event.type === 'touchend' || event.type === 'touchcancel') {
        initialPinchDistance = null;
        handleEnd(event, canvasManager);
    }
}

function handleEvent(event, canvasManager) {
    switch (event.type) {
        case 'mousedown':
        case 'touchstart':
            handleStart(event, canvasManager);
            break;
        case 'mouseup':
        case 'touchend':
            handleEnd(event, canvasManager);
            break;
        case 'mousemove':
        case 'touchmove':
            handleMove(event, canvasManager);
            break;
        case 'wheel':
            handleWheel(event, canvasManager);
            break;
    }
}
``

function handleStart(event, canvasManager) {

    //Deactivate all activatble buttons
    let buttons = null;
    buttons = document.querySelectorAll('.activatable-button');
    
    if (buttons != null) {
        buttons.forEach(btn => {
            btn.classList.remove('button-active');
        });
    }

    const { clientX, clientY } = event;
    const { offsetX, offsetY } = getOffsets(clientX, clientY, canvasManager.canvas);
    let nodeFound = false;
    canvasManager.mousePositionOnDown = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y }
    console.log("Mouse down at: ", canvasManager.mousePositionOnDown);

    
    for (let i = canvasManager.nodes.length - 1; i >= 0; i--) {
        const node = canvasManager.nodes[i];
        if (isMouseOver(offsetX, offsetY, node, canvasManager)) {
        if (canvasManager.highlightedNode != node) {
                canvasManager.highlightedNode = node;
                console.log("Node highlighted: ", node);

            }
            node.grabbed = true;
            canvasManager.mousePositionOnMoveStart.x = canvasManager.currentmousePos.x;
            canvasManager.mousePositionOnMoveStart.y = canvasManager.currentmousePos.y;
            nodeFound = true;
            return;  // Stop searching once a node is found
        }
    }


    // Log the state if no nodes are selected
    if (!nodeFound) {
        console.log("No node was selected");
        canvasManager.selectedNode = null;
        canvasManager.highlightedNode = null;
    }
}

function handleMove(event, canvasManager) {

    const { clientX, clientY } = event;
    const { offsetX, offsetY } = getOffsets(clientX, clientY, canvasManager.canvas);

    if (canvasManager.draggingCanvas) {
        const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveStart.x) * canvasManager.scale;
        const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveStart.y) * canvasManager.scale;
        canvasManager.translateX += dx;
        canvasManager.translateY += dy;
    } else {
        canvasManager.nodes.forEach(node => {
            if (node.grabbed) {
                node.dragging = true;
                node.inMovementAfterDragging = false;
                node.inMovementAfterCollision = false;
                node.inMovementAfterBeingAdded = false;
                if(node.orbits.length > 0){
                    node.orbits.forEach(orbit => {
                        orbit.orbitingNodes.forEach(orbitingNode => {
                            orbitingNode.inMovementAfterDragging = false;
                            orbitingNode.inMovementAfterCollision = false;
                            orbitingNode.inMovementAfterBeingAdded = false;
                        });
                    });
                }

                const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveLast.x);
                const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveLast.y);

                const newX = node.x + dx;
                const newY = node.y + dy;

                node.vx = (newX - node.x) / 1.75;
                node.vy = (newY - node.y) / 1.75;

                node.x = newX;
                node.y = newY;

                if (!node.positionFixed) {
                    node.intendedX = node.x;
                    node.intendedY = node.y;
                }
            }
        });
    }
    canvasManager.draw();
    canvasManager.mousePositionOnMoveLast.x = canvasManager.currentmousePos.x;
    canvasManager.mousePositionOnMoveLast.y = canvasManager.currentmousePos.y;
    canvasManager.mouseLastMoveTime = canvasManager.currentTime;
    updateMouseProperties(event, canvasManager);
}

function handleEnd(event, canvasManager) {
    canvasManager.mousePositionOnUp = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y };
    canvasManager.draggingCanvas = false;

    const now = canvasManager.currentTime;

    canvasManager.nodes.forEach(node => {
        node.grabbed = false;  
        if (node.dragging) {
            if (canvasManager.currentTime > canvasManager.mouseLastMoveTime) {
                console.log("Node velocity canceled because " + (canvasManager.currentTime - canvasManager.mouseLastMoveTime) + " < 300");
                node.vx = 0;
                node.vy = 0;
            }
            node.dragging = false;
            node.inMovementAfterDragging = true;
        }
    });
}







function updateMouseProperties(event, canvasManager) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    canvasManager.currentmousePos.x = (event.clientX - rect.left - canvasManager.translateX) / canvasManager.scale;
    canvasManager.currentmousePos.y = (event.clientY - rect.top - canvasManager.translateY) / canvasManager.scale;
    
}


function isMouseOver(mouseX, mouseY, node, canvasManager) {
    // Check if the mouse is over a node, assuming circular nodes for simplicity
    const adjustedX = (mouseX - canvasManager.translateX) / canvasManager.scale;
    const adjustedY = (mouseY - canvasManager.translateY) / canvasManager.scale;
    const dx = adjustedX - node.x;
    const dy = adjustedY - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < node.size / 2;
}

function handleWheel(event, canvasManager) {
    if (shouldPreventDefault(event, canvasManager)) {
        event.preventDefault();  // Prevent the page from scrolling
    }

}

// This function decides when to call preventDefault based on your specific logic
function shouldPreventDefault(event, canvasManager) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Add more conditions as needed to decide when to prevent default
    return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

function getOffsets(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top
    };
}

export function initializeEventListeners(canvasManager) {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setupEventListeners(canvasManager));
    } else {
        setupEventListeners(canvasManager);
    }
}

function handleMouseLeave(canvasManager) {
    console.log('Mouse left the window bounds');

    // Reset or stop any dragging or node movements
    canvasManager.nodes.forEach(node => {
        if (node.grabbed) {
            node.grabbed = false;
            node.dragging = false;
        }
        node.inMovementAfterDragging = false;
        node.inMovementAfterCollision = false;
        node.inMovementAfterBeingAdded = false;
    });

    // Optionally, you can reset some canvas properties or trigger a redraw
    canvasManager.draggingCanvas = false;
    canvasManager.selectedNode = null;
    canvasManager.highlightedNode = null;
    canvasManager.draw();
}



