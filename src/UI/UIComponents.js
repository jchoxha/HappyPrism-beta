import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

export const ProjectBoard = ({ lists, onCardClick }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourcelistIndex = lists.findIndex(col => col.title === source.droppableId);
      const destlistIndex = lists.findIndex(col => col.title === destination.droppableId);

      const sourcelist = lists[sourcelistIndex];
      const destlist = lists[destlistIndex];

      const sourceTasks = Array.from(sourcelist.tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      const destTasks = Array.from(destlist.tasks);
      destTasks.splice(destination.index, 0, movedTask);

      const newlists = [...lists];
      newlists[sourcelistIndex].tasks = sourceTasks;
      newlists[destlistIndex].tasks = destTasks;

      if (onCardClick) {
        onCardClick(newlists);
      }
    } else {
      const listIndex = lists.findIndex(col => col.title === source.droppableId);
      const list = lists[listIndex];

      const copiedTasks = Array.from(list.tasks);
      const [movedTask] = copiedTasks.splice(source.index, 1);
      copiedTasks.splice(destination.index, 0, movedTask);

      const newlists = [...lists];
      newlists[listIndex].tasks = copiedTasks;

      if (onCardClick) {
        onCardClick(newlists);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {lists.map((list, index) => (
          <Droppable key={list.title} droppableId={list.title}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex-shrink-0 w-64 bg-gray-100 rounded p-2"
              >
                <h3 className="font-bold mb-2">{list.title}</h3>
                {list.tasks.map((task, taskIndex) => (
                  <Draggable key={task.name} draggableId={task.name} index={taskIndex}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-2 mb-2 rounded shadow cursor-pointer"
                        onClick={() => onCardClick(task)}
                      >
                        <div className="task-name">{task.name} {task.emoji}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

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
