import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

export const CardHeader = ({ children }) => (
  <div className="px-4 py-5 border-b border-gray-200">{children}</div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900 font-bold">{children}</h3>
);

export const CardContent = ({ children }) => (
  <div className="px-4 py-5">{children}</div>
);

export const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    // className={`dimension-theme-colored ${className}`}
  >
    {children}
  </button>
);

export const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

export const Dialog = ({ open, onOpenChange, children }) => (
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6">
        {children}
        <button onClick={() => onOpenChange(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">
          Close
        </button>
      </div>
    </div>
  ) : null
);

export const DialogContent = ({ children }) => (
  <div className="mt-4">
    {children}
  </div>
);

export const DialogHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-bold">
    {children}
  </h2>
);


// Simple icon components
export const PlusCircle = () => <span>+</span>;
export const CheckCircle = () => <span>✅</span>;
export const Star = () => <span>⭐</span>;
export const PlayButton = () => <span>▶️</span>;
export const Circle = () => <span>⭕</span>;
export const ArrowRight = () => <span>→</span>;
export const Clock = () => <span>🕒</span>;
export const Calendar = () => <span>📅</span>;
export const TrendingUp = () => <span>📈</span>;
export const Trello = () => <span>📋</span>;
