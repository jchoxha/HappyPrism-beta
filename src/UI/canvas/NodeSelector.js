import React, { useState, useEffect } from 'react';
import { useDimension } from '../DimensionContext';
import { Theme } from '../theme.js';

const NodeSelector = ({ canvasManager, currentNode, onSelectNode, initializedNodeCount }) => {
  const { currentDimension, setCurrentDimension, dimensionColors } = useDimension();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(currentNode);
  const [isDisabled, setIsDisabled] = useState(true);
  const nodes = canvasManager.defaultNodes;
  const theme = new Theme();

  useEffect(() => {
    setSelectedNode(currentNode);
  }, [currentNode]);

  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isOpen, selectedNode]);

  useEffect(() => {
    const checkDisabledState = () => {
      const newIsDisabled = !canvasManager.defaultNodesInitialized ||
        canvasManager.changeCentralNodeMode ||
        initializedNodeCount < 2;
      setIsDisabled(newIsDisabled);
    };

    checkDisabledState();
    const intervalId = setInterval(checkDisabledState, 100);
    return () => clearInterval(intervalId);
  }, [canvasManager, initializedNodeCount]);

  const handleNodeChange = (direction) => {
    if (!isDisabled) {
      const currentIndex = nodes.findIndex(n => n.name === currentNode.name);
      const newIndex = direction === 'next' 
        ? (currentIndex + 1) % nodes.length
        : (currentIndex - 1 + nodes.length) % nodes.length;
      const newNode = nodes[newIndex];
      onSelectNode(newNode);
      setCurrentDimension(newNode.name);
      if (newNode && newNode.dimensionName) {
        theme.updateThemeForNode({ dimensionName: newNode.name })
      }
    }
  };

  const handleNodeSelect = (e) => {
    const selectedName = e.target.value;
    const node = nodes.find(n => n.name === selectedName);
    setSelectedNode(node);
    onSelectNode(node);
    setCurrentDimension(node.name);
    if (node && node.dimensionName) {
      theme.updateThemeForNode({ dimensionName: node.name })
    }
    setIsOpen(false);
  };

  const openModal = () => {
    const modalContent =
      /* HTML */`
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Select an AI Agent</h3>
          <button id="close-button" class="close-button">
            <img src="/Images/UI/close.svg" alt="Close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="current-node-details">
            ${selectedNode ? `
              <img src="${selectedNode.image.src}" alt="${selectedNode.name}" class="node-image" />
              <div class="node-info">
                <div class="node-info-name"><h3>${selectedNode.name}</h3> </div>
                <p>${selectedNode.description}</p>
                <p><strong>Dimension:</strong> ${selectedNode.dimensionName}</p>
                <p><strong>Dimension Description:</strong> ${selectedNode.dimensionDescription}</p>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <select id="node-select">
            ${nodes.map(node => `
              <option value="${node.name}" ${node.name === selectedNode?.name ? 'selected' : ''}>
                ${node.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `/* */;
  
    const modalElement = document.getElementById('modal');
    modalElement.innerHTML = modalContent;
    modalElement.style.display = 'block';
  
    document.getElementById('node-select').addEventListener('change', handleNodeSelect);
    document.getElementById('close-button').addEventListener('click', () => setIsOpen(false));
  };

  const closeModal = () => {
    const modalElement = document.getElementById('modal');
    modalElement.innerHTML = '';
    modalElement.style.display = 'none';
  };

  return (
    <div className="dimension-theme-colored rounded-lg node-selector flex flex-row items-center justify-between px-2 border-4 border-black">
      <button
        className={`rounded-lg dimension-theme-colored transition-colors duration-200 p-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleNodeChange('prev')}
        disabled={isDisabled}
        style={{ 
          background: 'none'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <span 
        className={`flex rounded-lg items-center justify-center font-semibold dimension-theme-colored text-lg flex-grow text-center px-2 cursor-pointer ${canvasManager.changeCentralNodeMode ? 'changing-node' : ''}`}
        style={{ 
          background: 'none'
        }}
        onClick={() => setIsOpen(true)}
      >
        {currentNode.name}
      </span>
      <button
        className={`rounded-lg dimension-theme-colored transition-colors duration-200 p-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleNodeChange('next')}
        disabled={isDisabled}
        style={{ 
          background: 'none'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>
  );
};

export default NodeSelector;