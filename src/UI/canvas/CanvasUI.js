// CanvasUI.js
import React, { useState, useEffect, useRef } from 'react';
import Dashboard from '../dashboard/dashboard';
import { drawChat } from '../chat/chatai.js';
import NodeSelector from './NodeSelector.js';
import { Theme } from '../theme.js';
import { Link } from 'react-router-dom';
import { ca } from 'date-fns/locale';

export function showCanvasUI() {
  const canvasUI = document.getElementById('uiMenus');
  if(canvasUI){
    canvasUI.style.display = 'block';
  }
}

export function hideCanvasUI() {
  const canvasUI = document.getElementById('uiMenus');
  canvasUI.style.display = 'none';
}

const CanvasUI = ({ canvasManager }) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [theme, setTheme] = useState(new Theme());
  const [initializedNodeCount, setInitializedNodeCount] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const homeButtonRef = useRef(null);

  useEffect(() => {
    const updateNodeCount = () => {
      setInitializedNodeCount(canvasManager.defaultNodes.length);
      if (canvasManager.defaultNodes.length > 0 && !currentNode) {
        setCurrentNode(canvasManager.defaultNodes[0]);
        theme.updateThemeForNode({dimensionName: canvasManager.defaultNodes[0].name});
      }
    };

    const interval = setInterval(() => {
      updateNodeCount();
      if (canvasManager.defaultNodesInitialized) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [canvasManager, currentNode, theme]);

  useEffect(() => {
    const homeButton = homeButtonRef.current;
    if (!homeButton) return;

    const letters = homeButton.querySelectorAll('.app-name-letter');

    let letterAnimation;
    let logoAnimation;

    function animateLogo() {
      if (logoAnimation) logoAnimation.pause();
      logoAnimation = anime({
        targets: homeButton.querySelector('img'),
        translateY: [
          { value: -2.5, duration: 500 },
          { value: 0, duration: 500 },
          { value: 2.5, duration: 500 },
          { value: 0, duration: 500 },
        ],
        easing: 'linear',
        loop: true,
      });
    }

    function animateLogoBackToDefault() {
      if (logoAnimation) logoAnimation.pause();
      logoAnimation = anime({
        targets: homeButton.querySelector('img'),
        translateY: 0,
        easing: 'spring(1, 80, 10, 0)',
        duration: 500,
        complete: () => {
          anime.remove(homeButton.querySelector('img'));
        },
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
          { value: theme.button_bg_color }, // BG Color
        ],
        easing: 'linear',
        duration: 2500,
        loop: 1,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: function () {
          animateLetters();
        },
      });
    };

    const animateBackToBlack = () => {
      if (letterAnimation) letterAnimation.pause();
      letterAnimation = anime({
        targets: letters,
        color: '#000000',
        easing: 'linear',
        duration: 500,
        delay: anime.stagger(100, { start: 0, direction: 'normal' }),
        complete: () => {
          anime.remove(letters);
        },
      });
    };

    const handleMouseOver = () => {
      animateLogo();
      animateLetters();
    };

    const handleMouseOut = () => {
      animateLogoBackToDefault();
      animateBackToBlack();
    };

    homeButton.addEventListener('mouseover', handleMouseOver);
    homeButton.addEventListener('mouseout', handleMouseOut);

    return () => {
      homeButton.removeEventListener('mouseover', handleMouseOver);
      homeButton.removeEventListener('mouseout', handleMouseOut);
    };
  }, [theme]);

  const handleSelectNode = (node) => {
    setCurrentNode(node);
    if (canvasManager.changeCentralNodeMode) {
      canvasManager.nextCentralNode = node;
    } else {
      canvasManager.changeCentralNode(canvasManager.orbits[0], canvasManager.orbits[0].centralNode, node);
    }
    theme.updateThemeForNode({ dimensionName: node.name });
    setTheme(new Theme());
  };

  const handleDashboardNodeChange = (newNode) => {
    setCurrentNode(newNode);
    theme.updateThemeForNode({ dimensionName: newNode.name });
    setTheme(new Theme());
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if(canvasManager.defaultNodes.length > 0){
      setShowDashboard(true);
    }
  };

  const handleChatClick = (e) => {
    e.preventDefault();
    drawChat(canvasManager);
    hideCanvasUI();
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
    showCanvasUI();
  };

  return (
    <div>
      {showDashboard && (
        <Dashboard 
          canvasManager={canvasManager} 
          onClose={handleCloseDashboard} 
          onNodeChange={handleDashboardNodeChange}
        />
      )}
      <div id="uiMenus" style={{ 
        background: theme.default_canvas_background,
        display: showDashboard ? 'none' : 'block'  // Hide when dashboard is shown
      }}>
        <div id="top-bar" style={{ background: theme.default_menu_background }}>
          <div id="top-left" className="menuDiv">
            <Link to="/home" id="home-button" className="no-select" ref={homeButtonRef}>
              <img id="home-button-logo" src="/Images/UI/LogoDarkLargeNoBG.svg" alt="Home" />
              <span id="app-name">
                {'HappyPrism'.split('').map((letter, index) => (
                  <span key={index} className="app-name-letter">
                    {letter}
                  </span>
                ))}
              </span>
            </Link>
          </div>
          <div id="top-center"></div>
          <div id="top-right" className="menuDiv">
            <button id="search-button" className="activatable-button">
              <img src="/Images/UI/search.svg" alt="Search" />
            </button>
            <button id="options-menu-button" className="activatable-button">
              <img src="/Images/UI/menu.svg" alt="Options Menu" />
            </button>
            <button id="profile-button" className="activatable-button">
              <img src="/Images/UI/profile-circle.svg" alt="User Profile" className="circle-image" />
            </button>
          </div>
        </div>
        <div id="lower-bar-popups">
          <div id="lower-center-popup"></div>
        </div>
        <div id="lower-bar">
          <div id="lower-left">
            <button id="dashboard-button" className="activatable-button" onClick={handleDashboardClick}>
              <img src="/Images/UI/dashboard.svg" alt="Dashboard" />
            </button>
          </div>
          <div id="lower-center">
            {initializedNodeCount > 0 && (
              <NodeSelector
                canvasManager={canvasManager}
                currentNode={currentNode}
                onSelectNode={handleSelectNode}
                initializedNodeCount={initializedNodeCount}
              />
            )}
          </div>
          <div id="lower-right">
            <button id="chat-button" className="activatable-button" onClick={handleChatClick}>
              <img src="/Images/UI/chat-sparkle.svg" alt="Chat" />
            </button>
          </div>
        </div>
        <div id="modal" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
};

export default CanvasUI;
