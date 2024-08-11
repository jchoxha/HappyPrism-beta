import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MilestoneCardModal from './MilestoneCardModal';
import GoalPicker from './GoalPicker';

const JourneyMap = ({ milestones, setMilestones, goalName, existingGoals }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState([]);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMilestones(items);
    setIsDragging(false);
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleModalSave = (updatedMilestone) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === updatedMilestone.id ? updatedMilestone : milestone
      )
    );
    setSelectedMilestone(null);
  };

  const handleModalCancel = () => {
    setSelectedMilestone(null);
  };

  const handleModalDelete = (milestoneToDelete) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== milestoneToDelete.id));
    setSelectedMilestone(null);
  };

  const handleAddNewMilestone = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    const newMilestone = {
      id: Date.now().toString(),
      name: 'New Milestone',
      emoji: '🏅',
      status: 'Not Yet Started',
      startDate: null,
      completedDate: null,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleAddPreExistingGoalAsMilestone = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    const alreadyAddedGoalIds = milestones
      .filter(m => m.pre_existing_goal)
      .map(m => m.pre_existing_goal.id);
    
    const availableGoals = existingGoals.filter(goal => 
      !alreadyAddedGoalIds.includes(goal.id)
    );

    setFilteredGoals(availableGoals);
    setShowGoalPicker(true);
  };

  const handleGoalPickerSelect = (selectedGoal) => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      name: selectedGoal.goal_name,
      emoji: selectedGoal.goal_emoji,
      status: selectedGoal.status,
      startDate: selectedGoal.goal_startDate,
      completedDate: selectedGoal.goal_completedDate,
      deadline: selectedGoal.goal_deadline,
      pre_existing_goal: selectedGoal
    };

    setMilestones([...milestones, newMilestone]);
    setShowGoalPicker(false);
  };

  const handleGoalPickerCancel = () => {
    setShowGoalPicker(false);
  };

  // Add the missing functions
  const getMilestoneEmoji = (milestone) => {
    if (milestone.pre_existing_goal) {
      return milestone.pre_existing_goal.goal_emoji || '🏆';
    }
    return milestone.emoji || '🏆';
  };

  const getMilestoneStatus = (milestone) => {
    if (milestone.pre_existing_goal) {
      return `${milestone.pre_existing_goal.status} (Pre-Existing Goal)`;
    }
    return milestone.status || 'Not Yet Started';
  };

  const ArrowSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const renderGoalName = (name) => {
    if (name && name.length > 0) {
      return <span className="italic">"{name}"</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center space-y-4 my-6 border border-gray-300 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Your Challenge Goal Journey Map 🗺️</h2>
      <div className="flex justify-center space-x-4 mb-4">
        <button 
          onClick={(e) => handleAddNewMilestone(e)}
          className="dimension-theme-colored font-bold py-2 px-4 rounded"
        >
          Add New Milestone
        </button>
        <button 
          onClick={(e) => handleAddPreExistingGoalAsMilestone(e)}
          className="dimension-theme-colored font-bold py-2 px-4 rounded"
        >
          Add Pre-Existing Goal As Milestone
        </button>
      </div>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="milestones">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="w-full">
              <div className="mb-4 bg-gray-100 p-4 rounded-lg">
                <div className="text-center font-bold">
                👍 Start of {renderGoalName(goalName)} Challenge Goal 
                </div>
              </div>
              <div className="flex justify-center mt-2 mb-4 transition-opacity duration-300">
                <ArrowSVG />
              </div>
              {milestones.map((milestone, index) => (
                <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-4 transition-all duration-300 ease-in-out ${isDragging ? 'z-50' : ''}`}
                    >
                      <div
                        className={`bg-white border border-gray-300 rounded-lg p-4 shadow-sm cursor-pointer text-center ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                        onClick={() => handleMilestoneClick(milestone)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{getMilestoneEmoji(milestone)}</span>
                          <span className="flex-grow text-left ml-4">{milestone.name}</span>
                          <span className="text-sm text-gray-500">
                            {getMilestoneStatus(milestone)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-center mt-2 transition-opacity duration-300">
                        <ArrowSVG />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                <div className="text-center font-bold">
                🏆 Completion of {renderGoalName(goalName)} Challenge Goal 
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedMilestone && (
        <MilestoneCardModal
          milestone={selectedMilestone}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          onDelete={handleModalDelete}
        />
      )}

      {showGoalPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <GoalPicker
            goals={filteredGoals}
            onSelect={handleGoalPickerSelect}
            onCancel={handleGoalPickerCancel}
          />
        </div>
      )}
    </div>
  );
};

export default JourneyMap;