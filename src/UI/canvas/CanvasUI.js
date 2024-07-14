import React, { useState, useEffect } from 'react';
import { drawDashboard } from '../dashboard/dashboard.js';
import { drawChat } from '../chat/chatai.js';
import NodeSelector from './NodeSelector.js';
import { Theme } from '../theme.js';


export function showCanvasUI(){
  const canvasUI = document.getElementById('uiMenus');
  canvasUI.style.display = 'block';
}
export function hideCanvasUI(){
  const canvasUI = document.getElementById('uiMenus');
  canvasUI.style.display = 'none';
}
const CanvasUI = ({ canvasManager }) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [theme, setTheme] = useState(new Theme());
  const [initializedNodeCount, setInitializedNodeCount] = useState(0);

  useEffect(() => {
    const updateNodeCount = () => {
      setInitializedNodeCount(canvasManager.defaultNodes.length);
      if (canvasManager.defaultNodes.length > 0 && !currentNode) {
        setCurrentNode(canvasManager.defaultNodes[0]);
        theme.updateThemeForNode(canvasManager.defaultNodes[0]);
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
    const handleDashboardClick = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      drawDashboard(canvasManager);
      hideCanvasUI();
    };
    const handleChatClick = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      drawChat(canvasManager);
      hideCanvasUI();
    };
  
    const dashboardButton = document.getElementById('dashboard-button');
    const chatButton = document.getElementById('chat-button');
  
    const addListeners = () => {
      dashboardButton?.addEventListener('click', handleDashboardClick);
      dashboardButton?.addEventListener('touchstart', handleDashboardClick, { passive: true });
      chatButton?.addEventListener('click', handleChatClick);
      chatButton?.addEventListener('touchstart', handleChatClick, { passive: true });
    };
  
    const removeListeners = () => {
      dashboardButton?.removeEventListener('click', handleDashboardClick);
      dashboardButton?.removeEventListener('touchstart', handleDashboardClick);
      chatButton?.removeEventListener('click', handleChatClick);
      chatButton?.removeEventListener('touchstart', handleChatClick);
    };
  
    if (initializedNodeCount > 0) {
      addListeners();
      return () => removeListeners();
    }
  }, [initializedNodeCount, canvasManager]);
  
  

  const handleSelectNode = (node) => {
    setCurrentNode(node);
    if(canvasManager.changeCentralNodeMode) {
      canvasManager.nextCentralNode = node;
    }else{
    canvasManager.changeCentralNode(canvasManager.orbits[0], canvasManager.orbits[0].centralNode, node);
    }
    theme.updateThemeForNode(node);
    setTheme(new Theme()); // Update the theme state to trigger a re-render with the new theme
  };

  useEffect(() => {
        const homeButton = document.getElementById('home-button');
        const letters = document.querySelectorAll('.app-name-letter');

        let letterAnimation;
        let logoAnimation;

        function animateLogo() {
          if (logoAnimation) logoAnimation.pause();
          logoAnimation = anime({
              targets: '#home-button img',
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
              targets: '#home-button img',
              translateY: 0,
              easing: 'spring(1, 80, 10, 0)',
              duration: 500,
              complete: () => {
                  anime.remove('#home-button img');
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
                  { value: theme.button_bg_color }, // BG Color
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
    }, [theme]);

  return (
    <div id="uiMenus" style={{ background: theme.default_canvas_background }}>
      <div id="top-bar" style={{ background: theme.default_menu_background }}>
        <div id="top-left" className="menuDiv">
          <button id="home-button" className="no-select">
            <img id="home-button-logo" src="/Images/UI/LogoDarkLargeNoBG.svg" alt="Home" />
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
          <button id="dashboard-button" className="activatable-button">
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
          <button id="chat-button" className="activatable-button">
            <img src="/Images/UI/chat-sparkle.svg" alt="Chat" />
          </button>
        </div>
      </div>
      <div id="modal" style={{ display: 'none' }}></div>
    </div>
  );
};

export default CanvasUI;
