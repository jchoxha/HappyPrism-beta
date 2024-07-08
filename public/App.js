import React, { useEffect, useRef, useState } from 'react';
import { loadDependencies } from './Dependencies/loadDependencies.js';
import CanvasManager from './UI/canvas/canvasManager.js';
import { initializeEventListeners } from './UI/eventManager.js';
import { physicsUpdate } from './UI/canvas/Physics/physics.js';
import { Theme } from './UI/theme.js';
import CanvasUI from './UI/canvas/CanvasUI.js';

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

    if (canvasRef.current) {
      const newCanvasManager = new CanvasManager(canvasRef);
      newCanvasManager.toggleDashboard = toggleDashboard;
      newCanvasManager.toggleChat = toggleChat;
      setCanvasManager(newCanvasManager);

      newCanvasManager.initCanvas(theme);
      loadDependencies();

      const animate = () => {
        physicsUpdate(newCanvasManager);
        if (!newCanvasManager.defaultNodesInitialized) {
          newCanvasManager.initDefaultNodes(newCanvasManager);
        }
        newCanvasManager.draw();
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', newCanvasManager.resizeCanvas);
      };
    }
  }, []);

  useEffect(() => {
    if (canvasManager) {
      initializeEventListeners(canvasManager);
    }
  }, [canvasManager]);

  return (
    <div>
      <canvas ref={canvasRef} />
      {canvasManager && <CanvasUI canvasManager={canvasManager} />}
      <div id="dashboard-popup"></div>
      <div id="chat-popup" className="chat-ai"></div>
    </div>
  );
};

export default App;
