import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MilestoneCardModal from './MilestoneCardModal';
import GoalPicker from './GoalPicker';
import { format, isPast } from 'date-fns';
import { use } from 'passport';

const goalTypes = [
  { value: 'challenge', label: 'Challenge', emoji: '🏆' },
  { value: 'habit', label: 'Habit', emoji: '📅' },
  { value: 'performance', label: 'Performance', emoji: '📊' },
  { value: 'project', label: 'Project', emoji: '🛠️' },
  { value: 'transformation', label: 'Transformation', emoji: '🔄' },
];

const JourneyMap = ({ data, onMapUpdate, goalName, existingGoals }) => {
  const [mapData, setMapData] = useState(data);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState([]);

  useEffect(() => {
    onMapUpdate(mapData);
  }, [mapData]);

  const formatDate = (date) => {
    return date ? format(new Date(date), 'PP') : 'Not set';
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'text-black';
    return isPast(new Date(deadline)) ? 'text-red-500' : 'text-black';
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
        return;
    }

    if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
    ) {
        return;
    }

    const items = Array.from(data);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setIsDragging(false);
    setMapData(items);
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleModalSave = (updatedMilestone) => {
    setMapData(
      mapData.map((milestone) =>
        milestone.id === updatedMilestone.id ? {
          ...updatedMilestone,
          status: updatedMilestone.status,
          startDate: updatedMilestone.startDate,
          completedDate: updatedMilestone.completedDate,
          hasDeadline: updatedMilestone.hasDeadline,
          deadline: updatedMilestone.deadline
        } : milestone
      )
    );
    setSelectedMilestone(null);
  };

  const handleModalCancel = () => {
    setSelectedMilestone(null);
  };

  const handleModalDelete = (milestoneToDelete) => {
    setMapData(mapData.filter((milestone) => milestone.id !== milestoneToDelete.id));
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
    setMapData([...mapData, newMilestone]);
  };

  const handleAddPreExistingGoalAsMilestone = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    const alreadyAddedGoalIds = mapData
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

    setMapData([...mapData, newMilestone]);
    setShowGoalPicker(false);
  };

  const handleGoalPickerCancel = () => {
    setShowGoalPicker(false);
  };

  const getMilestoneEmoji = (milestone) => {
    if (milestone.pre_existing_goal) {
      return milestone.pre_existing_goal.goal_emoji || '🏆';
    }
    return milestone.emoji || '🏆';
  };

  const getMilestoneStatus = (milestone) => {
    if (milestone.pre_existing_goal) {
      return `${milestone.pre_existing_goal.status}`;
    }
    return milestone.status || 'Not Yet Started';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Yet Started':
        return 'text-gray-500';
      case 'In Progress':
        return 'text-blue-500';
      case 'Completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
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

  const handleOrganizeMilestones = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    const statusOrder = ['Completed', 'In Progress', 'Not Yet Started'];
    const sortedMilestones = [...mapData].sort((a, b) => {
      const statusA = a.pre_existing_goal ? a.pre_existing_goal.status : a.status;
      const statusB = b.pre_existing_goal ? b.pre_existing_goal.status : b.status;
      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
    });
    setMapData(sortedMilestones);
  };

  const getGoalTypeInfo = (goalType) => {
    const type = goalTypes.find(t => t.value === goalType);
    return type ? `${type.label} Goal ${type.emoji}` : 'Goal';
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
              {mapData.map((milestone, index) => (
                <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-4 transition-none duration-300 ease-in-out ${isDragging ? 'z-50' : ''}`}
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
                        <div className="flex flex-col items-end">
                          <span className={`text-sm ${getStatusColor(getMilestoneStatus(milestone))}`}>
                            {getMilestoneStatus(milestone)}
                          </span>
                          {milestone.pre_existing_goal && (
                            <span className="text-sm text-gray-500 text-right">
                              (
                              {getGoalTypeInfo(milestone.pre_existing_goal.goal_type)})
                            </span>
                          )}
                          {milestone.deadline && (
                            <span className={`text-sm ${getDeadlineColor(milestone.deadline)}`}>
                              Deadline: {formatDate(milestone.deadline)}
                            </span>
                          )}
                        </div>
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
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => handleOrganizeMilestones(e)}
                  className="dimension-theme-colored font-bold py-2 px-4 rounded"
                >
                  Organize Milestones By Status
                </button>
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
        <div className="fixed !mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" style={{ margin: "0" }}>
          <GoalPicker
            goals={filteredGoals}
            onSelect={handleGoalPickerSelect}
            onCancel={() => setShowGoalPicker(false)}
          />
        </div>
      )}
    </div>
  );
};

export default JourneyMap;