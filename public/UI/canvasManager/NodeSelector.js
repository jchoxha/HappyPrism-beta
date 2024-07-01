import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '../UIComponents.js';

const NodeSelector = ({ nodes, currentNode, onSelectNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    (nodes && currentNode && onSelectNode) ? (
      <div className="flex flex-col items-center">
        <div id="current-node-div" className="mb-4">
          <button id="prev-node-button">
            <img src="/Images/UI/left.svg" alt="Previous Node" />
          </button>
          <span id="current-node">{currentNode.name}</span>
          <button id="next-node-button">
            <img src="/Images/UI/right.svg" alt="Next Node" />
          </button>
        </div>
        
        <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
          <img src="/Images/UI/nodes.svg" alt="View All Nodes" className="w-5 h-5" />
          <span>View All Nodes</span>
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogHeader>
            <DialogTitle>Select a Node</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    onSelectNode(node);
                    setIsOpen(false);
                  }}
                >
                  <img src={node.imageSrc} alt={node.name} className="w-10 h-10 rounded-full" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{node.name}</span>
                    <span className="text-sm text-gray-500">{node.dimension}</span>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    ) : null
  );
};

export default NodeSelector;
