import React, { useEffect, useRef, useState } from 'react';
import { loadDependencies } from './Dependencies/loadDependencies.js';
import { CanvasManager } from './UI/canvasManager/canvasManager.js';
import { initializeEventListeners } from './UI/eventManager.js';
import { physicsUpdate } from './UI/canvasManager/Physics/physics.js';
import { Theme } from './UI/theme.js';
import { drawChat } from './chatai.js';
import { drawDashboard } from './UI/dashboard/dashboard.js';

const App = () => {
  const canvasRef = useRef(null);
  const [canvasManager, setCanvasManager] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const toggleChat = () => {
    console.log('toggleChat');
    setShowChat(prevState => !prevState);
  };

  const toggleDashboard = () => {
    console.log('toggleDashboard');
    setShowDashboard(prevState => !prevState);
  };

  useEffect(() => {
    const theme = new Theme();
    theme.initTheme();

    if (canvasRef.current) {
      const newCanvasManager = new CanvasManager(canvasRef);
      newCanvasManager.toggleDashboard = toggleDashboard;
      newCanvasManager.toggleChat = toggleChat;
      setCanvasManager(newCanvasManager);

      newCanvasManager.initCanvas(theme);
      loadDependencies();

      
      // Set up animation loop
      const animate = () => {
        physicsUpdate(newCanvasManager);
        if (!newCanvasManager.defaultNodesInitialized) {
          newCanvasManager.initDefaultNodes(newCanvasManager);
        }
        newCanvasManager.draw();
        requestAnimationFrame(animate);
      };

      // Start the animation loop
      requestAnimationFrame(animate);

      // Clean up
      return () => {
        window.removeEventListener('resize', newCanvasManager.resizeCanvas);
        // Add any other cleanup needed
      };
    }
  }, []);

  useEffect(() => {
    if (canvasManager) {
      // Initialize event listeners after the UI is rendered
      initializeEventListeners(canvasManager);
    }
  }, [canvasManager]);

  useEffect(() => {
    if (showChat) {
      const chatPopup = document.getElementById('chat-popup');
      chatPopup.style.display = 'flex';
      drawChat('#chat-popup', toggleChat);
    } else {
      const chatPopup = document.getElementById('chat-popup');
      chatPopup.style.display = 'none';
      chatPopup.innerHTML = ''; 
    }
  }, [showChat]);

  
  useEffect(() => {
    if (showDashboard) {
      drawDashboard(canvasManager);
      document.getElementById('dashboard-popup').style.display = 'block';
    }
    else {
      document.getElementById('dashboard-popup').style.display = 'none';
      document.getElementById('dashboard-popup').innerHTML = '';
    }
  }, [showDashboard]);

  return (
    <div>
      <canvas ref={canvasRef} />
      {canvasManager && canvasManager.renderUI()}
      <div id="chat-popup" className="chat-ai" style={{ display: showChat ? 'block' : 'none' }}></div>
      <div id="dashboard-popup" style={{ display: showDashboard ? 'block' : 'none' }}></div>
    </div>
  );
};

export default App;