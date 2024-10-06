import React, { useEffect, useRef, useState } from 'react';
import CanvasManager from './UI/canvas/canvasManager.js';
import { initializeEventListeners } from './UI/eventManager.js';
import { physicsUpdate } from './UI/canvas/Physics/physics.js';
import { Theme } from './UI/theme.js';
import CanvasUI from './UI/canvas/CanvasUI.js';
import { DimensionProvider } from './UI/DimensionContext.js';

const App = () => {
  const canvasRef = useRef(null);
  const [canvasManager, setCanvasManager] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const toggleChat = () => {
    setShowChat(prevState => !prevState);
  };

  const toggleApp = () => {
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

  // useEffect for setting up random gradient animation start points
  // useEffect(() => {
  //   const setRandomGradientOffsets = () => {
  //     const elements = document.querySelectorAll('.dimension-theme-colored');
  //     elements.forEach(element => {
  //       const randomOffset = Math.random();
  //       element.style.setProperty('--random-offset', randomOffset);
  //     });
  //   };

  //   // Initial setup
  //   setRandomGradientOffsets();

  //   // Set up a MutationObserver to handle dynamically added elements
  //   const observer = new MutationObserver((mutations) => {
  //     mutations.forEach((mutation) => {
  //       if (mutation.type === 'childList') {
  //         setRandomGradientOffsets();
  //       }
  //     });
  //   });

  //   observer.observe(document.body, { childList: true, subtree: true });

  //   // Cleanup function
  //   return () => observer.disconnect();
  // }, []);

  return (
    <DimensionProvider>
      <div>
        <canvas className="app-canvas" ref={canvasRef} />
        {canvasManager && <CanvasUI canvasManager={canvasManager} />}
        <div id="app-popup"></div>
        <div id="dashboard-popup"></div>
        <div id="chat-popup" className="chat-ai"></div>
      </div>
    </DimensionProvider>
  );
};

export default App;