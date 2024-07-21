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

  const handleNodeSelect = (e) => {
    const selectedName = e.target.value;
    const node = nodes.find(n => n.name === selectedName);
    setSelectedNode(node);
    onSelectNode(node);
    setCurrentDimension(node.name); // Update the current dimension when a new node is selected
    if (node && node.dimensionName) {
      theme.updateThemeForNode(node);
    }
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
    <div className="node-selector">
      {initializedNodeCount > 0 && (
        <>
          <div id="current-node-div" className="mb-4">
            <button
              id="prev-node-button"
              className="node-nav-button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  const currentIndex = nodes.findIndex(n => n.name === currentNode.name);
                  const prevIndex = (currentIndex - 1 + nodes.length) % nodes.length;
                  const prevNode = nodes[prevIndex];
                  onSelectNode(prevNode);
                  setCurrentDimension(prevNode.name); // Update the current dimension when a new node is selected
                  if (prevNode && prevNode.dimensionName) {
                    theme.updateThemeForNode(prevNode);
                  }
                }
              }}
            >
              <img src="/Images/UI/left.svg" alt="Previous Node" />
            </button>
            <span id="current-node" className={`current-node-text ${canvasManager.changeCentralNodeMode ? 'changing-node' : ''}`}>
              {currentNode.name}
            </span>
            <button
              id="next-node-button"
              className="node-nav-button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  const currentIndex = nodes.findIndex(n => n.name === currentNode.name);
                  const nextIndex = (currentIndex + 1) % nodes.length;
                  const nextNode = nodes[nextIndex];
                  onSelectNode(nextNode);
                  setCurrentDimension(nextNode.name); // Update the current dimension when a new node is selected
                  if (nextNode && nextNode.dimensionName) {
                    theme.updateThemeForNode(nextNode);
                  }
                }
              }}
            >
              <img src="/Images/UI/right.svg" alt="Next Node" />
            </button>
          </div>
          <button
            disabled={!canvasManager.defaultNodesInitialized}
            onClick={() => {
              console.log('view ai agents');
              setIsOpen(true);
            }}
            id="view-ai-agents-button"
          >
            <img src="/Images/UI/nodes_color.svg" alt="View All AI Agents" className="ai-agents-icon" />
          </button>
        </>
      )}
    </div>
  );
};

export default NodeSelector;
