import React, { useEffect, useRef, useState } from 'react';
import CanvasManager from './UI/canvas/canvasManager.js';
import { initializeEventListeners } from './UI/eventManager.js';
import { physicsUpdate } from './UI/canvas/Physics/physics.js';
import { Theme } from './UI/theme.js';
import CanvasUI from './UI/canvas/CanvasUI.js';

const App = () => {
  const canvasRef = useRef(null);
  const [canvasManager, setCanvasManager] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const toggleChat = () => {
    console.log('toggleChat');
    setShowChat(prevState => !prevState);
  };

  const toggleApp = () => {
    console.log('toggleApp');
    setShowApp(prevState => !prevState);
  };

  useEffect(() => {
    const theme = new Theme();

    if (canvasRef.current) {
      const newCanvasManager = new CanvasManager(canvasRef);
      newCanvasManager.toggleApp = toggleApp;
      newCanvasManager.toggleChat = toggleChat;
      setCanvasManager(newCanvasManager);

      newCanvasManager.initCanvas(theme);

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
      <canvas className="app-canvas" ref={canvasRef} />
      {canvasManager && <CanvasUI canvasManager={canvasManager} />}
      <div id="app-popup"></div>
      <div id="chat-popup" className="chat-ai"></div>
    </div>
  );
};

export default App;
