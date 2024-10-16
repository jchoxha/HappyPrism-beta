import React from 'react';
import MovementCompanion from './tools/movementCompanion/MovementCompanion.js';

const ToolsPage = ({ onToolOpen }) => {
  const tools = [
    { name: "Movement Companion", component: <MovementCompanion />, emoji: "🏃‍♂️", dimension: "Physical" },
    // Add more tools here as they are implemented
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wellness Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div 
            key={tool.name} 
            className={`p-4 rounded-lg bg-red-200 cursor-pointer hover:shadow-lg transition-shadow duration-200`}
            onClick={() => onToolOpen(tool.component)}
          >
            <h2 className="text-xl font-bold">{tool.emoji} {tool.name}</h2>
            <p>Dimension: {tool.dimension}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;