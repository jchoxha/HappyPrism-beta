import React, { useState, useEffect } from 'react';
import NodeSelector from './NodeSelector.js';

const CanvasUI = ({ canvasManager }) => {
  const [currentNode, setCurrentNode] = useState(canvasManager.defaultNodes[0]);
  const [nodesInitialized, setNodesInitialized] = useState(false);

  useEffect(() => {
    const checkInitialization = setInterval(() => {
      if (canvasManager.defaultNodesInitialized) {
        setNodesInitialized(true);
        clearInterval(checkInitialization);
      }
    }, 100);
    return () => clearInterval(checkInitialization);
  }, [canvasManager]);

  const handleSelectNode = (node) => {
    setCurrentNode(node);
    canvasManager.changeCentralNode(canvasManager.orbits[0], canvasManager.orbits[0].centralNode, node);
  };

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
          <button id="dashboard-button" className="activatable-button" onClick={canvasManager.toggleDashboard}>
            <img src="../Images/UI/dashboard.svg" alt="Dashboard" />
          </button>
        </div>
        <div id="lower-center">
          {nodesInitialized && (
            <NodeSelector
              nodes={canvasManager.defaultNodes}
              currentNode={currentNode}
              onSelectNode={handleSelectNode}
            />
          )}
        </div>
        <div id="lower-right">
          <button id="chat-button" className="activatable-button" onClick={canvasManager.toggleChat}>
            <img src="../Images/UI/chat-sparkle.svg" alt="Chat" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasUI;
